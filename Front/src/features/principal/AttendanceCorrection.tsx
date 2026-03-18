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
import { useAttendanceCorrection } from './hooks/useAttendanceCorrection';
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
    //when i select the date and the period it should send wheter that particular hour's batches like if that hour is theory it should send the theory batch 
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
            <div className="space-y-8">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-bold text-foreground">Attendance Rectification</h1>
                    <p className="text-muted-foreground">Modify and lock attendance records for administrative accuracy</p>
                </div>

                {/* ── Filter Bar ─────────────────────────────────── */}
                <Card className="border-none shadow-sm shadow-black/5 bg-card">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-foreground text-sm font-bold uppercase tracking-wider opacity-60">
                            Search Parameters
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-6 items-end">
                            <div className="min-w-[140px]">
                                <SelectField label="Year *" value={year} options={YEAR_OPTIONS} onValueChange={setYear} />
                            </div>
                            <DatePickerField date={date} onDateChange={setDate} label="Date *" />
                            <div className="min-w-[140px]">
                                <SelectField label="Period *" value={period} options={PERIOD_OPTIONS} onValueChange={setPeriod} />
                            </div>
                            <Button
                                onClick={handleFetch}
                                disabled={loading || !year || !date || !period}
                                className="bg-primary hover:bg-primary/90 text-primary-foreground h-11 px-8 rounded-xl font-bold shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
                            >
                                {loading
                                    ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Retrieving…</>
                                    : 'Fetch Records'}
                            </Button>
                        </div>
                        {error && <p className="text-destructive text-sm mt-4 p-3 bg-destructive/10 rounded-lg">{error}</p>}
                    </CardContent>
                </Card>

                {/* ── Results ─────────────────────────────────────── */}
                {fetched && !loading && (
                    students.length === 0 ? (
                        <div className="text-center py-20 bg-muted/5 rounded-3xl border border-dashed border-border/50">
                            <p className="text-muted-foreground font-medium">
                                No records found for <span className="text-foreground font-bold">Year {year}</span>, <span className="text-foreground font-bold">Period {period}</span> on <span className="text-foreground font-bold">{date && format(date, 'PP')}</span>.
                            </p>
                        </div>
                    ) : (
                        <Card className="border-none shadow-xl shadow-black/5 bg-card overflow-hidden">
                            <CardHeader className="border-b border-border/10 bg-muted/20 pb-8">
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                    <div className="space-y-1">
                                        <CardTitle className="text-foreground text-2xl">
                                            Year {year} • Period {period}
                                        </CardTitle>
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <span className="text-sm font-medium">{date && format(date, 'EEEE, MMMM do, yyyy')}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-3">
                                        <Button onClick={handleExportCSV} variant="outline" className="h-11 rounded-xl border-border text-foreground hover:bg-muted transition-all">
                                            <Download className="mr-2 h-4 w-4 text-primary" /> Export Data
                                        </Button>
                                        <Button onClick={save} disabled={saving} className="h-11 px-8 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold rounded-xl shadow-lg shadow-secondary/20 transition-all active:scale-[0.98]">
                                            {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Syncing…</> : 'Persist Changes'}
                                        </Button>
                                    </div>
                                </div>

                                {meta && (
                                    <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
                                        {[
                                            { label: 'Subject', value: meta.subject_name },
                                            { label: 'Code', value: meta.subject_code },
                                            { label: 'Submitted By', value: meta.submitter_name },
                                            { label: 'Academic Year', value: `Year ${meta.current_year}` }
                                        ].map((item, idx) => (
                                            <div key={idx} className="bg-[#f7f3ea]/50 border border-border/50 p-4 rounded-2xl">
                                                <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">{item.label}</div>
                                                <div className="text-sm font-bold text-foreground">{item.value}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* ── Search ───────────────────── */}
                                <div className="relative mt-8 max-w-sm group">
                                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <Input
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                        placeholder="Quick filter by Roll Number..."
                                        className="h-11 pl-10 rounded-xl border-border bg-background focus:ring-2 focus:ring-primary/20 transition-all"
                                    />
                                </div>
                            </CardHeader>

                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse text-sm">
                                        <thead>
                                            <tr className="bg-muted/10">
                                                {['#', 'Roll No', 'Student Name', 'Attendance Status', 'OD / IL Justification', 'Lock', 'Admin Remarks'].map(h => (
                                                    <th key={h} className="px-6 py-4 text-left text-muted-foreground font-bold uppercase text-[10px] tracking-wider border-b border-border/50">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border/30">
                                            {filtered.length === 0 ? (
                                                <tr>
                                                    <td colSpan={7} className="text-center py-12 text-muted-foreground font-medium italic bg-muted/5 font-medium">No students match the criteria "{search}"</td>
                                                </tr>
                                            ) : filtered.map((s, i) => (
                                                <tr key={s.student_id} className="hover:bg-muted/30 transition-colors group">
                                                    <td className="px-6 py-4 text-muted-foreground font-medium text-xs w-12 text-center">{i + 1}</td>
                                                    <td className="px-6 py-4 font-mono font-bold text-foreground opacity-90">{s.roll_number}</td>
                                                    <td className="px-6 py-4 text-foreground font-semibold whitespace-nowrap">{s.student_name}</td>

                                                    {/* ── Status ──────── */}
                                                    <td className="px-6 py-4 w-40">
                                                        <Select value={s.status} onValueChange={(v) => updateStatus(s.student_id, v)}>
                                                            <SelectTrigger className={`h-9 rounded-lg border-border text-xs font-bold ${
                                                                s.status === 'PRESENT' ? 'bg-green-50 text-green-700 border-green-200' : 
                                                                s.status === 'ABSENT' ? 'bg-red-50 text-red-700 border-red-200' :
                                                                'bg-amber-50 text-amber-700 border-amber-200'
                                                            }`}>
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent className="rounded-xl border-border shadow-2xl">
                                                                {STATUS_OPTIONS.map(opt => (
                                                                    <SelectItem key={opt.value} value={opt.value} className="text-xs font-medium">{opt.label}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </td>

                                                    {/* ── OD Reason ───────────────── */}
                                                    <td className="px-6 py-4 min-w-[200px]">
                                                        <Input
                                                            value={s.od_reason ?? ''}
                                                            onChange={e => updateODReason(s.student_id, e.target.value)}
                                                            placeholder="Specify reason..."
                                                            className="h-9 rounded-lg border-border text-xs bg-background/50 focus:bg-background transition-colors"
                                                            disabled={s.status !== 'OD' && s.status !== 'INFORMED_LEAVE'}
                                                        />
                                                    </td>

                                                    {/* ── Unlock ───────────────── */}
                                                    <td className="px-6 py-4 text-center w-24">
                                                        <div className="flex justify-center">
                                                            <input
                                                                type="checkbox"
                                                                id={`lock-${s.student_id}`}
                                                                checked={s.is_locked === 1}
                                                                onChange={(e) => updateIsLocked(s.student_id, e.target.checked ? 1 : 0)}
                                                                className="w-5 h-5 cursor-pointer accent-secondary border-border rounded-md transition-all scale-110"
                                                            />
                                                        </div>
                                                    </td>

                                                    {/* ── Remarks ───────────────── */}
                                                    <td className="px-6 py-4 min-w-[220px]">
                                                        <Input
                                                            value={s.remarks ?? ''}
                                                            onChange={e => updateRemarks(s.student_id, e.target.value)}
                                                            placeholder="Add internal notes"
                                                            className="h-9 rounded-lg border-border text-xs bg-background/50 focus:bg-background transition-colors"
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
