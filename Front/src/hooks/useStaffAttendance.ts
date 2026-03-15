// ─── useStaffAttendance hook ──────────────────────────────────────────────────

import { useState, useCallback } from 'react';
import { StaffStudent } from '../features/shared/attendance.types';
import { fetchStaffStudents, submitStaffAttendance } from '../api/attendance.api';
import { ApiError } from '../api/apiClient';
import { toast } from 'sonner';

export function useStaffAttendance() {
    const [students, setStudents] = useState<StaffStudent[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [fetched, setFetched] = useState(false);
    const [remainingMinutes, setRemainingMinutes] = useState<number>(0);

    const fetch = useCallback(async (year: string, batch: string, classType: string, period: string, subject: string) => {
        setLoading(true);
        try {
            const result = await fetchStaffStudents(year, batch, classType, period, subject);
            setStudents(result.students);
            setRemainingMinutes(result.remainingMinutes);
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

    const submit = useCallback(async (year: string, batch: string, period: string, subject: string, date: string) => {
        setSubmitting(true);
        try {
            const updatedStudents = await submitStaffAttendance(year, batch, period, subject, students, date);
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
    }, [students]);

    return { students, loading, submitting, fetched, remainingMinutes, fetch, updateStatus, markAllPresent, submit };
}
