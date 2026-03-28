// ─── Dashboard API ────────────────────────────────────────────────────────────

import { apiClient } from './apiClient';

export interface AttendanceSummary {
    student_id: number;
    name: string;
    roll_number: string;
    current_year: number;
    total_periods: number;
    attended: number;
    attendance_pct: number;
}

//every thing is good
/** GET /reports/attendance-summary — Fetch all students with attendance % */ //for each year i think 
export async function fetchAttendanceSummary(year?: string): Promise<AttendanceSummary[]> {
    const params: Record<string, string> = {};
    if (year) params.year = year;
    return apiClient.get<AttendanceSummary[]>('/reports/attendance-summary', Object.keys(params).length ? params : undefined);
}


/** GET /reports/below-threshold?threshold=80 — Students below 80% */
export async function fetchBelowThreshold(threshold: number = 80): Promise<AttendanceSummary[]> {
    return apiClient.get<AttendanceSummary[]>('/reports/below-threshold', { threshold: String(threshold) });
}

export interface OverallSummary {
    year: number;
    total_students: number;
    total_periods: number;
    present_periods: number;
    absent_periods: number;
}

export async function fetchOverallSummary(year?: string, date_from?: string, date_to?: string): Promise<OverallSummary[]> {
    const params: Record<string, string> = {};
    if (year) params.year = year;
    if (date_from) params.date_from = date_from;
    if (date_to) params.date_to = date_to;
    return apiClient.get<OverallSummary[]>('/reports/overall-summary', Object.keys(params).length ? params : undefined);
}

export interface DailyReportStudent {
    student_id: number;
    name: string;
    roll_number: string;
    current_year: number;
    dates: Record<string, Record<string, string | null>>; // maps 'YYYY-MM-DD' -> { '1': 'PRESENT', '2': 'ABSENT' }
}

export interface DailyReportResponse {
    students: DailyReportStudent[];
    days: string[];
}

export async function fetchDailyReport(year: string, date_from?: string, date_to?: string, subject_id?: string): Promise<DailyReportResponse> {
    const params: Record<string, string> = { year };
    if (date_from) params.date_from = date_from;
    if (date_to) params.date_to = date_to;
    if (subject_id) params.subject_id = subject_id;
    return apiClient.get<DailyReportResponse>('/reports/daily', params);
}


/** Aggregates for the dashboard cards — derived from summary data */
export async function fetchDashboardStats(): Promise<{
    totalStudents: number;
    overallAttendance: string;
    belowThreshold: number;
    belowThresholdList: AttendanceSummary[];
    yearWise: { year: string; attendance: number; target: number }[];
}> {
    try {
        const [summary, below] = await Promise.all([
            fetchAttendanceSummary(),
            fetchBelowThreshold(),
        ]);

        const totalStudents = summary.length;
        const avgPct = totalStudents > 0
            ? (summary.reduce((sum, s) => {
                const pct = s.attendance_pct;
                return sum + (isNaN(pct) ? 0 : (pct || 0));
            }, 0) / totalStudents)
            : 0;

        // Group by year
        const yearMap: Record<number, number[]> = {};
        summary.forEach(s => {
            if (!yearMap[s.current_year]) yearMap[s.current_year] = [];
            const pct = s.attendance_pct;
            yearMap[s.current_year].push(isNaN(pct) ? 0 : (pct || 0));
        });

        const yearLabels = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
        const yearWise = [1, 2, 3, 4].map((y, i) => {
            const yearData = yearMap[y] || [];
            const yearAvg = yearData.length > 0 
                ? (yearData.reduce((a, b) => a + (isNaN(b) ? 0 : b), 0) / yearData.length)
                : 0;
            
            return {
                year: yearLabels[i],
                attendance: Math.round(yearAvg),
                target: 75,
            };
        });

        return {
            totalStudents,
            overallAttendance: avgPct.toFixed(1) + '%',
            belowThreshold: below.length,
            belowThresholdList: below,
            yearWise,
        };
    } catch {
        // Fallback if no data yet
        return {
            totalStudents: 0,
            overallAttendance: '0%',
            belowThreshold: 0,
            belowThresholdList: [],
            yearWise: [1, 2, 3, 4].map((_, i) => ({
                year: ['1st Year', '2nd Year', '3rd Year', '4th Year'][i],
                attendance: 0, target: 75,
            })),
        };
    }
}
