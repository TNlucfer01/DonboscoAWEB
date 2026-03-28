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
import { fetchOverallSummary, OverallSummary, fetchDailyReport, DailyReportResponse } from '../../api/dashboard.api';
import { StudentDetailsDialog } from '../shared/StudentDetailsDialog';
import { SubjectDetailsDialog } from '../shared/SubjectDetailsDialog';
import { SearchableSelect } from '../shared/SearchableSelect';

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

function StatusBadge({ status }: { status: string | undefined | null }) {
    if (!status) return <span className="text-muted-foreground/30 text-[10px]">—</span>;

    const map: Record<string, string> = {
        PRESENT: 'bg-green-100 text-green-700 font-bold',
        ABSENT: 'bg-red-100 text-red-700 font-bold',
        OD: 'bg-blue-100 text-blue-700 font-bold',
        INFORMED_LEAVE: 'bg-yellow-100 text-yellow-700 font-bold',
    };
    const label: Record<string, string> = {
        PRESENT: 'P',
        ABSENT: 'A',
        OD: 'OD',
        INFORMED_LEAVE: 'IL',
    };
    return (
        <span className={`inline-flex items-center justify-center min-w-[20px] h-[20px] rounded-[3px] text-[10px] ${map[status] || 'bg-muted text-muted-foreground px-1'}`}>
            {label[status] ?? status.charAt(0)}
        </span>
    );
}

