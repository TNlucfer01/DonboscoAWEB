import { apiClient, setToken, clearToken, ApiError } from './apiClient';

export interface UserResponse {
    id: number;
    name: string;
    role: string;
}

// ─── What the backend actually returns ───────────────────────────────────────
// { success: true, data: { token: string, user: UserResponse } }
// Some backends may use accessToken instead of token — support both.
interface LoginResponse {
    token?: string;
    accessToken?: string;
    user: UserResponse;
}


export async function login(email: string, password: string): Promise<UserResponse> {
    const raw = await apiClient.post<LoginResponse>('/auth/login', { email, password });
    // Backend returns `token` — support `accessToken` as fallback
    const jwt = raw.token || raw.accessToken;
    if (jwt) setToken(jwt);
    const { user } = raw;
    return user;
}

export async function logout(): Promise<void> {
    try {
        await apiClient.post('/auth/logout');
    } finally {
        clearToken();
        localStorage.removeItem('dbcas_user');
    }
}

export async function forgotPassword(phone: string): Promise<void> {
    await apiClient.post('/auth/forgot-password', { phone });
}

export async function verifyOTP(phone: string, otp: string): Promise<void> {
    await apiClient.post('/auth/verify-otp', { phone, otp });
}

export async function resetPassword(phone: string, otp: string, newPassword: string): Promise<void> {
    await apiClient.post('/auth/reset-password', { phone, otp, newPassword });
}

export { ApiError };