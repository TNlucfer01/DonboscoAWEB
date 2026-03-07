// ─── Student API ─────────────────────────────────────────────────────────────

import { apiClient } from './apiClient';

const USE_MOCK = false;

/** POST /students — Add new student */
export async function addStudent(
    name: string, roll_number: string, parent_phone: string, batch_id: string, gender: string = 'Male'
): Promise<void> {
    if (USE_MOCK) return;
    await apiClient.post('/students', { name, roll_number, parent_phone, batch_id: parseInt(batch_id), gender });
}
