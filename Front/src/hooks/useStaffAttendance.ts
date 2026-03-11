// ─── useStaffAttendance hook ──────────────────────────────────────────────────

import { useState, useCallback } from 'react';
import { StaffStudent } from '../features/shared/attendance.types';
import { fetchStaffStudents, submitStaffAttendance } from '../api/attendance.api';
import { toast } from 'sonner';

export function useStaffAttendance() {
    const [students, setStudents] = useState<StaffStudent[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [fetched, setFetched] = useState(false);

    const fetch = useCallback(async (year: string, batch: string, classType: string, period: string, subject: string) => {
        setLoading(true);
        try {
            const data = await fetchStaffStudents(year, batch, classType, period, subject);
            setStudents(data);
            setFetched(true);
        } catch {
            toast.error('Failed to fetch students');
        } finally {
            setLoading(false);
        }
    }, []);

    const updateStatus = useCallback((id: number, status: string) => {
        setStudents((prev) => prev.map((s) => s.id === id ? { ...s, status } : s));
    }, []);

    const markAllPresent = useCallback(() => {
        setStudents((prev) => prev.map((s) => ({ ...s, status: 'Present' })));
    }, []);

    const submit = useCallback(async (year: string, batch: string, period: string, subject: string) => {
        setSubmitting(true);
        try {
            await submitStaffAttendance(year, batch, period, subject, students);
            toast.success('Attendance saved successfully!');
        } catch {
            toast.error('Failed to submit attendance');
        } finally {
            setSubmitting(false);
        }
    }, [students]);

    return { students, loading, submitting, fetched, fetch, updateStatus, markAllPresent, submit };
}
