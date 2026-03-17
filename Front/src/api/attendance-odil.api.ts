import { apiClient } from './apiClient';
import { ODLeaveStudent } from '../features/shared/attendance.types';

/** GET /attendance/od-il — Fetch OD/Leave entries */
export async function fetchODLeaveStudents(year: string): Promise<ODLeaveStudent[]> {
    const data = await apiClient.get<any[]>('/attendance/od-il', { year });

    const grouped = new Map<string, ODLeaveStudent>();

    data.forEach((r) => {
        const key = `${r.student_id}-${r.date}`;
        if (!grouped.has(key)) {
            grouped.set(key, {
                id: r.student_id,
                sno: 0, // Assigned later
                rollNo: r.student?.roll_number || '-',
                name: r.student?.name || 'Unknown',
                batch: r.student?.batch?.name || '-',
                period1: '-', period2: '-', period3: '-', period4: '-', period5: '-',
                status: r.status,
                remarks: r.od_reason || '',
                date: r.date,
                slot_id: r.slot_id,
                attendancePercentage: 0,
            });
        }
        
        const student = grouped.get(key)!;
        if (r.slot_id >= 1 && r.slot_id <= 5) {
            const periodKey = `period${r.slot_id}` as keyof ODLeaveStudent;
            (student as any)[periodKey] = r.status;
        }
    });

    return Array.from(grouped.values()).map((s, index) => ({
        ...s,
        sno: index + 1
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
