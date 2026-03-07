// ─── Staff API ────────────────────────────────────────────────────────────────

import { apiClient } from './apiClient';

export interface StaffMember {
    id: number;
    name: string;
    email: string;
    phone_number: string;
    role: string;
}

const USE_MOCK = false;

/** POST /users — Add new staff member */
export async function addStaffMember(
    name: string, email: string, phone_number: string, role: string = 'SUBJECT_STAFF'
): Promise<void> {
    if (USE_MOCK) return;
    await apiClient.post('/users', { name, email, phone_number, role });
}

/** GET /users — List staff members */
export async function fetchStaffMembers(): Promise<StaffMember[]> {
    if (USE_MOCK) return [];
    return apiClient.get<StaffMember[]>('/users');
}
