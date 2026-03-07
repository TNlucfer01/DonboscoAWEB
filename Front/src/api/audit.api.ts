// ─── Audit Log API ────────────────────────────────────────────────────────────

import { apiClient } from './apiClient';
import { AuditLogEntry } from '../features/shared/attendance.types';

const USE_MOCK = false;

/** GET /audit?date_from=&date_to= */
export async function fetchAuditLogs(startDate?: string, endDate?: string): Promise<AuditLogEntry[]> {
    if (USE_MOCK) return [];

    const data = await apiClient.get<any[]>('/audit', {
        ...(startDate && { date_from: startDate }),
        ...(endDate && { date_to: endDate }),
    });

    return data.map(log => ({
        id: log.audit_id,
        timestamp: new Date(log.created_at).toLocaleString(),
        student: log.record.student.name,
        rollNo: log.record.student.roll_number,
        dateOfPeriod: log.record.date,
        period: `Period ${log.record.slot.slot_number}`,
        oldStatus: log.old_status,
        newStatus: log.new_status,
        changedBy: log.changer.name
    }));
}
