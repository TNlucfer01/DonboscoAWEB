// ─── Staff API ────────────────────────────────────────────────────────────────

import { apiClient } from './apiClient';

export interface StaffMember {
    user_id: number;
    name: string;
    email: string;
    phone_number: string;
    role: string;
    managed_year: number | null;
}

/** GET /users — List all staff (non-principal) */
export async function fetchStaffMembers(): Promise<StaffMember[]> {
    return apiClient.get<StaffMember[]>('/users');
}

/** POST /users — Add new staff member */
export async function addStaffMember(
    name: string, email: string, phone_number: string, role: string, managed_year: number | null
): Promise<void> {
    await apiClient.post('/users', { name, email, phone_number, role, managed_year });
}

/** PUT /users/:id — Update staff member */
export async function updateStaffMember(
    id: number, data: Partial<StaffMember>
): Promise<void> {
    await apiClient.put(`/users/${id}`, data);
}

/** DELETE /users/:id — Deactivate staff member */
export async function deleteStaffMember(id: number): Promise<void> {
    await apiClient.delete(`/users/${id}`);
}
