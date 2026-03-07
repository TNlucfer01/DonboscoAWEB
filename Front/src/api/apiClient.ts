// ─── API Client ───────────────────────────────────────────────────────────────
// Base fetch wrapper. When your backend is ready:
//   1. Set VITE_API_BASE_URL in your .env file
//   2. All API files import `apiClient` — no other changes needed.

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api';

const TOKEN_KEY = 'dbcas_auth_token';

export const setToken = (token: string) => localStorage.setItem(TOKEN_KEY, token);
export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

interface RequestOptions extends RequestInit {
    params?: Record<string, string>;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { params, ...fetchOptions } = options;

    let url = `${BASE_URL}${endpoint}`;
    if (params) {
        url += '?' + new URLSearchParams(params).toString();
    }

    const token = getToken();
    const response = await fetch(url, {
        ...fetchOptions,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            ...fetchOptions.headers,
        },
    });

    if (response.status === 401) {
        clearToken();
        if (window.location.pathname !== '/') {
            window.location.href = '/';
        }
    }

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const message = errorData.error?.message || `API Error ${response.status}: ${response.statusText}`;
        throw new Error(message);
    }

    const result = await response.json();
    return result.data as T;
}

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
