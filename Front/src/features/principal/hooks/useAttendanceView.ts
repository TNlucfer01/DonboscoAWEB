// ─── useAttendanceView hook ───────────────────────────────────────────────────
// Fetches attendance records for a given year and date.
// Components stay pure — all fetch logic lives here.

import { useState, useCallback } from 'react';
import { AttendanceStudent } from '../../shared/attendance.types';
import { fetchAttendanceView } from '../../../api/attendance.api';
import { format } from 'date-fns';

interface UseAttendanceViewReturn {
    students: AttendanceStudent[];
    loading: boolean;
    error: string | null;
    fetch: (year: string, date: Date) => Promise<void>;
}

export function useAttendanceView(): UseAttendanceViewReturn {
    const [students, setStudents] = useState<AttendanceStudent[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetch = useCallback(async (year: string, date: Date) => {
        setLoading(true);
        setError(null);
        setStudents([]); // Clear stale data
        try {
            const data = await fetchAttendanceView(year, format(date, 'yyyy-MM-dd'));
            setStudents(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch attendance');
        } finally {
            setLoading(false);
        }
    }, []);

    return { students, loading, error, fetch };
}
