// features/staff/MonthlyRegister.tsx
// Monthly Attendance Register for Staff.
// - Defaults to current month
// - Shows only subjects the logged-in staff has submitted attendance for
// - Table: students as rows, each day they've taken class as columns
// - Columns: S.No | Roll No | Name | Day1 | Day2 | ... | P | A | Total | %

import { useState, useEffect } from 'react';
import Layout from '../../app/components/Layout';
import { Button } from '../../app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../app/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../app/components/ui/select';
import { Loader2, BookOpen } from 'lucide-react';
import { PageProps } from '../shared/types';
import {
    fetchStaffOwnSubjects,
    fetchMonthlyRegister,
    StaffSubject,
    MonthlyRegisterData,
} from '../../api/monthlyRegister.api';

// ── Helpers ───────────────────────────────────────────────────────────────────

function todayYYYYMM() {
    const n = new Date();
    return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}`;
}

function monthLabel(yyyyMm: string) {
    const [y, m] = yyyyMm.split('-');
    return new Date(Number(y), Number(m) - 1, 1).toLocaleString('en-IN', { month: 'long', year: 'numeric' });
}

// Generate last 6 months options for the picker
function monthOptions() {
    const opts: { value: string; label: string }[] = [];
    const now = new Date();
    for (let i = 0; i < 6; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        opts.push({ value: val, label: monthLabel(val) });
    }
    return opts;
}

// Badge for a day's status
function StatusBadge({ status }: { status: string | null }) {
    if (!status) return <span className="text-muted-foreground/30 text-xs">—</span>;

    const map: Record<string, string> = {
        PRESENT: 'bg-green-100 text-green-700 font-black',
        ABSENT: 'bg-red-100 text-red-700 font-black',
        OD: 'bg-blue-100 text-blue-700 font-black',
        INFORMED_LEAVE: 'bg-yellow-100 text-yellow-700 font-black',
    };
    const label: Record<string, string> = {
        PRESENT: 'P',
        ABSENT: 'A',
        OD: 'OD',
        INFORMED_LEAVE: 'IL',
    };

    return (
        <span className={`inline-flex items-center justify-center w-7 h-6 rounded text-[10px] ${map[status] || 'bg-muted text-muted-foreground'}`}>
            {label[status] ?? status[0]}
        </span>
    );
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function MonthlyRegister({ user, onLogout }: PageProps) {
    const [month, setMonth] = useState(todayYYYYMM());
    const [subjects, setSubjects] = useState<StaffSubject[]>([]);
    const [subjectId, setSubjectId] = useState('');
    const [data, setData] = useState<MonthlyRegisterData | null>(null);
    const [loadingSubjects, setLoadingSubjects] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fetched, setFetched] = useState(false);

    // Load the subjects the staff has submitted for (once on mount)
    useEffect(() => {
        fetchStaffOwnSubjects()
            .then(setSubjects)
            .catch(() => setSubjects([]))
            .finally(() => setLoadingSubjects(false));
    }, []);

    // Reset fetched state when filters change
    useEffect(() => {
        setFetched(false);
        setData(null);
    }, [month, subjectId]);

    const handleFetch = async () => {
        if (!subjectId) return;
        setLoading(true);
        setError(null);
        try {
            const result = await fetchMonthlyRegister(Number(subjectId), month);
            setData(result);
            setFetched(true);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to load register');
        } finally {
            setLoading(false);
        }
    };

    const pctColor = (pct: number) => {
        if (pct >= 80) return 'text-green-700 font-black';
        if (pct >= 60) return 'text-amber-600 font-black';
        return 'text-red-600 font-black';
    };

    const MONTHS = monthOptions();
    const selectedSubject = subjects.find(s => String(s.subject_id) === subjectId);

    return (
        <Layout user={user} onLogout={onLogout}>
            <div className="space-y-8 max-w-full">

                {/* ── Page Header ──────────────────────────────────────── */}
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-bold text-foreground">Monthly Register</h1>
                    <p className="text-muted-foreground">Subject-wise student attendance for a calendar month</p>
                </div>

                {/* ── Filters Card ─────────────────────────────────────── */}
                <Card className="border-none shadow-sm shadow-black/5 bg-card">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-foreground text-sm font-bold uppercase tracking-wider opacity-60">
                            Select Month &amp; Subject
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-6 items-end">

                            {/* Month picker */}
                            <div className="flex flex-col gap-1.5 min-w-[180px]">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Month</label>
                                <Select value={month} onValueChange={setMonth}>
                                    <SelectTrigger className="h-11 rounded-xl border-border bg-background">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-popover border border-border">
                                        {MONTHS.map(m => (
                                            <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Subject picker */}
                            <div className="flex flex-col gap-1.5 min-w-[260px]">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Subject</label>
                                {loadingSubjects ? (
                                    <div className="flex items-center gap-2 text-muted-foreground text-sm h-11">
                                        <Loader2 className="w-4 h-4 animate-spin" /> Loading subjects…
                                    </div>
                                ) : subjects.length === 0 ? (
                                    <p className="text-sm text-muted-foreground h-11 flex items-center">
                                        No subjects found. Submit attendance first.
                                    </p>
                                ) : (
                                    <Select value={subjectId} onValueChange={setSubjectId}>
                                        <SelectTrigger className="h-11 rounded-xl border-border bg-background">
                                            <SelectValue placeholder="Select a subject…" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-popover border border-border">
                                            {subjects.map(s => (
                                                <SelectItem key={s.subject_id} value={String(s.subject_id)}>
                                                    {s.subject_name} ({s.subject_code}) — Yr {s.subject_year}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            </div>

                            <Button
                                onClick={handleFetch}
                                disabled={loading || !subjectId}
                                className="bg-primary hover:bg-primary/90 text-primary-foreground h-11 px-8 rounded-xl font-bold transition-all shadow-lg shadow-primary/20"
                            >
                                {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Loading…</> : 'View Register'}
                            </Button>
                        </div>
                        {error && (
                            <p className="text-destructive text-sm mt-4 p-3 bg-destructive/10 rounded-lg">{error}</p>
                        )}
                    </CardContent>
                </Card>

                {/* ── Register Table ───────────────────────────────────── */}
                {fetched && data && (
                    <Card className="border-none shadow-xl shadow-black/5 bg-card overflow-hidden">
                        <CardHeader className="border-b border-border/50 bg-muted/20 pb-5">
                            <div className="flex items-start gap-6">
                                <div className="p-2 bg-primary/10 rounded-xl mt-0.5">
                                    <BookOpen className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <CardTitle className="text-foreground text-xl">
                                        {data.subject.subject_name}
                                        <span className="ml-2 text-sm font-normal text-muted-foreground">
                                            ({data.subject.subject_code})
                                        </span>
                                    </CardTitle>
                                    <p className="text-xs text-muted-foreground mt-1 font-medium">
                                        {monthLabel(data.month)} &nbsp;·&nbsp; Year {data.subject.subject_year} &nbsp;·&nbsp; {data.students.length} Students
                                    </p>
                                    <div className="flex items-center gap-4 mt-2">
                                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                            <span className="w-5 h-4 rounded bg-green-100 text-green-700 text-[9px] font-black flex items-center justify-center">P</span> Present
                                        </span>
                                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                            <span className="w-5 h-4 rounded bg-red-100 text-red-700 text-[9px] font-black flex items-center justify-center">A</span> Absent
                                        </span>
                                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                            <span className="w-7 h-4 rounded bg-blue-100 text-blue-700 text-[9px] font-black flex items-center justify-center">OD</span> On Duty
                                        </span>
                                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                            <span className="w-5 h-4 rounded bg-yellow-100 text-yellow-700 text-[9px] font-black flex items-center justify-center">IL</span> Informed Leave
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="p-0">
                            {data.students.length === 0 ? (
                                <div className="text-center py-16 text-muted-foreground">
                                    <p>No attendance data for {monthLabel(data.month)}.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm border-collapse">
                                        <thead>
                                            <tr className="bg-muted/30 border-b border-border">
                                                {/* Fixed columns */}
                                                <th className="sticky left-0 z-20 bg-[#f7f3ea] border-r border-border px-3 py-4 text-left text-muted-foreground font-bold uppercase text-[10px] tracking-wider w-10">#</th>
                                                <th className="sticky left-[44px] z-20 bg-[#f7f3ea] border-r border-border px-3 py-4 text-left text-muted-foreground font-bold uppercase text-[10px] tracking-wider whitespace-nowrap">Roll No</th>
                                                <th className="border-r border-border px-3 py-4 text-left text-muted-foreground font-bold uppercase text-[10px] tracking-wider whitespace-nowrap min-w-[140px]">Name</th>
                                                {/* Day columns */}
                                                {data.days.map(d => (
                                                    <th key={d} className="border-r border-border px-2 py-4 text-center text-muted-foreground font-bold text-[10px] w-10">
                                                        {d}
                                                    </th>
                                                ))}
                                                {/* Summary columns */}
                                                <th className="border-r border-border px-3 py-4 text-center text-green-700 font-bold text-[10px] uppercase tracking-wider whitespace-nowrap">P</th>
                                                <th className="border-r border-border px-3 py-4 text-center text-red-600 font-bold text-[10px] uppercase tracking-wider whitespace-nowrap">A</th>
                                                <th className="border-r border-border px-3 py-4 text-center text-muted-foreground font-bold text-[10px] uppercase tracking-wider">Total</th>
                                                <th className="px-3 py-4 text-center text-muted-foreground font-bold text-[10px] uppercase tracking-wider">%</th>
                                            </tr>
                                        </thead>

                                        <tbody className="divide-y divide-border/40">
                                            {data.students.map((st, i) => (
                                                <tr key={st.student_id} className="hover:bg-muted/20 transition-colors">
                                                    <td className="sticky left-0 z-10 bg-[#f7f3ea] border-r border-border px-3 py-3 text-muted-foreground text-xs font-medium shadow-[2px_0_4px_-2px_rgba(0,0,0,0.06)]">
                                                        {i + 1}
                                                    </td>
                                                    <td className="sticky left-[44px] z-10 bg-[#f7f3ea] border-r border-border px-3 py-3 font-mono text-xs font-bold text-foreground shadow-[2px_0_4px_-2px_rgba(0,0,0,0.06)] whitespace-nowrap">
                                                        {st.roll_number}
                                                    </td>
                                                    <td className="border-r border-border px-3 py-3 text-foreground font-medium whitespace-nowrap">
                                                        {st.name}
                                                    </td>
                                                    {data.days.map(d => (
                                                        <td key={d} className="border-r border-border px-1 py-3 text-center">
                                                            <StatusBadge status={st.days[d] ?? null} />
                                                        </td>
                                                    ))}
                                                    <td className="border-r border-border px-3 py-3 text-center text-green-700 font-bold text-sm">{st.present}</td>
                                                    <td className="border-r border-border px-3 py-3 text-center text-red-600 font-bold text-sm">{st.absent}</td>
                                                    <td className="border-r border-border px-3 py-3 text-center text-muted-foreground font-medium text-sm">{st.total}</td>
                                                    <td className={`px-3 py-3 text-center text-sm ${pctColor(st.percentage)}`}>
                                                        {st.percentage}%
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </Layout>
    );
}
