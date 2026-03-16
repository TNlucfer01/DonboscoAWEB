import { apiClient } from './apiClient';
import { ODLeaveStudent } from '../features/shared/attendance.types';

/** GET /attendance/od-il — Fetch OD/Leave entries */
export async function fetchODLeaveStudents(year: string): Promise<ODLeaveStudent[]> {
    const data = await apiClient.get<any[]>('/attendance/od-il', { year });

    return data.map((r, index) => ({
        id: r.record_id,
        sno: index + 1,
        rollNo: r.student?.roll_number || '-',
        name: r.student?.name || 'Unknown',
        batch: r.student?.batch?.name || '-',
        period1: '-', period2: '-', period3: '-', period4: '-', period5: '-',
        status: r.status,
        remarks: r.od_reason || '',
        date: r.date,
        slot_id: r.slot_id,
        attendancePercentage: 0,
    }));
}

/** POST /attendance/od-il — Save multiple OD/leave entries */
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
