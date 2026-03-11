// ─── API Client ───────────────────────────────────────────────────────────────
// Base fetch wrapper with credentials, token refresh, and structured errors.

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api';

const TOKEN_KEY = 'dbcas_auth_token';
const USER_KEY = 'dbcas_user';

export const setToken = (token: string) => localStorage.setItem(TOKEN_KEY, token);
export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

// ─── Structured API Error ─────────────────────────────────────────────────────
export class ApiError extends Error {
    code: string;
    status: number;
    fieldErrors?: Record<string, string>;

    constructor(code: string, message: string, status: number, fieldErrors?: Record<string, string>) {
        super(message);
        this.name = 'ApiError';
        this.code = code;
        this.status = status;
        this.fieldErrors = fieldErrors;
    }
}

// ─── Request Options ──────────────────────────────────────────────────────────
interface RequestOptions extends RequestInit {
    params?: Record<string, string>;
    _retry?: boolean;
}

// ─── Core Request Function ────────────────────────────────────────────────────
async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { params, _retry, ...fetchOptions } = options;

    let url = `${BASE_URL}${endpoint}`;
    if (params) {
        url += '?' + new URLSearchParams(params).toString();
    }

    const token = getToken();
    const response = await fetch(url, {
        ...fetchOptions,
        credentials: 'include', // Send httpOnly cookies (refresh token)
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            ...fetchOptions.headers,
        },
    });

    // ── 401 → Attempt token refresh (once) ────────────────────────────────
    if (response.status === 401 && !_retry) {
        // Skip refresh for auth endpoints themselves
        if (!endpoint.startsWith('/auth/')) {
            try {
                const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                    },
                });

                if (refreshRes.ok) {
                    const refreshData = await refreshRes.json();
                    const newToken = refreshData.data?.accessToken || refreshData.data?.token;
                    if (newToken) {
                        setToken(newToken);
                        // Retry original request with new token
                        return request<T>(endpoint, {
                            ...options,
                            _retry: true,
                            headers: {
                                ...fetchOptions.headers,
                                'Authorization': `Bearer ${newToken}`,
                            },
                        });
                    }
                }
            } catch {
                // Refresh failed (404 or network error) — fall through
            }

            // Refresh failed — clear everything and redirect
            clearToken();
            localStorage.removeItem(USER_KEY);
            if (window.location.pathname !== '/') {
                window.location.href = '/';
            }
            throw new ApiError('AUTH_FAILED', 'Session expired. Please login again.', 401);
        }
    }

    // ── Handle other errors ───────────────────────────────────────────────
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const code = errorData.error?.code || `HTTP_${response.status}`;
        const message = errorData.error?.message || `API Error ${response.status}: ${response.statusText}`;
        const fieldErrors = errorData.error?.errors; // For VALIDATION_ERROR
        throw new ApiError(code, message, response.status, fieldErrors);
    }

    const result = await response.json();
    return result.data as T;
}

// ─── Public API ───────────────────────────────────────────────────────────────
export const apiClient = {
    get: <T>(endpoint: string, params?: Record<string, string>) =>
        request<T>(endpoint, { method: 'GET', params }),

    post: <T>(endpoint: string, body?: unknown) =>
        request<T>(endpoint, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),

    put: <T>(endpoint: string, body?: unknown) =>
        request<T>(endpoint, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }),

    delete: <T>(endpoint: string) =>
        request<T>(endpoint, { method: 'DELETE' }),
};
