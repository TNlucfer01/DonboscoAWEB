import { useState, useMemo } from 'react';
import Layout from '../../app/components/Layout';
import { Button } from '../../app/components/ui/button';
import { Input } from '../../app/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../app/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../app/components/ui/select';
import { Checkbox } from '../../app/components/ui/checkbox';
import { PageProps } from '../shared/types';
import { SelectField } from '../shared/SelectField';
import { DatePickerField } from '../shared/DatePickerField';
import { YEAR_OPTIONS } from '../shared/constants';
import {
    useAttendanceCorrection,
    PERIOD_KEYS,
    type PeriodKey,
    type PeriodSlot,
} from '../../hooks/useAttendanceCorrection';
import { format } from 'date-fns';
import { Loader2, Search } from 'lucide-react';

const STATUS_OPTIONS = [
    { value: 'PRESENT', label: 'P' },
    { value: 'ABSENT', label: 'A' },
    { value: 'OD', label: 'OD' },
    { value: 'INFORMED_LEAVE', label: 'IL' },
];

const PERIOD_OPTIONS = [
    { value: 'all', label: 'All Periods' },
    { value: '1', label: 'Period 1' },
    { value: '2', label: 'Period 2' },
    { value: '3', label: 'Period 3' },
    { value: '4', label: 'Period 4' },
    { value: '5', label: 'Period 5' },
];

