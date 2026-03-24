import { apiClient } from './apiClient';
import { StaffStudent } from '../features/shared/attendance.types';

export interface FetchStudentsResponse {
    students: StaffStudent[];
    remainingMinutes: number;
}

export interface CorrectionMetadata {
    subjectName: string;
    subjectCode: string;
    submitterName: string;
    year: string;
    batchName: string;
}

export interface FetchCorrectionStudentsResponse extends FetchStudentsResponse {
    metadata: CorrectionMetadata;
}

/** POST /attendance/fetch-students — Staff fetch students for attendance */
export async function fetchStaffStudents(
    year: string, batch_id: string, batch_type: string, slot_id: string, _subject: string
): Promise<FetchStudentsResponse> {
    const data = await apiClient.post<any>('/attendance/fetch-students', {
        year: parseInt(year),
        batch_id: parseInt(batch_id),
        batch_type,
        slot_id: parseInt(slot_id),
        date: (() => { const n = new Date(); return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}-${String(n.getDate()).padStart(2,'0')}`; })(),
    });

    const studentArray = Array.isArray(data) ? data : (data.students || data);
    const remainingMinutes = Array.isArray(data) ? (data[0]?.remaining_minutes ?? 60) : (data.remaining_minutes ?? 60);

    const students: StaffStudent[] = (Array.isArray(studentArray) ? studentArray : []).map((s: any) => ({
        id: s.student_id,
        rollNo: s.rollno,
        name: s.name,
        status: s.status || 'PRESENT',
        isLocked: !!s.is_locked,
        odReason: s.od_reason || '',
    }));

    return { students, remainingMinutes };
}

/** POST /attendance/submit — Submit staff attendance */
export async function submitStaffAttendance(
    _year: string, _batch: string, slot_id: string, subject_id: string,
    students: StaffStudent[], date?: string
): Promise<StaffStudent[]> {
    const records = students.map(s => {
        const uppercaseStatus = s.status.toUpperCase();
        return {
            student_id: s.id,
            status: uppercaseStatus,
            od_reason: uppercaseStatus === 'ABSENT' ? 'Uninformed Leave' : 'None',
        };
    });

    const response = await apiClient.post<any>('/attendance/submit', {
        records,
        slot_id: parseInt(slot_id),
        date: date || new Date().toISOString().split('T')[0],
        subject_id: parseInt(subject_id),
    });

    return (response.student || []).map((s: any) => ({
        id: s.student_id,
        rollNo: s.rollno,
        name: s.name,
        status: s.status || 'PRESENT',
        isLocked: !!s.is_locked,
        odReason: s.od_reason || '',
    }));
}

/** POST /attendance/correct-attendance/fetch-students — Staff fetch students for correction */
export async function fetchStaffCorrectionStudents(
    year: string, batch_id: string, batch_type: string, slot_id: string, subject_id: string, date: string
): Promise<FetchCorrectionStudentsResponse> {
    const data = await apiClient.post<any>('/attendance/correct-attendance/fetch-students', {
        year: parseInt(year),
        batch_id: parseInt(batch_id),
        batch_type,
        slot_id: parseInt(slot_id),
        subject_id: parseInt(subject_id),
        date,
    });

    const studentArray = Array.isArray(data) ? data : (data.records || []);
    const remainingMinutes = Array.isArray(data) ? (data[0]?.remaining_minutes ?? 60) : (data.remaining_minutes ?? 60);

    const students: StaffStudent[] = studentArray.map((s: any) => ({
        id: s.student_id,
        rollNo: s.rollno || s.roll_number,
        name: s.studentname || s.name || s.student_name,
        status: s.status || 'PRESENT',
        isLocked: !!s.is_locked,
        odReason: s.od_reason || '',
    }));
    
    const metadata: CorrectionMetadata = {
        subjectName: data.subject_name || data.subject || 'N/A',
        subjectCode: data.subject_code || data.subjectCode || 'N/A',
        submitterName: data.submitter_name || data.submittername || 'N/A',
        year: data.year || year,
        batchName: data['batch name'] || 'N/A'
    };

    return { students, remainingMinutes, metadata };
}

/** POST /attendance/correct-attendance — Submit staff attendance correction */
export async function submitStaffCorrectionAttendance(
    _year: string, _batch: string, slot_id: string, subject_id: string,
    students: StaffStudent[], date: string
): Promise<StaffStudent[]> {
    const records = students.map(s => {
        const uppercaseStatus = s.status.toUpperCase();
        return {
            student_id: s.id,
            status: uppercaseStatus,
            od_reason: uppercaseStatus === 'ABSENT' ? 'Uninformed Leave' : 'None',
        };
    });

    const response = await apiClient.post<any>('/attendance/correct-attendance', {
        records,
        slot_id: parseInt(slot_id),
        date,
        subject_id: parseInt(subject_id),
    });

    return (response.student || []).map((s: any) => ({
        id: s.student_id,
        rollNo: s.rollno || s.roll_number,
        name: s.name,
        status: s.status || 'Present',
        isLocked: !!s.is_locked,
        odReason: s.od_reason || '',
    }));
}
