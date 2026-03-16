import { apiClient } from './apiClient';
import { AttendanceStudent, CorrectionStudent } from '../features/shared/attendance.types';

/** GET /attendance/view — Fetch attendance overview for Principal/YC */
export async function fetchAttendanceView(year: string, date: string): Promise<AttendanceStudent[]> {
    const data = await apiClient.get<any[]>('/attendance/view', { year, date_from: date, date_to: date });

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

/** GET /attendance/fetch-students — Fetch students for principal correction */
export async function fetchCorrectionStudents(
    year: string, _batch: string, period: string, date: string
): Promise<CorrectionStudent[]> {
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

/** PUT /attendance/correct — Save attendance correction */
export async function saveAttendanceCorrection(students: CorrectionStudent[]): Promise<void> {
    for (const student of students) {
        if (!student.id) continue;
        await apiClient.put('/attendance/correct', {
            record_id: student.id,
            new_status: student.status.toUpperCase(),
            od_reason: student.odReason,
        });
    }
}
