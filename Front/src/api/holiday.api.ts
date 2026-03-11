// ─── Holiday / Calendar API ───────────────────────────────────────────────────

import { apiClient } from './apiClient';

export interface CalendarEntry {
    calendar_id: number;
    date: string;
    day_type: string;
    reason: string | null;
}

/** GET /calendar?year=&month= — Fetch calendar entries */
export async function fetchCalendarEntries(year?: string, month?: string): Promise<CalendarEntry[]> {
    const params: Record<string, string> = {};
    if (year) params.year = year;
    if (month) params.month = month;
    return apiClient.get<CalendarEntry[]>('/calendar', Object.keys(params).length ? params : undefined);
}

/** POST /calendar — Mark a holiday */
export async function markHoliday(date: string, reason: string): Promise<void> {
    await apiClient.post('/calendar', { date, day_type: 'HOLIDAY', reason });
}

/** POST /calendar — Enable a Saturday as working day */
export async function enableWorkingSaturday(date: string): Promise<void> {
    await apiClient.post('/calendar', { date, day_type: 'SATURDAY_ENABLED', reason: 'Working Saturday' });
}

/** PUT /calendar/:id — Update calendar entry */
export async function updateCalendarEntry(id: number, data: Partial<CalendarEntry>): Promise<void> {
    await apiClient.put(`/calendar/${id}`, data);
}

/** DELETE /calendar/:id — Delete calendar entry */
export async function deleteCalendarEntry(id: number): Promise<void> {
    await apiClient.delete(`/calendar/${id}`);
}
