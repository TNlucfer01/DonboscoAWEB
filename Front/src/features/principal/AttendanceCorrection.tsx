import { useState, useMemo } from 'react';
import Layout from '../../app/components/Layout';
import { Button } from '../../app/components/ui/button';
import { Input } from '../../app/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../app/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../app/components/ui/select';
import { PageProps } from '../shared/types';
import { SelectField } from '../shared/SelectField';
import { DatePickerField } from '../shared/DatePickerField';
import { YEAR_OPTIONS, PERIOD_OPTIONS } from '../shared/constants';
import { useAttendanceCorrection } from '../../hooks/useAttendanceCorrection';
import { format } from 'date-fns';
import { Loader2, Search, Download } from 'lucide-react';

const STATUS_OPTIONS = [
    { value: 'PRESENT', label: 'P' },
    { value: 'ABSENT', label: 'A' },
    { value: 'OD', label: 'OD' },
    { value: 'INFORMED_LEAVE', label: 'IL' },
];

export default function AttendanceCorrection({ user, onLogout }: PageProps) {
    const [year, setYear] = useState('');
    const [period, setPeriod] = useState('');
    const [date, setDate] = useState<Date | undefined>(undefined);
    const [search, setSearch] = useState('');
    const [fetched, setFetched] = useState(false);
    const { meta, students, loading, saving, error, fetch, updateStatus, updateODReason, updateIsLocked, updateRemarks, save } = useAttendanceCorrection();

    const handleFetch = async () => {
        if (!year || !date || !period) return;
        await fetch(year, date, period);
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

    const handleExportCSV = () => {
        if (!meta || students.length === 0) return;
        const headers = ['S.No', 'Roll No', 'Name', 'Status', 'OD Reason', 'Unlock', 'Remarks'];
        const csvRows = [headers.join(',')];

        filtered.forEach((s, i) => {
            const row = [
                i + 1,
                s.roll_number,
                `"${s.student_name}"`,
                s.status,
                `"${s.od_reason || ''}"`,
                s.is_locked ? 'Yes' : 'No',
                `"${s.remarks || ''}"`
            ];
            csvRows.push(row.join(','));
        });

        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Attendance_Year${year}_Period${period}_${format(date!, 'yyyy-MM-dd')}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <Layout user={user} onLogout={onLogout}>
            <div className="space-y-6">
                <h1 className="text-2xl text-slate-800">Attendance Correction</h1>

                {/* ── Filter Bar ─────────────────────────────────── */}
                <Card className="border-2 border-slate-300">
                    <CardHeader><CardTitle className="text-slate-800">Select Year, Date & Period</CardTitle></CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
                            <SelectField label="Year *" value={year} options={YEAR_OPTIONS} onValueChange={setYear} />
                            <div><DatePickerField date={date} onDateChange={setDate} label="Date *" /></div>
                            <SelectField label="Period *" value={period} options={PERIOD_OPTIONS} onValueChange={setPeriod} />
                            <Button
                                onClick={handleFetch}
                                disabled={loading || !year || !date || !period}
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
                            No records found for Year {year} Period {period} on {date && format(date, 'PP')}.
                        </p>
                    ) : (
                        <Card className="border-2 border-slate-300">
                            <CardHeader>
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div>
                                        <CardTitle className="text-slate-800">
                                            Attendance — Year {year} — Period {period} — {date && format(date, 'PPP')}
                                        </CardTitle>
                                        <p className="text-sm text-slate-600 mt-1">
                                            Manage attendance records. Check "Lock" to prevent further staff modifications.
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button onClick={handleExportCSV} variant="outline" className="border-slate-300 shrink-0">
                                            <Download className="mr-2 h-4 w-4" /> Export CSV
                                        </Button>
                                        <Button onClick={save} disabled={saving} className="bg-slate-700 hover:bg-slate-800 text-white shrink-0">
                                            {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving…</> : 'Save Changes'}
                                        </Button>
                                    </div>
                                </div>

                                {meta && (
                                    <div className="mt-4 bg-slate-50 p-4 rounded-md border border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                        <div><span className="text-slate-500">Subject Name:</span> <span className="font-semibold text-slate-800">{meta.subject_name}</span></div>
                                        <div><span className="text-slate-500">Subject Code:</span> <span className="font-semibold text-slate-800">{meta.subject_code}</span></div>
                                        <div><span className="text-slate-500">Submitter:</span> <span className="font-semibold text-slate-800">{meta.submitter_name}</span></div>
                                        <div><span className="text-slate-500">Year:</span> <span className="font-semibold text-slate-800">{meta.current_year}</span></div>
                                    </div>
                                )}

                                {/* ── Search ───────────────────── */}
                                <div className="relative mt-4 max-w-xs">
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
                                                {['S.No', 'Roll No', 'Name', 'Status', 'OD Reason', 'Lock', 'Remarks'].map(h => (
                                                    <th key={h} className="border border-slate-300 px-3 py-2 text-left text-slate-700 whitespace-nowrap">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filtered.length === 0 ? (
                                                <tr>
                                                    <td colSpan={7} className="text-center py-6 text-slate-400">No students match "{search}"</td>
                                                </tr>
                                            ) : filtered.map((s, i) => (
                                                <tr key={s.student_id} className="border border-slate-300 hover:bg-slate-50">
                                                    <td className="border border-slate-300 px-3 py-2 text-slate-700 w-12 text-center">{i + 1}</td>
                                                    <td className="border border-slate-300 px-3 py-2 font-medium text-slate-800">{s.roll_number}</td>
                                                    <td className="border border-slate-300 px-3 py-2 text-slate-700 whitespace-nowrap">{s.student_name}</td>

                                                    {/* ── Status ──────── */}
                                                    <td className="border border-slate-300 px-2 py-2 w-32">
                                                        <Select value={s.status} onValueChange={(v) => updateStatus(s.student_id, v)}>
                                                            <SelectTrigger className="h-8 border-slate-300 text-xs">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {STATUS_OPTIONS.map(opt => (
                                                                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </td>

                                                    {/* ── OD Reason ───────────────── */}
                                                    <td className="border border-slate-300 px-2 py-2 min-w-[120px]">
                                                        <Input
                                                            value={s.od_reason ?? ''}
                                                            onChange={e => updateODReason(s.student_id, e.target.value)}
                                                            placeholder="OD Reason..."
                                                            className="h-8 border-slate-300 text-xs"
                                                            disabled={s.status !== 'OD' && s.status !== 'INFORMED_LEAVE'}
                                                        />
                                                    </td>

                                                    {/* ── Unlock ───────────────── */}
                                                    <td className="border border-slate-300 px-2 py-2 text-center w-24">
                                                        <input
                                                            type="checkbox"
                                                            checked={s.is_locked === 1}
                                                            onChange={(e) => updateIsLocked(s.student_id, e.target.checked ? 1 : 0)}
                                                            className="w-4 h-4 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500 focus:ring-2"
                                                        />
                                                    </td>

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
