// ─── useAttendanceCorrection hook ────────────────────────────────────────────
// Principal: fetch students for a year+date+period with single period row.
// Saves via POST /attendance/correct-bulk (create + update in one call).

import { useState, useCallback } from 'react';
import { apiClient } from '../../../api/apiClient';
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
    slot_id: number | null;
    subject_name: string;
    subject_code: string;
    subject_id?: number;
    submitted_by?: number;
    submitter_name: string;
    current_year: number;
    records: studentpri[];
}



5

export function useAttendanceCorrection() {
    const [meta, setMeta] = useState<Omit<FetchResponse, 'records'> | null>(null);
    const [students, setStudents] = useState<studentpri[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentDate, setCurrentDate] = useState('');
    const [dirtyIds, setDirtyIds] = useState<Set<number>>(new Set());

    const fetch = useCallback(async (year: string, date: Date, period: string, batchId?: string, batchType?: string) => {
        setLoading(true);
        setError(null);
        try {
            // Fix local timezone offset issue that shifts dates backward
            const yearVal = date.getFullYear();
            const monthVal = String(date.getMonth() + 1).padStart(2, '0');
            const dayVal = String(date.getDate()).padStart(2, '0');
            const dateStr = `${yearVal}-${monthVal}-${dayVal}`;

            const params: Record<string, string> = { year, date: dateStr, period };
            if (batchId) params.batch_id = batchId;
            if (batchType) params.batch_type = batchType;

            const data = await apiClient.get<FetchResponse>('/attendance/fetch-students-pri', params);
            const { records, ...metaData } = data;

            setMeta(metaData);
            setStudents(records.map(r => ({ ...r, remarks: '' })));
            setCurrentDate(dateStr);
            setDirtyIds(new Set()); // Reset dirty tracking on fresh fetch
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
        setDirtyIds(prev => new Set(prev).add(studentId));
    }, []);

    const updateODReason = useCallback((studentId: number, od_reason: string) => {
        setStudents(prev => prev.map(s =>
            s.student_id === studentId ? { ...s, od_reason } : s
        ));
        setDirtyIds(prev => new Set(prev).add(studentId));
    }, []);

    const updateIsLocked = useCallback((studentId: number, is_locked: number) => {
        setStudents(prev => prev.map(s =>
            s.student_id === studentId ? { ...s, is_locked } : s
        ));
        setDirtyIds(prev => new Set(prev).add(studentId));
    }, []);

    const updateRemarks = useCallback((studentId: number, remarks: string) => {
        setStudents(prev => prev.map(s =>
            s.student_id === studentId ? { ...s, remarks } : s
        ));
        setDirtyIds(prev => new Set(prev).add(studentId));
    }, []);

    const save = useCallback(async () => {
        setSaving(true);
        try {
            const recordsToSave = students.filter(s => dirtyIds.has(s.student_id));

            if (recordsToSave.length === 0) {
                toast.info('No changes to save');
                return;
            }

            if (!meta?.slot_id || !meta?.subject_id) {
                toast.error('Missing class context (Subject/Slot). Cannot save new unrecorded attendances. Tell Staff to take attendance first.');
                return;
            }

            await apiClient.post('/attendance/save-student-pri', { 
                records: recordsToSave,
                date: currentDate,
                slot_id: meta.slot_id,
                subject_id: meta.subject_id
            });
            
            toast.success(`Saved ${recordsToSave.length} attendance records!`);
            setDirtyIds(new Set()); // Clear dirty flags after successful save
        } catch {
            toast.error('Failed to save corrections');
        } finally {
            setSaving(false);
        }
    }, [students, meta, currentDate, dirtyIds]);

    return { meta, students, loading, saving, error, fetch, updateStatus, updateODReason, updateIsLocked, updateRemarks, save };
}
