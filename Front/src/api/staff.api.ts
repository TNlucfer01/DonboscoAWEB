// ─── Staff API ────────────────────────────────────────────────────────────────

import { apiClient } from './apiClient';

export interface StaffMember {
    id: number;
    name: string;
    email: string;
    phone: string;
    role: string;
}

const USE_MOCK = true;

/** POST /staff — Add new staff member */
export async function addStaffMember(
    name: string, email: string, phone: string
): Promise<void> {
    if (USE_MOCK) return;
    await apiClient.post('/staff', { name, email, phone, role: 'Subject Staff' });
}
