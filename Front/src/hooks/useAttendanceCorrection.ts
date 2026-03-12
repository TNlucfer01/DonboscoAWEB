// ─── useAttendanceCorrection hook ────────────────────────────────────────────
// Principal: fetch all students for a year+date with pivoted 5-period rows.
// Saves via POST /attendance/correct-bulk (create + update in one call).

import { useState, useCallback } from 'react';
import { apiClient } from '../api/apiClient';
import { format } from 'date-fns';
import { toast } from 'sonner';

export interface PeriodSlot {
    record_id: number | null;   // null = no existing record (will be created on save)
    slot_id: number;            // always present — from slotMap for empty slots
    status: string;             // defaults to 'PRESENT' for empty slots
    od_reason: string | null;
    subject: string | null;
}

export interface StudentCorrectionRow {
    student_id: number;
    name: string;
    roll_number: string;
    current_year: number;
    period1: PeriodSlot;   // always defined (never null) — empty slots get default
    period2: PeriodSlot;
    period3: PeriodSlot;
    period4: PeriodSlot;
    period5: PeriodSlot;
    remarks: string;
    [key: string]: PeriodSlot | number | string; // allow PeriodKey indexed access
}

export type PeriodKey = 'period1' | 'period2' | 'period3' | 'period4' | 'period5';
export const PERIOD_KEYS: PeriodKey[] = ['period1', 'period2', 'period3', 'period4', 'period5'];

// Backend response shape
interface FetchResponse {
    slotMap: Record<number, number>; // { slotNumber: slot_id }
    students: RawStudentRow[];
}

interface RawPeriodSlot {
    record_id: number;
    slot_id: number;
    status: string;
    od_reason: string | null;
    subject: string | null;
}

interface RawStudentRow {
    student_id: number;
    name: string;
    roll_number: string;
    current_year: number;
    period1: RawPeriodSlot | null;
    period2: RawPeriodSlot | null;
    period3: RawPeriodSlot | null;
    period4: RawPeriodSlot | null;
    period5: RawPeriodSlot | null;
}

// Converts raw API row into a StudentCorrectionRow where every period always has a slot
function buildRow(raw: RawStudentRow, slotMap: Record<number, number>, date: string): StudentCorrectionRow {
    function makeSlot(rawSlot: RawPeriodSlot | null, slotNumber: number): PeriodSlot {
        if (rawSlot) {
            return {
                record_id: rawSlot.record_id,
                slot_id: rawSlot.slot_id,
                status: rawSlot.status,
                od_reason: rawSlot.od_reason,
                subject: rawSlot.subject,
            };
        }
        // No existing record — default to PRESENT; slot_id comes from slotMap
        return {
            record_id: null,
            slot_id: slotMap[slotNumber],
            status: 'PRESENT',
            od_reason: null,
            subject: null,
        };
    }

    return {
        student_id: raw.student_id,
        name: raw.name,
        roll_number: raw.roll_number,
        current_year: raw.current_year,
        period1: makeSlot(raw.period1, 1),
        period2: makeSlot(raw.period2, 2),
        period3: makeSlot(raw.period3, 3),
        period4: makeSlot(raw.period4, 4),
        period5: makeSlot(raw.period5, 5),
        remarks: '',
        _date: date, // stash for save
    } as unknown as StudentCorrectionRow;
}

export function useAttendanceCorrection() {
    const [students, setStudents] = useState<StudentCorrectionRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentDate, setCurrentDate] = useState('');

    const fetch = useCallback(async (year: string, date: Date) => {
        setLoading(true);
        setError(null);
        try {
            const dateStr = format(date, 'yyyy-MM-dd');
            const data = await apiClient.get<FetchResponse>('/attendance/fetch-students-pri', {
                year,
                date: dateStr,
            });
            const rows = data.students.map(s => buildRow(s, data.slotMap as any, dateStr));
            setStudents(rows);
            setCurrentDate(dateStr);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch students');
        } finally {
            setLoading(false);
        }
    }, []);

    const updatePeriodStatus = useCallback((studentId: number, period: PeriodKey, status: string) => {
        setStudents(prev => prev.map(s => {
            if (s.student_id !== studentId) return s;
            return { ...s, [period]: { ...s[period] as PeriodSlot, status } };
        }));
    }, []);

    const updatePeriodODReason = useCallback((studentId: number, period: PeriodKey, od_reason: string) => {
        setStudents(prev => prev.map(s => {
            if (s.student_id !== studentId) return s;
            return { ...s, [period]: { ...s[period] as PeriodSlot, od_reason } };
        }));
    }, []);

    const updateRemarks = useCallback((studentId: number, remarks: string) => {
        setStudents(prev => prev.map(s =>
            s.student_id === studentId ? { ...s, remarks } : s
        ));
    }, []);

    // Build all 5 records per student × all students and send to correct-bulk
    const save = useCallback(async () => {
        setSaving(true);
        try {
            const records: object[] = [];

            for (const s of students) {
                for (const period of PERIOD_KEYS) {
                    const slot = s[period] as PeriodSlot;
                    if (!slot || !slot.slot_id) continue; // skip if no slot_id (no such slot in DB)
                    records.push({
                        record_id: slot.record_id,       // null → create; number → update
                        student_id: s.student_id,
                        slot_id: slot.slot_id,
                        date: currentDate,
                        new_status: slot.status,
                        od_reason: slot.od_reason || null,
                    });
                }
            }

            if (records.length === 0) {
                toast.info('No changes to save');
                return;
            }

            await apiClient.post('/attendance/correct-bulk', { records });
            toast.success(`Saved ${records.length} attendance records!`);
        } catch {
            toast.error('Failed to save corrections');
        } finally {
            setSaving(false);
        }
    }, [students, currentDate]);

    return { students, loading, saving, error, fetch, updatePeriodStatus, updatePeriodODReason, updateRemarks, save };
}
