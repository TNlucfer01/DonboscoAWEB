import { apiClient, setToken, clearToken } from './apiClient';

export interface UserResponse {
    id: number;
    name: string;
    role: string;
}

// ─── What the backend actually returns ───────────────────────────────────────
// { success: true, data: { token: string, user: UserResponse } }
interface LoginResponse {
    token: string;
    user: UserResponse;
}


export async function login(email: string, password: string): Promise<UserResponse> {
    // apiClient.post returns the parsed JSON body (the full envelope)
    const raw = await apiClient.post<LoginResponse>('/auth/login', { email, password });
    const { token, user } = raw;
    // Store access token for subsequent requests (Authorization: Bearer <token>)
    setToken(token);

    return user;
}

export async function logout(): Promise<void> {
    try {
        await apiClient.post('/auth/logout');
    } finally {
        clearToken();
    }
}

export async function forgotPassword(phone: string): Promise<void> {
    await apiClient.post('/auth/forgot-password', { phone });
}

export async function resetPassword(phone: string, otp: string, newPassword: string): Promise<void> {
    await apiClient.post('/auth/reset-password', { phone, otp, newPassword });
}