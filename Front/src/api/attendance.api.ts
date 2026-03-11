// ─── Attendance API ───────────────────────────────────────────────────────────
// All attendance-related backend calls. Connected to real /api/attendance routes.

import { apiClient } from './apiClient';
import {
    AttendanceStudent,
    CorrectionStudent,
    StaffStudent,
    ODLeaveStudent,
} from '../features/shared/attendance.types';

// ─── API Functions ────────────────────────────────────────────────────────────

/** GET /attendance/view?year=1&date_from=2026-03-06&date_to=2026-03-06 */
export async function fetchAttendanceView(year: string, date: string): Promise<AttendanceStudent[]> {
    const data = await apiClient.get<any[]>('/attendance/view', { year, date_from: date, date_to: date });

    // Transform backend AttendanceRecord to frontend AttendanceStudent (5-period columns)
    const studentMap: Record<number, AttendanceStudent> = {};
    let snoCounter = 0;

    data.forEach((record) => {
        const sid = record.student?.student_id || record.student_id;
        if (!studentMap[sid]) {
            snoCounter++;
            studentMap[sid] = {
                id: sid,
                sno: snoCounter,
                rollNo: record.student?.roll_number || '-',
                name: record.student?.name || 'Unknown',
                batch: record.student?.batch?.name || '-',
                period1: '-', period2: '-', period3: '-', period4: '-', period5: '-',
            };
        }

        const slotNum = record.slot?.slot_number || record.slot_id;
        const statusMap: Record<string, string> = {
            'PRESENT': 'P', 'ABSENT': 'A', 'OD': 'OD', 'INFORMED_LEAVE': 'IL',
        };
        const key = `period${slotNum}` as keyof AttendanceStudent;
        (studentMap[sid] as any)[key] = statusMap[record.status] || record.status;
    });

    return Object.values(studentMap);
}

/** Fetch students for correction (Principal) — same view endpoint, filtered by period */
export async function fetchCorrectionStudents(
    year: string, _batch: string, period: string, date: string
): Promise<CorrectionStudent[]> {//date should have 2 fromt ot end 
    const data = await apiClient.get<any[]>('/attendance/fetch-students', { year, date_from: date, date_to: date });

    return data
        .filter(r => String(r.slot?.slot_number || r.slot_id) === period)
        .map(r => ({
            id: r.record_id,
            rollNo: r.student?.roll_number || '-',
            name: r.student?.name || 'Unknown',
            status: r.status,
            odReason: r.od_reason || '',
        }));
}

/** PUT /attendance/correct — Save corrected attendance (one at a time) */
export async function saveAttendanceCorrection(students: CorrectionStudent[]): Promise<void> {
    for (const student of students) {
        await apiClient.put('/attendance/correct', {
            record_id: student.id,
            new_status: student.status.toUpperCase(),
            od_reason: student.odReason,
        });
    }
}

/** POST /attendance/fetch-students — Staff fetch students for attendance
 *  Returns { students, remaining_minutes }
 */
export interface FetchStudentsResponse {
    students: StaffStudent[];
    remainingMinutes: number;
}

export async function fetchStaffStudents(
    year: string, batch_id: string, batch_type: string, slot_id: string, _subject: string
): Promise<FetchStudentsResponse> {
    const data = await apiClient.post<any>('/attendance/fetch-students', {
        year: parseInt(year),
        batch_id: parseInt(batch_id),
        batch_type,
        slot_id: parseInt(slot_id),
        date: new Date().toISOString().split('T')[0], // what is this 
    });

    // Backend may return array directly or object with remaining_minutes
    const studentArray = Array.isArray(data) ? data : (data.students || data);
    const remainingMinutes = Array.isArray(data)
        ? (data[0]?.remaining_minutes ?? 60)
        : (data.remaining_minutes ?? 60);

    const students: StaffStudent[] = (Array.isArray(studentArray) ? studentArray : []).map((s: any) => ({
        id: s.student_id,
        rollNo: s.roll_number,
        name: s.name,
        status: s.status || 'Present',
    }));

    return { students, remainingMinutes };
}

/** POST /attendance/submit — Submit staff attendance */
export async function submitStaffAttendance(
    _year: string, _batch: string, slot_id: string, subject_id: string,
    students: StaffStudent[], date?: string
): Promise<void> {
    const records = students.map(s => ({
        student_id: s.id,
        status: s.status.toUpperCase(),
    }));

    await apiClient.post('/attendance/submit', {
        records,
        slot_id: parseInt(slot_id),
        date: date || new Date().toISOString().split('T')[0],
        subject_id: parseInt(subject_id),
    });
}

/** GET /attendance/od-il?year=... — Fetch OD/Leave entries */
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

/** POST /attendance/od-il — Save OD/leave entry */
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