export default function AttendanceCorrection({ user, onLogout }: PageProps) {
    const [year, setYear] = useState('');
    const [date, setDate] = useState<Date | undefined>(undefined);
    const [period, setPeriod] = useState('all');
    const [search, setSearch] = useState('');
    const [fetched, setFetched] = useState(false);
    const {
        students, loading, saving, error,
        selectedPeriod, subjectName, subjectCode,
        fetch, updatePeriodStatus, updateLocked, updateRemarks, save,
    } = useAttendanceCorrection();

    const handleFetch = async () => {
        if (!year || !date) return;
        await fetch(year, date, period !== 'all' ? Number(period) : undefined);
        setFetched(true);
        setSearch('');
    };

    // Live search by roll number
    const filtered = useMemo(() => {
        if (!search.trim()) return students;
        return students.filter(s =>
            s.roll_number.toLowerCase().includes(search.trim().toLowerCase())
        );
    }, [students, search]);

    // When a specific period is selected, only that period key matters
    const singlePeriodKey = selectedPeriod ? `period${selectedPeriod}` as PeriodKey : null;

    return (
        <Layout user={user} onLogout={onLogout}>
            <div className="space-y-6">
                <h1 className="text-2xl text-slate-800">Attendance Correction</h1>

                {/* ── Filter Bar ─────────────────────────────────── */}
                <Card className="border-2 border-slate-300">
                    <CardHeader><CardTitle className="text-slate-800">Select Criteria</CardTitle></CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
                            <SelectField label="Year *" value={year} options={YEAR_OPTIONS} onValueChange={setYear} />
                            <div><DatePickerField date={date} onDateChange={setDate} label="Date *" /></div>
                            <SelectField
                                label="Period (optional)"
                                value={period}
                                options={PERIOD_OPTIONS}
                                onValueChange={setPeriod}
                            />
                            <Button
                                onClick={handleFetch}
                                disabled={loading || !year || !date}
                                className="bg-slate-700 hover:bg-slate-800 text-white"
                            >
                                {loading
                                    ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Fetching…</>
                                    : 'Fetch Attendance'}
                            </Button>
                        </div>
                        {error && <p className="text-red-600 text-sm mt-3">{error}</p>}
                    </CardContent>
                </Card>

                {/* ── Results ─────────────────────────────────────── */}
                {fetched && !loading && (
                    students.length === 0 ? (
                        <p className="text-center text-slate-500 py-12">
                            No records found for Year {year} on {date && format(date, 'PP')}.
                        </p>
                    ) : (
                        <Card className="border-2 border-slate-300">
                            <CardHeader>
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div>
                                        <CardTitle className="text-slate-800">
                                            {selectedPeriod
                                                ? `Period ${selectedPeriod}${subjectName ? ` — ${subjectName}${subjectCode ? ` (${subjectCode})` : ''}` : ''}`
                                                : 'All Periods'
                                            }
                                            {' '}— Year {year} — {date && format(date, 'PPP')}
                                        </CardTitle>
                                        <p className="text-sm text-slate-600 mt-1">
                                            P = Present &nbsp;A = Absent &nbsp;OD = On Duty &nbsp;IL = Informed Leave
                                        </p>
                                    </div>
                                    <Button onClick={save} disabled={saving} className="bg-slate-700 hover:bg-slate-800 text-white shrink-0">
                                        {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving…</> : 'Save Changes'}
                                    </Button>
                                </div>

                                {/* ── Search ───────────────────── */}
                                <div className="relative mt-3 max-w-xs">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                        placeholder="Search by Roll No…"
                                        className="pl-9 border-slate-300 text-sm h-9"
                                    />
                                </div>
                            </CardHeader>

                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse text-sm">
                                        <thead>
                                            <tr className="bg-slate-100 border-2 border-slate-300">
                                                {singlePeriodKey ? (
                                                    // ── Single period view: compact columns ──────────
                                                    <>
                                                        {['S.No', 'Roll No', 'Name', 'Year', 'Status', 'Unlock', 'Remarks'].map(h => (
                                                            <th key={h} className="border border-slate-300 px-3 py-2 text-left text-slate-700 whitespace-nowrap">{h}</th>
                                                        ))}
                                                    </>
                                                ) : (
                                                    // ── All-period view: 5 columns ──────────────────
                                                    <>
                                                        {['S.No', 'Roll No', 'Name', 'Year', 'P1', 'P2', 'P3', 'P4', 'P5', 'Remarks'].map((h, hi) => {
                                                            const pNum = hi >= 4 && hi <= 8 ? hi - 3 : null;
                                                            return (
                                                                <th key={h} className={`border border-slate-300 px-3 py-2 text-left text-slate-700 whitespace-nowrap`}>{h}</th>
                                                            );
                                                        })}
                                                    </>
                                                )}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filtered.length === 0 ? (
                                                <tr>
                                                    <td colSpan={singlePeriodKey ? 7 : 10} className="text-center py-6 text-slate-400">
                                                        No students match "{search}"
                                                    </td>
                                                </tr>
                                            ) : filtered.map((s, i) => (
                                                <tr key={s.student_id} className="border border-slate-300 hover:bg-slate-50">
                                                    <td className="border border-slate-300 px-3 py-2 text-slate-700">{i + 1}</td>
                                                    <td className="border border-slate-300 px-3 py-2 font-medium text-slate-800">{s.roll_number}</td>
                                                    <td className="border border-slate-300 px-3 py-2 text-slate-700 whitespace-nowrap">{s.name}</td>
                                                    <td className="border border-slate-300 px-3 py-2 text-slate-600 text-center">{s.current_year}</td>

                                                    {singlePeriodKey ? (
                                                        // ── Single period: Status dropdown + Unlock checkbox ──
                                                        <>
                                                            <td className="border border-slate-300 px-2 py-2 min-w-[80px]">
                                                                <Select
                                                                    value={(s[singlePeriodKey] as PeriodSlot).status}
                                                                    onValueChange={v => updatePeriodStatus(s.student_id, singlePeriodKey, v)}
                                                                >
                                                                    <SelectTrigger className="h-8 border-slate-300 text-xs px-2">
                                                                        <SelectValue />
                                                                    </SelectTrigger>
                                                                    <SelectContent className="bg-white border-2 border-slate-300">
                                                                        {STATUS_OPTIONS.map(o => (
                                                                            <SelectItem key={o.value} value={o.value} className="text-xs">{o.label}</SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            </td>
                                                            {/* Unlock checkbox — unchecks is_locked */}
                                                            <td className="border border-slate-300 px-3 py-2 text-center">
                                                                <Checkbox
                                                                    checked={!(s[singlePeriodKey] as PeriodSlot).is_locked}
                                                                    onCheckedChange={checked =>
                                                                        updateLocked(s.student_id, singlePeriodKey, !checked)
                                                                    }
                                                                    title="Unlock this record for staff editing"
                                                                />
                                                            </td>
                                                        </>
                                                    ) : (
                                                        // ── All periods: 5 status dropdowns ──────────────
                                                        PERIOD_KEYS.map((pk, pi) => {
                                                            const slot = s[pk] as PeriodSlot;
                                                            return (
                                                                <td key={pk} className="border border-slate-300 px-2 py-2 min-w-[70px]">
                                                                    <Select
                                                                        value={slot.status}
                                                                        onValueChange={v => updatePeriodStatus(s.student_id, pk, v)}
                                                                    >
                                                                        <SelectTrigger className="h-8 border-slate-300 text-xs px-2">
                                                                            <SelectValue />
                                                                        </SelectTrigger>
                                                                        <SelectContent className="bg-white border-2 border-slate-300">
                                                                            {STATUS_OPTIONS.map(o => (
                                                                                <SelectItem key={o.value} value={o.value} className="text-xs">{o.label}</SelectItem>
                                                                            ))}
                                                                        </SelectContent>
                                                                    </Select>
                                                                </td>
                                                            );
                                                        })
                                                    )}

                                                    {/* ── Remarks always last ─────────── */}
                                                    <td className="border border-slate-300 px-2 py-2 min-w-[160px]">
                                                        <Input
                                                            value={s.remarks ?? ''}
                                                            onChange={e => updateRemarks(s.student_id, e.target.value)}
                                                            placeholder="Add remarks"
                                                            className="h-8 border-slate-300 text-xs"
                                                        />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    )
                )}
            </div>
        </Layout>
    );
}
