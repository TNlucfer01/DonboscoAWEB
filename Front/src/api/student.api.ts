// ─── Student API ─────────────────────────────────────────────────────────────

import { apiClient } from './apiClient';

const USE_MOCK = true;

/** POST /students — Add new student */
export async function addStudent(
    name: string, rollNumber: string, parentPhone: string, batch: string
): Promise<void> {
    if (USE_MOCK) return;
    await apiClient.post('/students', { name, rollNumber, parentPhone, batch });
}
