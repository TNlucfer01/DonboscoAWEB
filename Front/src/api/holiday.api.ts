// ─── Holiday API ──────────────────────────────────────────────────────────────

import { apiClient } from './apiClient';

const USE_MOCK = false;

/** POST /calendar — Mark a holiday */
export async function markHoliday(date: string, reason: string): Promise<void> {
    if (USE_MOCK) return;
    await apiClient.post('/calendar', { date, day_type: 'HOLIDAY', reason });
}

/** DELETE /calendar/:date — Remove holiday */
export async function removeHoliday(date: string): Promise<void> {
    if (USE_MOCK) return;
    await apiClient.delete(`/calendar/${date}`);
}

/** POST /calendar — Enable a Saturday as working day */
export async function enableWorkingSaturday(date: string): Promise<void> {
    if (USE_MOCK) return;
    await apiClient.post('/calendar', { date, day_type: 'WORKING_DAY', reason: 'Working Saturday' });
}