export default function AttendanceView({ user, onLogout }: PageProps) {
    const managedYear = (user as any)?.managedYear as number | undefined;
    const [reportType, setReportType] = useState<string>('OVERALL');
    const [year, setYear] = useState(managedYear ? String(managedYear) : '');
    const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
    const [dateTo, setDateTo] = useState<Date | undefined>(undefined);

    const [overallData, setOverallData] = useState<OverallSummary[]>([]);
    const [dailyData, setDailyData] = useState<DailyReportResponse | null>(null);
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
            setSubjectId(''); // reset subject when year changes
        } else {
            setAvailableSubjects([]);
            setSubjectId('');
        }
    }, [year]);

    const handleFetch = async () => {
        setLoading(true);
        setError(null);
        try {
            if (reportType === 'OVERALL') {
                const data = await fetchOverallSummary(undefined, dateFrom ? format(dateFrom, 'yyyy-MM-dd') : undefined, dateTo ? format(dateTo, 'yyyy-MM-dd') : undefined);
                setOverallData(data);
                setFetched(true);
            } else if (reportType === 'DAILY') {
                if (!year) return;
                const data = await fetchDailyReport(year, dateFrom ? format(dateFrom, 'yyyy-MM-dd') : undefined, dateTo ? format(dateTo, 'yyyy-MM-dd') : undefined, subjectId || undefined);
                setDailyData(data);
                setFetched(true);
            } else {
                if (!year) return;
                const params: Record<string, string> = { year };
                if (dateFrom) params.date_from = format(dateFrom, 'yyyy-MM-dd');
                if (dateTo) params.date_to = format(dateTo, 'yyyy-MM-dd');
                if (reportType === 'SUBJECT' && subjectId) params.subject_id = subjectId;

                const data = await apiClient.get<SubjectWiseResponse>('/reports/subject-wise', params);
                setSubjects(data.subjects);
                setStudents(data.students);
                setFetched(true);
            }
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
                        <div className="flex flex-col gap-6">
                            <div className="flex flex-wrap gap-6 items-end">
                                <div className="min-w-[150px]">
                                    <SelectField label="Report Type" value={reportType} options={[
                                        { value: 'OVERALL', label: 'Overall' },
                                        { value: 'YEAR', label: 'Year' },
                                        { value: 'SUBJECT', label: 'Subject' },
                                        { value: 'DAILY', label: 'Daily (Register)' }
                                    ]} onValueChange={(val) => { setReportType(val); setFetched(false); }} />
                                </div>
                                
                                {reportType !== 'OVERALL' && (
                                    <div className="min-w-[150px]">
                                        <SelectField label="Year *" value={year} options={YEAR_OPTIONS} onValueChange={setYear} placeholder="Select Year" disabled={!!managedYear} />
                                    </div>
                                )}

                                {reportType === 'SUBJECT' && (
                                    <div className="min-w-[220px]">
                                        <SearchableSelect 
                                            label="Subject *" 
                                            value={subjectId} 
                                            options={availableSubjects.map(s => ({ value: String(s.subject_id), label: `${s.subject_name} (${s.subject_code})` }))} 
                                            onValueChange={setSubjectId} 
                                            placeholder="Search Subject..."
                                            disabled={!year}
                                        />
                                    </div>
                                )}

                                <DatePickerField date={dateFrom} onDateChange={setDateFrom} label="Date From" maxDate={dateTo || new Date()} />
                                <DatePickerField date={dateTo} onDateChange={setDateTo} label="Date To" maxDate={new Date()} />
                                <Button 
                                    onClick={handleFetch} 
                                    disabled={loading || (reportType !== 'OVERALL' && !year) || (reportType === 'SUBJECT' && !subjectId)}
                                    className="bg-primary hover:bg-primary/90 text-primary-foreground h-11 px-8 rounded-xl font-bold transition-all shadow-lg shadow-primary/20"
                                >
                                    {loading ? 'Processing…' : 'Generate Report'}
                                </Button>
                            </div>
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
                                            {reportType === 'OVERALL' ? 'Overall College Report' : `Academic Report: Year ${year}`}
                                        </CardTitle>
                                        {reportType !== 'OVERALL' && (
                                            <span className="px-2 py-0.5 bg-secondary/10 text-secondary text-[10px] font-bold rounded-full uppercase">
                                                {students.length} Students
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground font-medium">
                                        Period: {dateFrom ? format(dateFrom, 'MMM d, yyyy') : 'Inception'} 
                                        {' → '} 
                                        {dateTo ? format(dateTo, 'MMM d, yyyy') : 'Current'}
                                    </p>
                                </div>
                                {reportType !== 'OVERALL' && (students.length > 0 || (dailyData && dailyData.students.length > 0)) && (
                                    <Button variant="outline" onClick={exportCSV} className="rounded-xl border-border text-foreground hover:bg-muted transition-all" disabled={reportType === 'DAILY'}>
                                        <Download className="h-4 w-4 mr-2 text-primary" /> Export Data (.csv)
                                    </Button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {reportType === 'OVERALL' ? (
                                overallData.length === 0 ? (
                                    <div className="text-center py-16 text-muted-foreground bg-muted/10">
                                        <p>No attendance data found for the overall college.</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto bg-background p-6">
                                        <table className="w-full text-sm border-collapse rounded-lg overflow-hidden border border-border">
                                            <thead>
                                                <tr className="bg-muted/30">
                                                    <th className="border-b border-r border-border px-4 py-3 text-left font-bold text-muted-foreground uppercase text-xs">Year</th>
                                                    <th className="border-b border-r border-border px-4 py-3 text-center font-bold text-muted-foreground uppercase text-xs bg-green-500/5 text-green-700">Present Periods</th>
                                                    <th className="border-b border-r border-border px-4 py-3 text-center font-bold text-muted-foreground uppercase text-xs bg-red-500/5 text-red-700">Absent Periods</th>
                                                    <th className="border-b border-border px-4 py-3 text-center font-bold text-muted-foreground uppercase text-xs">Total Periods</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border/50">
                                                {overallData.map(row => (
                                                    <tr key={row.year} className="hover:bg-muted/10 transition-colors">
                                                        <td className="border-r border-border px-4 py-4 font-bold text-foreground">Year {row.year}</td>
                                                        <td className="border-r border-border px-4 py-4 text-center text-green-700 font-medium bg-green-500/5">{row.present_periods}</td>
                                                        <td className="border-r border-border px-4 py-4 text-center text-red-600 font-medium bg-red-500/5">{row.absent_periods}</td>
                                                        <td className="border-border px-4 py-4 text-center text-foreground font-bold">{row.total_periods}</td>
                                                    </tr>
                                                ))}
                                                <tr className="bg-primary/5 border-t-2 border-primary/20">
                                                    <td className="border-r border-primary/20 px-4 py-4 font-black uppercase text-primary">Grand Total</td>
                                                    <td className="border-r border-primary/20 px-4 py-4 text-center font-black text-green-700">
                                                        {overallData.reduce((sum, row) => sum + Number(row.present_periods), 0)}
                                                    </td>
                                                    <td className="border-r border-primary/20 px-4 py-4 text-center font-black text-red-600">
                                                        {overallData.reduce((sum, row) => sum + Number(row.absent_periods), 0)}
                                                    </td>
                                                    <td className="border-primary/20 px-4 py-4 text-center font-black text-foreground">
                                                        {overallData.reduce((sum, row) => sum + Number(row.total_periods), 0)}
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                )
                            ) : reportType === 'DAILY' ? (
                                !dailyData || dailyData.students.length === 0 ? (
                                    <div className="text-center py-16 text-muted-foreground bg-muted/10">
                                        <p>No daily attendance data found for the selected criteria.</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto border-t border-border bg-background">
                                        <table className="w-full text-sm border-collapse">
                                            <thead>
                                                <tr className="bg-muted/30">
                                                    <th rowSpan={2} className="border-b border-r border-border px-4 py-4 text-left text-muted-foreground font-bold uppercase text-[10px] tracking-wider sticky left-0 bg-[#f7f3ea] z-20">#</th>
                                                    <th rowSpan={2} className="border-b border-r border-border px-4 py-4 text-left text-muted-foreground font-bold uppercase text-[10px] tracking-wider sticky left-[45px] bg-[#f7f3ea] z-20">Roll No</th>
                                                    <th rowSpan={2} className="border-b border-r border-border px-4 py-4 text-left text-muted-foreground font-bold uppercase text-[10px] tracking-wider sticky left-[125px] bg-[#f7f3ea] z-20">Student Name</th>
                                                    {dailyData.days.map(d => (
                                                        <th key={d} colSpan={5} className="border-b border-r border-border px-1 py-3 text-center bg-primary/5">
                                                            <span className="block text-[11px] font-black text-secondary tracking-tight whitespace-nowrap">{format(new Date(d), 'MMM d, yy')}</span>
                                                        </th>
                                                    ))}
                                                </tr>
                                                <tr className="bg-muted/10">
                                                    {dailyData.days.map(d => (
                                                        <React.Fragment key={`sub-hd-${d}`}>
                                                            {[1, 2, 3, 4, 5].map(p => (
                                                                <th key={`${d}-${p}`} className="border-b border-r border-border px-1 py-1.5 text-center text-[9px] font-black text-muted-foreground/80 min-w-[28px]">{p}</th>
                                                            ))}
                                                        </React.Fragment>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border/50">
                                                {dailyData.students.map((st, i) => (
                                                    <tr key={st.student_id} className="hover:bg-muted/30 transition-colors">
                                                        <td className="border-r border-border px-4 py-2 text-muted-foreground font-medium text-xs sticky left-0 bg-[#f7f3ea] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] z-10">{i + 1}</td>
                                                        <td className="border-r border-border px-4 py-2 font-mono text-xs font-bold text-foreground sticky left-[45px] bg-[#f7f3ea] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] z-10">{st.roll_number}</td>
                                                        <td className="border-r border-border px-4 py-2 text-foreground font-medium whitespace-nowrap sticky left-[125px] bg-[#f7f3ea] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] z-10">
                                                            <StudentDetailsDialog studentId={st.student_id} studentName={st.name} />
                                                        </td>
                                                        {dailyData.days.map(d => (
                                                            <React.Fragment key={`${st.student_id}-${d}`}>
                                                                {[1, 2, 3, 4, 5].map(p => {
                                                                    const status = st.dates[d]?.[p];
                                                                    return (
                                                                        <td key={`${d}-${p}`} className="border-r border-border px-1 py-2 text-center">
                                                                            <StatusBadge status={status} />
                                                                        </td>
                                                                    )
                                                                })}
                                                            </React.Fragment>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )
                            ) : (
                                students.length === 0 ? (
                                    <div className="text-center py-16 text-muted-foreground bg-muted/10">
                                        <p>No attendance data found for the selected criteria.</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto border-t border-border bg-background">
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
                                )
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </Layout>
    );
}
