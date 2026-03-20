import React, { useState } from 'react';
import Layout from '../../app/components/Layout';
import { Button } from '../../app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../app/components/ui/card';
import { format } from 'date-fns';
import { PageProps } from '../shared/types';
import { SelectField } from '../shared/SelectField';
import { DatePickerField } from '../shared/DatePickerField';
import { YEAR_OPTIONS } from '../shared/constants';
import { apiClient } from '../../api/apiClient';
import { Download } from 'lucide-react';
import { Subject, fetchSubjects } from '../../api/subject.api';
import { StudentDetailsDialog } from '../shared/StudentDetailsDialog';
import { SubjectDetailsDialog } from '../shared/SubjectDetailsDialog';

interface SubjectInfo {
    subject_id: number;
    subject_name: string;
    subject_code: string;
}

interface SubjectStats {
    total_hours: number;
    present_hours: number;
    percentage: number;
}

interface StudentRow {
    student_id: number;
    name: string;
    roll_number: string;
    current_year: number;
    subjects: Record<number, SubjectStats>;
}

interface SubjectWiseResponse {
    subjects: SubjectInfo[];
    students: StudentRow[];
}

export default function AttendanceView({ user, onLogout }: PageProps) {
    const [year, setYear] = useState('');
    const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
    const [dateTo, setDateTo] = useState<Date | undefined>(undefined);

    const [subjects, setSubjects] = useState<SubjectInfo[]>([]);
    const [students, setStudents] = useState<StudentRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fetched, setFetched] = useState(false);

    const [subjectId, setSubjectId] = useState('ALL');
    const [availableSubjects, setAvailableSubjects] = useState<Subject[]>([]);

    React.useEffect(() => {
        if (year) {
            fetchSubjects(year).then(setAvailableSubjects).catch(console.error);
            setSubjectId('ALL'); // reset subject when year changes
        } else {
            setAvailableSubjects([]);
            setSubjectId('ALL');
        }
    }, [year]);

    const handleFetch = async () => {
        if (!year) return;
        setLoading(true);
        setError(null);
        try {
            const params: Record<string, string> = { year };
            if (dateFrom) params.date_from = format(dateFrom, 'yyyy-MM-dd');
            if (dateTo) params.date_to = format(dateTo, 'yyyy-MM-dd');
            if (subjectId && subjectId !== 'ALL') params.subject_id = subjectId;

            const data = await apiClient.get<SubjectWiseResponse>('/reports/subject-wise', params);
            setSubjects(data.subjects);
            setStudents(data.students);
            setFetched(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    // ── CSV Export ─────────────────────────────────────────────
    const exportCSV = () => {
        const headers = [
            'S.No', 'Roll No', 'Name', 'Year',
            ...subjects.flatMap(s => [
                `${s.subject_name} (${s.subject_code}) - Total`,
                `${s.subject_name} (${s.subject_code}) - Present`,
                `${s.subject_name} (${s.subject_code}) - %`,
            ]),
        ];

        const rows = students.map((st, i) => [
            i + 1, st.roll_number, st.name, st.current_year,
            ...subjects.flatMap(sub => {
                const stats = st.subjects[sub.subject_id];
                return stats ? [stats.total_hours, stats.present_hours, stats.percentage + '%'] : [0, 0, '0%'];
            }),
        ]);

        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `attendance_year${year}_${dateFrom ? format(dateFrom, 'yyyy-MM-dd') : 'all'}_to_${dateTo ? format(dateTo, 'yyyy-MM-dd') : 'all'}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // ── Color helper for percentage ───────────────────────────
    const pctColor = (pct: number) => {
        if (pct >= 80) return 'text-green-600 bg-green-50/50';
        if (pct >= 60) return 'text-amber-600 bg-amber-50/50';
        return 'text-red-600 bg-red-50/50';
    };

    return (
        <Layout user={user} onLogout={onLogout}>
            <div className="space-y-8 max-w-full">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-bold text-foreground">Attendance Analytics</h1>
                    <p className="text-muted-foreground">Subject-wise performance tracking and reporting</p>
                </div>

                {/* ── Filters ───────────────────────────────────── */}
                <Card className="border-none shadow-sm shadow-black/5 bg-card">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-foreground text-sm font-bold uppercase tracking-wider opacity-60">
                            Report Configuration
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-6 items-end">
                            <div className="min-w-[150px]">
                                <SelectField label="Year *" value={year} options={YEAR_OPTIONS} onValueChange={setYear} />
                            </div>
                            <div className="min-w-[180px]">
                                <SelectField 
                                    label="Subject (Optional)" 
                                    value={subjectId} 
                                    options={[{ value: 'ALL', label: 'All Subjects (Year)' }, ...availableSubjects.map(s => ({ value: String(s.subject_id), label: `${s.subject_name}` }))]} 
                                    onValueChange={setSubjectId} 
                                />
                            </div>
                            <DatePickerField date={dateFrom} onDateChange={setDateFrom} label="Date From" maxDate={dateTo || new Date()} />
                            <DatePickerField date={dateTo} onDateChange={setDateTo} label="Date To" maxDate={new Date()} />
                            <Button 
                                onClick={handleFetch} 
                                disabled={loading || !year}
                                className="bg-primary hover:bg-primary/90 text-primary-foreground h-11 px-8 rounded-xl font-bold transition-all shadow-lg shadow-primary/20"
                            >
                                {loading ? 'Processing…' : 'Generate Report'}
                            </Button>
                        </div>
                        {error && <p className="text-destructive text-sm mt-4 p-3 bg-destructive/10 rounded-lg">{error}</p>}
                    </CardContent>
                </Card>

                {/* ── Results Table ──────────────────────────────── */}
                {fetched && (
                    <Card className="border-none shadow-xl shadow-black/5 bg-card overflow-hidden">
                        <CardHeader className="border-b border-border/50 bg-muted/20 pb-6">
                            <div className="flex items-center justify-between flex-wrap gap-4">
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <CardTitle className="text-foreground text-xl">
                                            Academic Report: Year {year}
                                        </CardTitle>
                                        <span className="px-2 py-0.5 bg-secondary/10 text-secondary text-[10px] font-bold rounded-full uppercase">
                                            {students.length} Students
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground font-medium">
                                        Period: {dateFrom ? format(dateFrom, 'MMM d, yyyy') : 'Inception'} 
                                        {' → '} 
                                        {dateTo ? format(dateTo, 'MMM d, yyyy') : 'Current'}
                                    </p>
                                </div>
                                {students.length > 0 && (
                                    <Button variant="outline" onClick={exportCSV} className="rounded-xl border-border text-foreground hover:bg-muted transition-all">
                                        <Download className="h-4 w-4 mr-2 text-primary" /> Export Data (.csv)
                                    </Button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {students.length === 0 ? (
                                <div className="text-center py-16 text-muted-foreground bg-muted/10">
                                    <p>No attendance data found for the selected criteria.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto rounded-lg border border-border bg-background">
                                    <table className="w-full text-sm">
                                        <thead>
                                            {/* ── Header Row 1: Fixed Columns + Subject Spans ── */}
                                            <tr className="bg-muted/30">
                                                <th rowSpan={2} className="border-b border-r border-border px-4 py-4 text-left text-muted-foreground font-bold uppercase text-[10px] tracking-wider sticky left-0 bg-[#f7f3ea] z-20">#</th>
                                                <th rowSpan={2} className="border-b border-r border-border px-4 py-4 text-left text-muted-foreground font-bold uppercase text-[10px] tracking-wider sticky left-[45px] bg-[#f7f3ea] z-20">Roll No</th>
                                                <th rowSpan={2} className="border-b border-r border-border px-4 py-4 text-left text-muted-foreground font-bold uppercase text-[10px] tracking-wider">Student Name</th>
                                                {subjects.map(s => (
                                                    <th key={s.subject_id} colSpan={3}
                                                        className="border-b border-r border-border px-4 py-3 text-center bg-primary/5">
                                                        <span className="block text-[11px] font-black text-secondary uppercase tracking-tight leading-tight">
                                                            <SubjectDetailsDialog subjectId={s.subject_id} subjectName={s.subject_name} />
                                                        </span>
                                                        <span className="block text-[9px] font-medium text-muted-foreground opacity-70">{s.subject_code}</span>
                                                    </th>
                                                ))}
                                            </tr>
                                            {/* ── Header Row 2: Sub-headers ── */}
                                            <tr className="bg-muted/10">
                                                {subjects.map(s => (
                                                    <React.Fragment key={`sub-h-${s.subject_id}`}>
                                                        <th className="border-b border-r border-border px-2 py-2 text-center text-[9px] font-black text-muted-foreground/80 uppercase">Tot</th>
                                                        <th className="border-b border-r border-border px-2 py-2 text-center text-[9px] font-black text-muted-foreground/80 uppercase">Pre</th>
                                                        <th className="border-b border-r border-border px-2 py-2 text-center text-[9px] font-black text-muted-foreground/80 uppercase">%</th>
                                                    </React.Fragment>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border/50">
                                            {students.map((st, i) => (
                                                <tr key={st.student_id} className="hover:bg-muted/30 transition-colors">
                                                    <td className="border-r border-border px-4 py-3 text-muted-foreground font-medium text-xs sticky left-0 bg-[#f7f3ea] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">{i + 1}</td>
                                                    <td className="border-r border-border px-4 py-3 font-mono text-xs font-bold text-foreground sticky left-[45px] bg-[#f7f3ea] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">{st.roll_number}</td>
                                                    <td className="border-r border-border px-4 py-3 text-foreground font-medium whitespace-nowrap">
                                                        <StudentDetailsDialog studentId={st.student_id} studentName={st.name} />
                                                    </td>
                                                    {subjects.map(sub => {
                                                        const stats = st.subjects[sub.subject_id];
                                                        return (
                                                            <React.Fragment key={`${st.student_id}-${sub.subject_id}`}>
                                                                <td className="border-r border-border px-2 py-3 text-center text-muted-foreground text-xs font-medium">
                                                                    {stats?.total_hours ?? 0}
                                                                </td>
                                                                <td className="border-r border-border px-2 py-3 text-center text-muted-foreground text-xs font-medium">
                                                                    {stats?.present_hours ?? 0}
                                                                </td>
                                                                <td className={`border-r border-border px-2 py-3 text-center text-xs font-black ${stats ? pctColor(stats.percentage) : 'text-muted-foreground/30'}`}>
                                                                    {stats?.percentage ?? 0}%
                                                                </td>
                                                            </React.Fragment>
                                                        );
                                                    })}
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
