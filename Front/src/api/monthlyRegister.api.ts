// api/monthlyRegister.api.ts

import { apiClient } from './apiClient';

export interface StaffSubject {
    subject_id: number;
    subject_name: string;
    subject_code: string;
    subject_year: number;
}

export interface MonthlyRegisterStudent {
    student_id: number;
    name: string;
    roll_number: string;
    days: Record<number, string | null>;  // day_num → 'PRESENT' | 'ABSENT' | 'OD' | 'INFORMED_LEAVE' | null
    present: number;
    absent: number;
    total: number;
    percentage: number;
}

export interface MonthlyRegisterData {
    subject: StaffSubject;
    month: string;   // YYYY-MM
    days: number[];  // calendar days that have data e.g. [1,2,3,7,8...]
    students: MonthlyRegisterStudent[];
}

/** Returns subjects this staff member has submitted attendance for */
export async function fetchStaffOwnSubjects(): Promise<StaffSubject[]> {
    return apiClient.get<StaffSubject[]>('/monthly-register/subjects');
}

/** Returns the full monthly register */
export async function fetchMonthlyRegister(
    subjectId: number,
    month: string  // YYYY-MM
): Promise<MonthlyRegisterData> {
    return apiClient.get<MonthlyRegisterData>('/monthly-register', {
        subject_id: String(subjectId),
        month,
    });
}
