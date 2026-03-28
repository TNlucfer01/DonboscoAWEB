// ─── useODLeaveEntry hook (redesigned) ────────────────────────────────────────
import { useState, useCallback } from 'react';
import { fetchStudentsForODDate, bulkSaveODIL, ODILStudentRow } from '../../../api/attendance-odil.api';
import { getActiveSemester } from '../../../api/semester.api';
import { ApiError } from '../../../api/apiClient';
import { toast } from 'sonner';

export interface ODILRowState {
    student_id: number;
    name: string;
    roll_number: string;
    periods: {
        1: 'OD' | 'INFORMED_LEAVE' | null;
        2: 'OD' | 'INFORMED_LEAVE' | null;
        3: 'OD' | 'INFORMED_LEAVE' | null;
        4: 'OD' | 'INFORMED_LEAVE' | null;
        5: 'OD' | 'INFORMED_LEAVE' | null;
    };
    od_reason: string;
}

export function useODLeaveEntry() {
    const [date, setDate] = useState<Date | undefined>(undefined);
    const [rows, setRows] = useState<ODILRowState[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [isLocked, setIsLocked] = useState(false); // true once submitted or if already submitted
    const [activeSemesterId, setActiveSemesterId] = useState<number | null>(null);

    const ensureSemester = useCallback(async () => {
        if (activeSemesterId) return activeSemesterId;
        const sem = await getActiveSemester();
        if (sem) { setActiveSemesterId(sem.semester_id); return sem.semester_id; }
        return null;
    }, [activeSemesterId]);

    const loadStudents = useCallback(async (selectedDate: Date) => {
        setLoading(true);
        setRows([]);
        setIsLocked(false);
        try {
            const dateStr = selectedDate.toLocaleDateString('en-CA'); // YYYY-MM-DD in local time
            const data = await fetchStudentsForODDate(dateStr);

            setRows(data.students.map((s: ODILStudentRow) => ({
                student_id: s.student_id,
                name: s.name,
                roll_number: s.roll_number,
                periods: s.periods || { 1: null, 2: null, 3: null, 4: null, 5: null },
                od_reason: s.od_reason || '',
            })));

            if (data.alreadySubmitted) {
                setIsLocked(true);
                toast.info('OD/IL entries already submitted for this date. Showing read-only view.');
            }
        } catch (err) {
            if (err instanceof ApiError && err.code === 'PAST_DATE') {
                toast.error('Cannot load OD/IL for past dates. Please select a future date.');
            } else {
                toast.error('Failed to load students. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    }, []);

    const updateStatus = useCallback((student_id: number, period: number, status: 'OD' | 'INFORMED_LEAVE' | null) => {
        setRows(prev => prev.map(r => r.student_id === student_id ? { ...r, periods: { ...r.periods, [period]: status } } : r));
    }, []);

    const updateAllStatus = useCallback((student_id: number, status: 'OD' | 'INFORMED_LEAVE' | null) => {
        setRows(prev => prev.map(r => r.student_id === student_id ? { 
            ...r, 
            periods: { 1: status, 2: status, 3: status, 4: status, 5: status }
        } : r));
    }, []);

    const updateReason = useCallback((student_id: number, od_reason: string) => {
        setRows(prev => prev.map(r => r.student_id === student_id ? { ...r, od_reason } : r));
    }, []);

    const submit = useCallback(async () => {
        if (!date) return;
        const semId = await ensureSemester();
        if (!semId) { toast.error('No active semester found. Cannot save entries.'); return; }

        const dateStr = date.toLocaleDateString('en-CA');
        const entries: { student_id: number, date: string, slot_id: number, status: 'OD' | 'INFORMED_LEAVE', od_reason?: string }[] = [];

        for (const r of rows) {
            for (let slot_id = 1; slot_id <= 5; slot_id++) {
                const status = r.periods[slot_id as keyof typeof r.periods];
                if (status === 'OD' || status === 'INFORMED_LEAVE') {
                    entries.push({
                        student_id: r.student_id,
                        date: dateStr,
                        slot_id,
                        status,
                        od_reason: r.od_reason || undefined,
                    });
                }
            }
        }

        if (entries.length === 0) {
            toast.info('No students marked as OD or Informed Leave. Nothing to save.');
            return;
        }

        setSaving(true);
        try {
            const result = await bulkSaveODIL(entries, semId);
            setIsLocked(true);
            toast.success(`Saved and locked OD/IL entries for ${result.saved} student(s).`);
        } catch (err) {
            if (err instanceof ApiError && err.code === 'PAST_DATE') {
                toast.error('Cannot submit OD/IL for past dates.');
            } else {
                toast.error('Failed to save entries. Please try again.');
            }
        } finally {
            setSaving(false);
        }
    }, [date, rows, ensureSemester]);

    return { date, setDate, rows, loading, saving, isLocked, loadStudents, updateStatus, updateAllStatus, updateReason, submit };
}
