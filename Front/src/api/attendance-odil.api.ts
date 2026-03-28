import { apiClient } from './apiClient';

/** GET /attendance/od-il/students?date=YYYY-MM-DD
 *  Returns { date, alreadySubmitted, students[] } for the YC's managed year.
 */
export interface ODILStudentRow {
    student_id: number;
    name: string;
    roll_number: string;
    periods: {
        1: 'OD' | 'INFORMED_LEAVE' | null;
        2: 'OD' | 'INFORMED_LEAVE' | null;
        3: 'OD' | 'INFORMED_LEAVE' | null;
        4: 'OD' | 'INFORMED_LEAVE' | null;
        5: 'OD' | 'INFORMED_LEAVE' | null;
    };
    od_reason: string | null;
}

export interface ODILStudentsResponse {
    date: string;
    alreadySubmitted: boolean;
    students: ODILStudentRow[];
}

export async function fetchStudentsForODDate(date: string): Promise<ODILStudentsResponse> {
    return apiClient.get<ODILStudentsResponse>('/attendance/od-il/students', { date });
}

export interface ODILBulkEntry {
    student_id: number;
    date: string;
    slot_id: number;
    status: 'OD' | 'INFORMED_LEAVE';
    od_reason?: string;
}

/** POST /attendance/od-il/bulk — Save and lock all OD/IL entries for the date */
export async function bulkSaveODIL(entries: ODILBulkEntry[], semester_id: number): Promise<{ saved: number }> {
    return apiClient.post<{ saved: number }>('/attendance/od-il/bulk', { entries, semester_id });
}

/** GET /attendance/od-il — Fetch OD/Leave entries (legacy/list view) */
export async function fetchODLeaveStudents(year: string): Promise<any[]> {
    return apiClient.get<any[]>('/attendance/od-il', { year });
}

/** POST /attendance/od-il — Save single OD/leave entry (legacy) */
export async function saveODLeaveEntries(entry: {
    student_id: number;
    slot_id: number;
    date: string;
    status: string;
    od_reason?: string;
    semester_id: number;
}): Promise<void> {
    await apiClient.post('/attendance/od-il', entry);
}

/** PUT /attendance/od-il/:id — Update existing OD/leave entry */
export async function updateODILEntry(id: number, data: {
    status: string;
    od_reason?: string;
}): Promise<void> {
    await apiClient.put(`/attendance/od-il/${id}`, data);
}
