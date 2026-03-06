// ─── useODLeaveEntry hook ─────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from 'react';
import { ODLeaveStudent, AttendancePeriodKey } from '../features/shared/attendance.types';
import { fetchODLeaveStudents, saveODLeaveEntries } from '../api/attendance.api';
import { format } from 'date-fns';
import { toast } from 'sonner';

export function useODLeaveEntry(date: Date | undefined) {
    const [students, setStudents] = useState<ODLeaveStudent[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const load = useCallback(async (d: Date) => {
        setLoading(true);
        try {
            const data = await fetchODLeaveStudents(format(d, 'yyyy-MM-dd'));
            setStudents(data);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (date) load(date);
    }, [date, load]);

    const updatePeriod = useCallback((id: number, period: AttendancePeriodKey, value: string) => {
        setStudents((prev) => prev.map((s) => s.id === id ? { ...s, [period]: value } : s));
    }, []);

    const updateRemarks = useCallback((id: number, remarks: string) => {
        setStudents((prev) => prev.map((s) => s.id === id ? { ...s, remarks } : s));
    }, []);

    const save = useCallback(async () => {
        setSaving(true);
        try {
            await saveODLeaveEntries(students);
            toast.success('OD/Leave entries saved successfully!');
        } catch {
            toast.error('Failed to save entries');
        } finally {
            setSaving(false);
        }
    }, [students]);

    return { students, loading, saving, updatePeriod, updateRemarks, save };
}
