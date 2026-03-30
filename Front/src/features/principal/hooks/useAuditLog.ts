// ─── useAuditLog hook ────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from 'react';
import { AuditLogEntry } from '../../shared/attendance.types';
import { fetchAuditLogs } from '../../../api/audit.api';
import { format } from 'date-fns';
import { usePageCache } from '../../../app/PageCache';

const CACHE_KEY = 'audit-log';

export function useAuditLog() {
    const cache = usePageCache();
    const [logs, setLogs] = useState<AuditLogEntry[]>(cache.get<AuditLogEntry[]>(CACHE_KEY) ?? []);
    const [loading, setLoading] = useState(false);
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
            // Persist to cache (only unfiltered loads, so back-navigation shows latest data)
            if (!start && !end) cache.set(CACHE_KEY, data);
        } finally {
            setLoading(false);
        }
    }, [cache]);

    // Load on mount only if cache is empty
    useEffect(() => {
        const cached = cache.get<AuditLogEntry[]>(CACHE_KEY);
        if (!cached || cached.length === 0) load();
    }, [load, cache]);

    const applyFilter = () => load(startDate, endDate);
    const clearFilter = () => {
        setStartDate(undefined);
        setEndDate(undefined);
        load();
    };

    return { logs, loading, startDate, endDate, setStartDate, setEndDate, applyFilter, clearFilter };
}
