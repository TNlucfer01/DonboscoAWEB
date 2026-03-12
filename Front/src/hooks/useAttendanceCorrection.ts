// ─── useAttendanceCorrection hook ────────────────────────────────────────────
// Principal: fetch students for a year+date+period with single period row.
// Saves via POST /attendance/correct-bulk (create + update in one call).

import { useState, useCallback } from 'react';
import { apiClient } from '../api/apiClient';
import { format } from 'date-fns';
import { toast } from 'sonner';

export interface studentpri {
    record_id: number;
    student_id: number;
    student_name: string;
    roll_number: string;
    status: string;
    od_reason: string | null;
    is_locked: number; // 0 or 1
    remarks: string;   // added for frontend
}

export interface FetchResponse {
    slot_number: number;
    subject_name: string;
    subject_code: string;
    submitter_name: string;
    current_year: number;
    records: studentpri[];
}

export function useAttendanceCorrection() {
    const [meta, setMeta] = useState<Omit<FetchResponse, 'records'> | null>(null);
    const [students, setStudents] = useState<studentpri[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentDate, setCurrentDate] = useState('');

    const fetch = useCallback(async (year: string, date: Date, period: string) => {
        setLoading(true);
        setError(null);
        try {
            const dateStr = format(date, 'yyyy-MM-dd');
            const data = await apiClient.get<FetchResponse>('/attendance/fetch-students-pri', {
                year,
                date: dateStr,
                period,
            });
            const { records, ...metaData } = data;

            setMeta(metaData);
            setStudents(records.map(r => ({ ...r, remarks: '' })));
            setCurrentDate(dateStr);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch students');
        } finally {
            setLoading(false);
        }
    }, []);

    const updateStatus = useCallback((studentId: number, status: string) => {
        setStudents(prev => prev.map(s =>
            s.student_id === studentId ? { ...s, status } : s
        ));
    }, []);

    const updateODReason = useCallback((studentId: number, od_reason: string) => {
        setStudents(prev => prev.map(s =>
            s.student_id === studentId ? { ...s, od_reason } : s
        ));
    }, []);

    const updateIsLocked = useCallback((studentId: number, is_locked: number) => {
        setStudents(prev => prev.map(s =>
            s.student_id === studentId ? { ...s, is_locked } : s
        ));
    }, []);

    const updateRemarks = useCallback((studentId: number, remarks: string) => {
        setStudents(prev => prev.map(s =>
            s.student_id === studentId ? { ...s, remarks } : s
        ));
    }, []);

    const save = useCallback(async () => {
        setSaving(true);
        try {
            const recordsToSave = students.filter(s=>s.is_locked==1);

            if (recordsToSave.length === 0) {
                toast.info('No changes to save');
                return;
            }

            await apiClient.post('/attendance/save-student-pri', { records: recordsToSave });
            toast.success(`Saved ${recordsToSave.length} attendance records!`);
        } catch {
            toast.error('Failed to save corrections');
        } finally {
            setSaving(false);
        }
    }, [students, meta, currentDate]);

    return { meta, students, loading, saving, error, fetch, updateStatus, updateODReason, updateIsLocked, updateRemarks, save };
}
