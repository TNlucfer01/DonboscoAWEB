import { apiClient, setToken, clearToken } from './apiClient';

export interface UserResponse {
    id: number;
    name: string;
    role: string;
}

export interface LoginResponse {
    token: string;
    user: UserResponse;
}

export async function login(email: string, password: string): Promise<UserResponse> {
    const data = await apiClient.post<LoginResponse>('/auth/login', { email, password });
    setToken(data.token);
    return data.user;
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
