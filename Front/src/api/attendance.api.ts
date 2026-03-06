// ─── Attendance API ───────────────────────────────────────────────────────────
// All attendance-related backend calls.
// Currently returns mock data so the UI works before the backend is ready.
// To connect to real backend: replace the mock return with apiClient calls.

import { apiClient } from './apiClient';
import {
    AttendanceStudent,
    CorrectionStudent,
    StaffStudent,
    ODLeaveStudent,
} from '../features/shared/attendance.types';

// ─── Mock Data (replace with real API calls when backend is ready) ────────────
const MOCK_ATTENDANCE_STUDENTS: AttendanceStudent[] = [
    { id: 1, sno: 1, rollNo: '2021001', name: 'John Doe', batch: 'A', period1: 'P', period2: 'P', period3: 'P', period4: 'P', period5: 'P' },
    { id: 2, sno: 2, rollNo: '2021002', name: 'Jane Smith', batch: 'A', period1: 'P', period2: 'P', period3: 'A', period4: 'P', period5: 'P' },
    { id: 3, sno: 3, rollNo: '2021003', name: 'Mike Johnson', batch: 'B', period1: 'P', period2: 'P', period3: 'P', period4: 'P', period5: 'P' },
    { id: 4, sno: 4, rollNo: '2021004', name: 'Sarah Williams', batch: 'B', period1: 'P', period2: 'OD', period3: 'OD', period4: 'OD', period5: 'OD' },
    { id: 5, sno: 5, rollNo: '2021005', name: 'Tom Brown', batch: 'C', period1: 'P', period2: 'P', period3: 'IL', period4: 'P', period5: 'P' },
    { id: 6, sno: 6, rollNo: '2021006', name: 'Emma Davis', batch: 'C', period1: 'A', period2: 'A', period3: 'A', period4: 'P', period5: 'P' },
];

const USE_MOCK = true; // ← Set to false when backend is ready

// ─── API Functions ────────────────────────────────────────────────────────────

/** GET /attendance/view?year=1&date=2026-03-06 */
export async function fetchAttendanceView(year: string, date: string): Promise<AttendanceStudent[]> {
    if (USE_MOCK) return MOCK_ATTENDANCE_STUDENTS;
    return apiClient.get<AttendanceStudent[]>('/attendance/view', { year, date });
}

/** GET /attendance/correction?year=1&batch=A&period=1&date=2026-03-06 */
export async function fetchCorrectionStudents(
    year: string, batch: string, period: string, date: string
): Promise<CorrectionStudent[]> {
    if (USE_MOCK) {
        return [
            { id: 1, rollNo: '2021001', name: 'John Doe', status: 'Present', odReason: '' },
            { id: 2, rollNo: '2021002', name: 'Jane Smith', status: 'Present', odReason: '' },
            { id: 3, rollNo: '2021003', name: 'Mike Johnson', status: 'Absent', odReason: '' },
            { id: 4, rollNo: '2021004', name: 'Sarah W.', status: 'Present', odReason: '' },
            { id: 5, rollNo: '2021005', name: 'Tom Brown', status: 'OD', odReason: 'Sports Event' },
        ];
    }
    return apiClient.get<CorrectionStudent[]>('/attendance/correction', { year, batch, period, date });
}

/** POST /attendance/correction — Save corrected attendance */
export async function saveAttendanceCorrection(students: CorrectionStudent[]): Promise<void> {
    if (USE_MOCK) return;
    await apiClient.post('/attendance/correction', { students });
}

/** GET /attendance/staff?year=1&batch=A&period=1&subject=CS101 */
export async function fetchStaffStudents(
    year: string, batch: string, period: string, subject: string
): Promise<StaffStudent[]> {
    if (USE_MOCK) {
        return [
            { id: 1, rollNo: '2021001', name: 'John Doe', status: 'Present' },
            { id: 2, rollNo: '2021002', name: 'Jane Smith', status: 'Present' },
            { id: 3, rollNo: '2021003', name: 'Mike Johnson', status: 'Present' },
            { id: 4, rollNo: '2021004', name: 'Sarah Williams', status: 'Present' },
            { id: 5, rollNo: '2021005', name: 'Tom Brown', status: 'Present' },
            { id: 6, rollNo: '2021006', name: 'Emma Davis', status: 'Present' },
            { id: 7, rollNo: '2021007', name: 'David Wilson', status: 'Present' },
            { id: 8, rollNo: '2021008', name: 'Olivia Martinez', status: 'Present' },
        ];
    }
    return apiClient.get<StaffStudent[]>('/attendance/staff', { year, batch, period, subject });
}

/** POST /attendance/staff — Submit attendance */
export async function submitStaffAttendance(
    year: string, batch: string, period: string, subject: string,
    students: StaffStudent[]
): Promise<void> {
    if (USE_MOCK) return;
    await apiClient.post('/attendance/staff', { year, batch, period, subject, students });
}

/** GET /attendance/od-leave?date=2026-03-06 */
export async function fetchODLeaveStudents(date: string): Promise<ODLeaveStudent[]> {
    if (USE_MOCK) return MOCK_ATTENDANCE_STUDENTS.map((s) => ({
        ...s,
        remarks: '',
        attendancePercentage: 90.0,
    }));
    return apiClient.get<ODLeaveStudent[]>('/attendance/od-leave', { date });
}

/** POST /attendance/od-leave — Save OD/leave entries */
export async function saveODLeaveEntries(students: ODLeaveStudent[]): Promise<void> {
    if (USE_MOCK) return;
    await apiClient.post('/attendance/od-leave', { students });
}
