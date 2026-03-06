// ─── useAttendanceCorrection hook ────────────────────────────────────────────

import { useState, useCallback } from 'react';
import { CorrectionStudent } from '../features/shared/attendance.types';
import { fetchCorrectionStudents, saveAttendanceCorrection } from '../api/attendance.api';
import { format } from 'date-fns';
import { toast } from 'sonner';

export function useAttendanceCorrection() {
    const [students, setStudents] = useState<CorrectionStudent[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetch = useCallback(async (year: string, batch: string, period: string, date: Date) => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchCorrectionStudents(year, batch, period, format(date, 'yyyy-MM-dd'));
            setStudents(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch students');
        } finally {
            setLoading(false);
        }
    }, []);

    const updateStatus = useCallback((id: number, status: string) => {
        setStudents((prev) =>
            prev.map((s) => s.id === id ? { ...s, status, odReason: status === 'OD' ? s.odReason : '' } : s)
        );
    }, []);

    const updateODReason = useCallback((id: number, reason: string) => {
        setStudents((prev) => prev.map((s) => s.id === id ? { ...s, odReason: reason } : s));
    }, []);

    const save = useCallback(async () => {
        setSaving(true);
        try {
            await saveAttendanceCorrection(students);
            toast.success('Attendance corrections saved! Audit log updated.');
        } catch {
            toast.error('Failed to save corrections');
        } finally {
            setSaving(false);
        }
    }, [students]);

    return { students, loading, saving, error, fetch, updateStatus, updateODReason, save };
}
