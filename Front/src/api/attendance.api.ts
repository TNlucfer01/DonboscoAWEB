import { apiClient } from './apiClient';
import {
    AttendanceStudent,
    CorrectionStudent,
    StaffStudent,
    ODLeaveStudent,
} from '../features/shared/attendance.types';

const USE_MOCK = false;

// ─── API Functions ────────────────────────────────────────────────────────────

/** GET /attendance/view?year=1&date=2026-03-06 */
export async function fetchAttendanceView(year: string, date: string): Promise<AttendanceStudent[]> {
    if (USE_MOCK) return [];

    // Backend: GET /reports/attendance-summary?year=...&date_from=...&date_to=...
    // Or GET /attendance/view
    const data = await apiClient.get<any[]>('/attendance/view', { year, date_from: date, date_to: date });

    // Transform backend AttendanceRecord format to frontend AttendanceStudent format
    const studentMap: Record<number, AttendanceStudent> = {};

    data.forEach((record, index) => {
        const sid = record.student.student_id;
        if (!studentMap[sid]) {
            studentMap[sid] = {
                id: sid,
                sno: index + 1,
                rollNo: record.student.roll_number,
                name: record.student.name,
                batch: record.student.batch?.name || '-',
                period1: '-', period2: '-', period3: '-', period4: '-', period5: '-'
            };
        }

        const slotKey = `period${record.slot.slot_number}` as keyof AttendanceStudent;
        const statusMap: Record<string, string> = {
            'PRESENT': 'P',
            'ABSENT': 'A',
            'OD': 'OD',
            'INFORMED_LEAVE': 'IL'
        };
        (studentMap[sid] as any)[slotKey] = statusMap[record.status] || record.status;
    });

    return Object.values(studentMap);
}

/** GET /attendance/correction?record_id=... */
export async function fetchCorrectionStudents(
    year: string, batch: string, period: string, date: string
): Promise<CorrectionStudent[]> {
    if (USE_MOCK) return [];

    // The backend /attendance/view already returns records. 
    // We can filter it here or use the same view logic.
    const data = await apiClient.get<any[]>('/attendance/view', { year, date_from: date, date_to: date });

    return data
        .filter(r => r.slot.slot_number === parseInt(period))
        .map(r => ({
            id: r.record_id,
            rollNo: r.student.roll_number,
            name: r.student.name,
            status: r.status,
            odReason: r.od_reason || ''
        }));
}

/** PUT /attendance/correct — Save corrected attendance */
export async function saveAttendanceCorrection(students: CorrectionStudent[]): Promise<void> {
    if (USE_MOCK) return;

    // Backend expects individual corrections via PUT /attendance/correct { record_id, new_status, od_reason }
    for (const student of students) {
        await apiClient.put('/attendance/correct', {
            record_id: student.id,
            new_status: student.status.toUpperCase(),
            od_reason: student.odReason
        });
    }
}

/** POST /attendance/fetch-students — Staff fetch */
export async function fetchStaffStudents(
    year: string, batch_id: string, slot_id: string, date: string
): Promise<StaffStudent[]> {
    if (USE_MOCK) return [];

    // Backend: POST /attendance/fetch-students { year, batch_id, slot_id, date }
    const data = await apiClient.post<any[]>('/attendance/fetch-students', {
        year: parseInt(year),
        batch_id: parseInt(batch_id),
        slot_id: parseInt(slot_id),
        date
    });

    return data.map(s => ({
        id: s.student_id,
        rollNo: s.roll_number,
        name: s.name,
        status: s.status || 'Present',
        is_locked: s.is_locked
    }));
}

/** POST /attendance/submit — Submit attendance */
export async function submitStaffAttendance(
    _year: string, _batch: string, slot_id: string, subject_id: string,
    students: StaffStudent[], date: string
): Promise<void> {
    if (USE_MOCK) return;

    // Backend: POST /attendance/submit { records: [{ student_id, status }], slot_id, date, subject_id }
    const records = students.map(s => ({
        student_id: s.id,
        status: s.status.toUpperCase()
    }));

    await apiClient.post('/attendance/submit', {
        records,
        slot_id: parseInt(slot_id),
        date,
        subject_id: parseInt(subject_id)
    });
}

/** GET /attendance/od-leave?year=... */
export async function fetchODLeaveStudents(year: string): Promise<ODLeaveStudent[]> {
    if (USE_MOCK) return [];

    // Backend: GET /attendance/od-il?year=...
    const data = await apiClient.get<any[]>('/attendance/od-il', { year });

    return data.map((r, index) => ({
        id: r.record_id,
        sno: index + 1,
        rollNo: r.student.roll_number,
        name: r.student.name,
        batch: r.student.batch?.name || '-',
        period1: '-', period2: '-', period3: '-', period4: '-', period5: '-',
        status: r.status,
        remarks: r.od_reason || '',
        date: r.date,
        slot_id: r.slot_id,
        attendancePercentage: 0
    }));
}

/** POST /attendance/od-leave — Save OD/leave entries */
export async function saveODLeaveEntries(student: any): Promise<void> {
    if (USE_MOCK) return;

    // Backend: POST /attendance/od-il { student_id, slot_id, date, status, od_reason, semester_id }
    await apiClient.post('/attendance/od-il', {
        student_id: student.student_id,
        slot_id: parseInt(student.slot_id),
        date: student.date,
        status: student.status,
        od_reason: student.remarks,
        semester_id: 1 // TODO: Dynamic semester
    });
}
