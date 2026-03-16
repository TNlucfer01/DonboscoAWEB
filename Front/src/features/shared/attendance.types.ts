// ─── Attendance Types ─────────────────────────────────────────────────────────
// Shared across all attendance-related features and API responses.


export interface CorrectionStudent {
    id: number;
    rollNo: string;
    name: string;
    status: string;
    odReason: string;
    slot?: number;    // Period number (from TimetableSlot)
    subject?: string; // Subject name
    date?: string;    // YYYY-MM-DD
}

export interface StaffStudent {
    id: number;
    rollNo: string;
    name: string;
    status: string;
    isLocked?: boolean;
    odReason?: string;
}
export interface AttendanceStudent {
    id: number;
    sno: number;
    rollNo: string;
    name: string;
    batch: string;
    period1: string;
    period2: string;
    period3: string;
    period4: string;
    period5: string;
}

export interface ODLeaveStudent extends AttendanceStudent {
    remarks: string;
    attendancePercentage: number;
    status: string;
    slot_id: number;
    date: string;

}

export interface AuditLogEntry {
    id: number;
    timestamp: string;
    student: string;
    rollNo: string;
    dateOfPeriod: string;
    period: string;
    oldStatus: string;
    newStatus: string;
    changedBy: string;
}

export type AttendancePeriodKey = 'period1' | 'period2' | 'period3' | 'period4' | 'period5';
export const PERIOD_KEYS: AttendancePeriodKey[] = ['period1', 'period2', 'period3', 'period4', 'period5'];
