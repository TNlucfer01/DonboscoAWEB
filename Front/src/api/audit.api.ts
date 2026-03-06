// ─── Audit Log API ────────────────────────────────────────────────────────────

import { apiClient } from './apiClient';
import { AuditLogEntry } from '../features/shared/attendance.types';

const USE_MOCK = true;

const MOCK_LOGS: AuditLogEntry[] = [
    { id: 1, timestamp: '2026-03-05 10:30:15', student: 'John Doe', rollNo: '2021001', dateOfPeriod: '2026-03-04', period: 'Period 3', oldStatus: 'Absent', newStatus: 'Present', changedBy: 'Principal' },
    { id: 2, timestamp: '2026-03-04 14:20:45', student: 'Jane Smith', rollNo: '2021002', dateOfPeriod: '2026-03-04', period: 'Period 2', oldStatus: 'Present', newStatus: 'OD', changedBy: 'Principal' },
    { id: 3, timestamp: '2026-03-04 11:15:30', student: 'Mike Johnson', rollNo: '2022015', dateOfPeriod: '2026-03-03', period: 'Period 1', oldStatus: 'Absent', newStatus: 'Informed Leave', changedBy: 'Principal' },
    { id: 4, timestamp: '2026-03-03 16:45:20', student: 'Sarah Williams', rollNo: '2021045', dateOfPeriod: '2026-03-03', period: 'Period 5', oldStatus: 'Absent', newStatus: 'Present', changedBy: 'Principal' },
    { id: 5, timestamp: '2026-03-03 09:10:55', student: 'Tom Brown', rollNo: '2023012', dateOfPeriod: '2026-03-02', period: 'Period 4', oldStatus: 'Present', newStatus: 'Absent', changedBy: 'Principal' },
];

/** GET /audit?startDate=&endDate= */
export async function fetchAuditLogs(startDate?: string, endDate?: string): Promise<AuditLogEntry[]> {
    if (USE_MOCK) return MOCK_LOGS;
    return apiClient.get<AuditLogEntry[]>('/audit', {
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
    });
}
