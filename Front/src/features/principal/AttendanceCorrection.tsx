import { useState, useMemo } from 'react';
import Layout from '../../app/components/Layout';
import { Button } from '../../app/components/ui/button';
import { Input } from '../../app/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../app/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../app/components/ui/select';
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

export default function AttendanceCorrection({ user, onLogout }: PageProps) {
    const [year, setYear] = useState('');
    const [date, setDate] = useState<Date | undefined>(undefined);
    const [search, setSearch] = useState('');
    const [fetched, setFetched] = useState(false);
    const { students, loading, saving, error, fetch, updatePeriodStatus, updatePeriodODReason, updateRemarks, save } = useAttendanceCorrection();

    const handleFetch = async () => {
        if (!year || !date) return;
        await fetch(year, date);
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

    return (
        <Layout user={user} onLogout={onLogout}>
            <div className="space-y-6">
                <h1 className="text-2xl text-slate-800">Attendance Correction</h1>

                {/* ── Filter Bar ─────────────────────────────────── */}
                <Card className="border-2 border-slate-300">
                    <CardHeader><CardTitle className="text-slate-800">Select Year &amp; Date</CardTitle></CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                            <SelectField label="Year *" value={year} options={YEAR_OPTIONS} onValueChange={setYear} />
                            <div><DatePickerField date={date} onDateChange={setDate} label="Date *" /></div>
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
                                            Attendance — Year {year} — {date && format(date, 'PPP')}
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
                                                {['S.No', 'Roll No', 'Name', 'Year', 'P1', 'P2', 'P3', 'P4', 'P5', 'Remarks'].map(h => (
                                                    <th key={h} className="border border-slate-300 px-3 py-2 text-left text-slate-700 whitespace-nowrap">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filtered.length === 0 ? (
                                                <tr>
                                                    <td colSpan={10} className="text-center py-6 text-slate-400">No students match "{search}"</td>
                                                </tr>
                                            ) : filtered.map((s, i) => (
                                                <tr key={s.student_id} className="border border-slate-300 hover:bg-slate-50">
                                                    <td className="border border-slate-300 px-3 py-2 text-slate-700">{i + 1}</td>
                                                    <td className="border border-slate-300 px-3 py-2 font-medium text-slate-800">{s.roll_number}</td>
                                                    <td className="border border-slate-300 px-3 py-2 text-slate-700 whitespace-nowrap">{s.name}</td>
                                                    <td className="border border-slate-300 px-3 py-2 text-slate-600 text-center">{s.current_year}</td>

                                                    {/* ── Five Period Cells ──────── */}
                                                    {PERIOD_KEYS.map(period => {
                                                        const slot = s[period] as PeriodSlot;
                                                        return (
                                                            <td key={period} className="border border-slate-300 px-2 py-2 min-w-[70px]">
                                                                <Select
                                                                    value={slot.status}
                                                                    onValueChange={v => updatePeriodStatus(s.student_id, period, v)}
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
                                                    })}

                                                    {/* ── Remarks ───────────────── */}
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
