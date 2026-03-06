// ─── Holiday API ──────────────────────────────────────────────────────────────

import { apiClient } from './apiClient';

const USE_MOCK = true;

/** POST /holidays — Mark a holiday */
export async function markHoliday(date: string, name: string, description: string): Promise<void> {
    if (USE_MOCK) return;
    await apiClient.post('/holidays', { date, name, description });
}

/** POST /holidays/working-saturday — Enable a Saturday as working day */
export async function enableWorkingSaturday(date: string): Promise<void> {
    if (USE_MOCK) return;
    await apiClient.post('/holidays/working-saturday', { date });
}
