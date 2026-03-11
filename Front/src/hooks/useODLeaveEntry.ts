// ─── useODLeaveEntry hook ─────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from 'react';
import { ODLeaveStudent, AttendancePeriodKey } from '../features/shared/attendance.types';
import { fetchODLeaveStudents, saveODLeaveEntries } from '../api/attendance.api';
import { ApiError } from '../api/apiClient';
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
        } catch (err) {
            if (err instanceof ApiError && err.code === 'PAST_DATE') {
                toast.error('Cannot load OD/Leave entries for past dates');
            } else {
                toast.error('Failed to load OD/Leave entries');
            }
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
            // saveODLeaveEntries expects a single entry; send modified entries with status in body
            for (const student of students) {
                if (student.status) {
                    await saveODLeaveEntries({
                        student_id: student.id,
                        slot_id: student.slot_id,
                        date: student.date,
                        status: student.status, // Sends status in body as required
                        od_reason: student.remarks || undefined,
                        semester_id: 1, // Default — backend typically derives this
                    });
                }
            }
            toast.success('OD/Leave entries saved successfully!');
        } catch (err) {
            if (err instanceof ApiError && err.code === 'PAST_DATE') {
                toast.error('Cannot submit OD/Leave entries for past dates');
            } else {
                toast.error('Failed to save entries');
            }
        } finally {
            setSaving(false);
        }
    }, [students]);

    return { students, loading, saving, updatePeriod, updateRemarks, save };
}
