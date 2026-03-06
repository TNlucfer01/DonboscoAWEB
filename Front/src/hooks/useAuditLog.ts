// ─── useAuditLog hook ────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from 'react';
import { AuditLogEntry } from '../features/shared/attendance.types';
import { fetchAuditLogs } from '../api/audit.api';
import { format } from 'date-fns';

export function useAuditLog() {
    const [logs, setLogs] = useState<AuditLogEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [startDate, setStartDate] = useState<Date | undefined>(undefined);
    const [endDate, setEndDate] = useState<Date | undefined>(undefined);

    const load = useCallback(async (start?: Date, end?: Date) => {
        setLoading(true);
        try {
            const data = await fetchAuditLogs(
                start ? format(start, 'yyyy-MM-dd') : undefined,
                end ? format(end, 'yyyy-MM-dd') : undefined
            );
            setLogs(data);
        } finally {
            setLoading(false);
        }
    }, []);

    // Load on mount
    useEffect(() => { load(); }, [load]);

    const applyFilter = () => load(startDate, endDate);
    const clearFilter = () => {
        setStartDate(undefined);
        setEndDate(undefined);
        load();
    };

    return { logs, loading, startDate, endDate, setStartDate, setEndDate, applyFilter, clearFilter };
}
