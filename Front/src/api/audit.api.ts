// ─── Audit Log API ────────────────────────────────────────────────────────────

import { apiClient } from './apiClient';
import { AuditLogEntry } from '../features/shared/attendance.types';

/** GET /audit?date_from=&date_to= — Fetch audit logs */
export async function fetchAuditLogs(startDate?: string, endDate?: string): Promise<AuditLogEntry[]> {
    const data = await apiClient.get<any[]>('/audit', {
        ...(startDate && { date_from: startDate }),
        ...(endDate && { date_to: endDate }),
    });

    // Transform backend shape to frontend AuditLogEntry
    return data.map(log => ({
        id: log.audit_id,
        timestamp: new Date(log.changed_at).toLocaleString(),
        student: log.record?.student?.name || 'Unknown',
        rollNo: log.record?.student?.roll_number || '-',
        dateOfPeriod: log.record?.date || '-',
        period: `Period ${log.record?.slot_id || '-'}`,
        oldStatus: log.old_status,
        newStatus: log.new_status,
        changedBy: log.changedBy?.name || 'Principal',
    }));
}
