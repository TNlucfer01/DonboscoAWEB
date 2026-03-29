// ─── useStaffAttendance hook ──────────────────────────────────────────────────

import { useState, useCallback } from 'react';
import { StaffStudent } from '../../shared/attendance.types';
import { fetchStaffStudents, submitStaffAttendance } from '../../../api/attendance.api';
import { ApiError } from '../../../api/apiClient';
import { toast } from 'sonner';

export function useStaffAttendance() {
    const [students, setStudents] = useState<StaffStudent[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [fetched, setFetched] = useState(false);
    const [remainingMinutes, setRemainingMinutes] = useState<number>(0);
    // G03: Capture date at fetch-time to prevent midnight boundary mismatch on submit
    const [fetchedDate, setFetchedDate] = useState<string>('');

    const fetch = useCallback(async (year: string, batch: string, classType: string, period: string, subject: string) => {
        setLoading(true);
        try {
            // G03: Build and store today's date at fetch-time
            const n = new Date();
            const todayStr = `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}-${String(n.getDate()).padStart(2,'0')}`;
            const result = await fetchStaffStudents(year, batch, classType, period, subject);
            setStudents(result.students);
            setRemainingMinutes(result.remainingMinutes);
            setFetchedDate(todayStr);
            setFetched(true);
        } catch (err) {
            if (err instanceof ApiError && err.code === 'PAST_DATE') {
                toast.error('Cannot fetch attendance for past dates');
            } else {
                toast.error('Failed to fetch students');
            }
        } finally {
            setLoading(false);
        }
    }, []);

    const updateStatus = useCallback((id: number, status: string) => {
        setStudents((prev) => prev.map((s) => s.id === id ? { ...s, status } : s));
    }, []);

    const markAllPresent = useCallback(() => {
        setStudents((prev) => prev.map((s) => s.isLocked ? s : { ...s, status: 'PRESENT' }));
    }, []);

    const submit = useCallback(async (year: string, batch: string, period: string, subject: string) => {
        setSubmitting(true);
        try {
            // G03: Always use the date captured at fetch-time to avoid midnight boundary mismatch
            const updatedStudents = await submitStaffAttendance(year, batch, period, subject, students, fetchedDate);
            setStudents(updatedStudents);
            toast.success('Attendance saved successfully!');
        } catch (err) {
            if (err instanceof ApiError && err.code === 'PAST_DATE') {
                toast.error('Cannot submit attendance for past dates');
            } else {
                toast.error('Failed to submit attendance');
            }
        } finally {
            setSubmitting(false);
        }
    }, [students, fetchedDate]);

    return { students, loading, submitting, fetched, remainingMinutes, fetch, updateStatus, markAllPresent, submit };
}
