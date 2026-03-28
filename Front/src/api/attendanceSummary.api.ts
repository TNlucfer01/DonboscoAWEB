// api/attendanceSummary.api.ts
// Fresh API functions for the attendance summary table feature.

import { apiClient } from './apiClient';

export interface YearSummaryRow {
    year: number;
    total: number;
    present: number;
    absent: number;
}

export interface StudentDetailRow {
    student_id: number;
    name: string;
    roll_number: string;
    period_now: number;
    period1: string | null;
    period2: string | null;
    period3: string | null; // the status of each of the 5 periods 
    period4: string | null;
    period5: string | null;
    od_reason: string | null;
    day_status: 'PRESENT' | 'ABSENT';
}

/**
 * Fetches year-wise attendance summary for a given date.
 * Year is optional — YC passes their year, Principal can omit for all years.
 */
export async function fetchYearSummaryTable(date: string, year?: number): Promise<YearSummaryRow[]> {
    const params: Record<string, string> = { date };
    if (year) params.year = String(year);
    return apiClient.get<YearSummaryRow[]>('/attendance-summary/year-table', params);
}

/**
 * Drilldown — fetch students by date + year + status (PRESENT / ABSENT).
 */
export async function fetchStudentDetail(
    date: string,
    year: number,
    status: 'PRESENT' | 'ABSENT'
): Promise<StudentDetailRow[]> {
    return apiClient.get<StudentDetailRow[]>('/attendance-summary/student-detail', {
        date,
        year: String(year),
        status,
    });
}
