// ─── API Client ───────────────────────────────────────────────────────────────
// Base fetch wrapper. When your backend is ready:
//   1. Set VITE_API_BASE_URL in your .env file
//   2. All API files import `apiClient` — no other changes needed.

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api';

interface RequestOptions extends RequestInit {
    params?: Record<string, string>;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { params, ...fetchOptions } = options;

    let url = `${BASE_URL}${endpoint}`;
    if (params) {
        url += '?' + new URLSearchParams(params).toString();
    }

    const response = await fetch(url, {
        ...fetchOptions,
        headers: {
            'Content-Type': 'application/json',
            // TODO: add Authorization header here once auth tokens are implemented
            // 'Authorization': `Bearer ${getToken()}`,
            ...fetchOptions.headers,
        },
    });

    if (!response.ok) {
        throw new Error(`API Error ${response.status}: ${response.statusText}`);
    }

    return response.json() as Promise<T>;
}

export const apiClient = {
    get: <T>(endpoint: string, params?: Record<string, string>) =>
        request<T>(endpoint, { method: 'GET', params }),

    post: <T>(endpoint: string, body: unknown) =>
        request<T>(endpoint, { method: 'POST', body: JSON.stringify(body) }),

    put: <T>(endpoint: string, body: unknown) =>
        request<T>(endpoint, { method: 'PUT', body: JSON.stringify(body) }),

    delete: <T>(endpoint: string) =>
        request<T>(endpoint, { method: 'DELETE' }),
};
