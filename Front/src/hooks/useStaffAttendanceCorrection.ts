// ─── useStaffAttendanceCorrection hook ────────────────────────────────────────

import { useState, useCallback } from 'react';
import { StaffStudent } from '../features/shared/attendance.types';
import { fetchStaffCorrectionStudents, submitStaffCorrectionAttendance, CorrectionMetadata } from '../api/attendance.api';
import { ApiError } from '../api/apiClient';
import { toast } from 'sonner';

export function useStaffAttendanceCorrection() {
    const [students, setStudents] = useState<StaffStudent[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [fetched, setFetched] = useState(false);
    const [remainingMinutes, setRemainingMinutes] = useState<number>(0);
    const [metadata, setMetadata] = useState<CorrectionMetadata | null>(null);

    const fetch = useCallback(async (year: string, batch: string, classType: string, period: string, subject: string, date: string) => {
        setLoading(true);
        try {
            const result = await fetchStaffCorrectionStudents(year, batch, classType, period, subject, date);
            setStudents(result.students);
            setRemainingMinutes(result.remainingMinutes);
            setMetadata(result.metadata);
            setFetched(true);
        } catch (err) {
            if (err instanceof ApiError && err.code === 'FUTURE_DATE') {
                toast.error('Cannot access future dates for attendance');
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
        setStudents((prev) => prev.map((s) => s.isLocked ? s : { ...s, status: 'Present' }));
    }, []);

    const submit = useCallback(async (year: string, batch: string, period: string, subject: string, date: string) => {
        setSubmitting(true);
        try {
            const updatedStudents = await submitStaffCorrectionAttendance(year, batch, period, subject, students, date);
            setStudents(updatedStudents);
            toast.success('Attendance correction saved successfully!');
        } catch (err) {
             if (err instanceof ApiError && err.code === 'FUTURE_DATE') {
                toast.error('Cannot access future dates for attendance');
            } else {
                toast.error('Failed to submit attendance correction');
            }
        } finally {
            setSubmitting(false);
        }
    }, [students]);

    return { students, metadata, loading, submitting, fetched, remainingMinutes, fetch, updateStatus, markAllPresent, submit };
}
