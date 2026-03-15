// ─── useODLeaveEntry hook ─────────────────────────────────────────────────────

import { useState, useCallback } from 'react';
import { ODLeaveStudent, AttendancePeriodKey } from '../features/shared/attendance.types';
import { fetchODLeaveStudents, saveODLeaveEntries } from '../api/attendance.api';
import { getActiveSemester } from '../api/semester.api';
import { ApiError } from '../api/apiClient';
import { toast } from 'sonner';

export function useODLeaveEntry(year: string) {
    const [students, setStudents] = useState<ODLeaveStudent[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [activeSemesterId, setActiveSemesterId] = useState<number | null>(null);

    // Fetch active semester lazily
    const ensureSemester = useCallback(async () => {
        if (activeSemesterId) return activeSemesterId;
        const sem = await getActiveSemester();
        if (sem) {
            setActiveSemesterId(sem.semester_id);
            return sem.semester_id;
        }
        return null;
    }, [activeSemesterId]);

    const load = useCallback(async (yr: string) => {
        setLoading(true);
        try {
            const data = await fetchODLeaveStudents(yr);
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

    const addStudent = useCallback((student: ODLeaveStudent) => {
        setStudents(prev => [...prev, student]);
    }, []);

    const updatePeriod = useCallback((id: number, period: AttendancePeriodKey, value: string) => {
        setStudents((prev) => prev.map((s) => s.id === id ? { ...s, [period]: value } : s));
    }, []);

    const updateRemarks = useCallback((id: number, remarks: string) => {
        setStudents((prev) => prev.map((s) => s.id === id ? { ...s, remarks } : s));
    }, []);

    const save = useCallback(async () => {
        const semId = await ensureSemester();
        if (!semId) {
            toast.error('No active semester found. Cannot save entries.');
            return;
        }
        setSaving(true);
        try {
            for (const student of students) {
                if (student.status) {
                    await saveODLeaveEntries({
                        student_id: student.id,
                        slot_id: student.slot_id,
                        date: student.date,
                        status: student.status,
                        od_reason: student.remarks || undefined,
                        semester_id: semId,
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
    }, [students, ensureSemester]);

    return { students, loading, saving, addStudent, updatePeriod, updateRemarks, save, load };
}
