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

    const handleFetch = async () => {
        if (!year) return;
        setLoading(true);
        setError(null);
        try {
            const params: Record<string, string> = { year };
            if (dateFrom) params.date_from = format(dateFrom, 'yyyy-MM-dd');
            if (dateTo) params.date_to = format(dateTo, 'yyyy-MM-dd');

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
        if (pct >= 80) return 'text-green-700 bg-green-50';
        if (pct >= 60) return 'text-amber-700 bg-amber-50';
        return 'text-red-700 bg-red-50';
    };

    return (
        <Layout user={user} onLogout={onLogout}>
            <div className="space-y-6">
                <h1 className="text-2xl text-slate-800">Subject-wise Attendance View</h1>

                {/* ── Filters ───────────────────────────────────── */}
                <Card className="border-2 border-slate-300">
                    <CardHeader><CardTitle className="text-slate-800">Filter</CardTitle></CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                            <SelectField label="Year *" value={year} options={YEAR_OPTIONS} onValueChange={setYear} />
                            <DatePickerField date={dateFrom} onDateChange={setDateFrom} label="Date From" maxDate={dateTo || new Date()} />
                            <DatePickerField date={dateTo} onDateChange={setDateTo} label="Date To" maxDate={new Date()} />
                            <Button onClick={handleFetch} disabled={loading || !year}
                                className="bg-slate-700 hover:bg-slate-800 text-white h-10">
                                {loading ? 'Loading…' : 'View Attendance'}
                            </Button>
                        </div>
                        {error && <p className="text-red-600 text-sm mt-3">{error}</p>}
                    </CardContent>
                </Card>

                {/* ── Results Table ──────────────────────────────── */}
                {fetched && (
                    <Card className="border-2 border-slate-300">
                        <CardHeader>
                            <div className="flex items-center justify-between flex-wrap gap-4">
                                <div>
                                    <CardTitle className="text-slate-800">
                                        Year {year} — {students.length} Students — {subjects.length} Subjects
                                    </CardTitle>
                                    <p className="text-sm text-slate-500 mt-1">
                                        {dateFrom ? format(dateFrom, 'PPP') : 'All dates'}
                                        {' → '}
                                        {dateTo ? format(dateTo, 'PPP') : 'Present'}
                                    </p>
                                </div>
                                {students.length > 0 && (
                                    <Button variant="outline" onClick={exportCSV} className="border-slate-300 text-slate-700">
                                        <Download className="h-4 w-4 mr-2" /> Export CSV
                                    </Button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            {students.length === 0 ? (
                                <p className="text-center py-8 text-slate-400">No attendance data found for this filter.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse text-sm">
                                        <thead>
                                            {/* ── Header Row 1: Subject Names (spans 3 cols each) ── */}
                                            <tr className="bg-slate-100 border-2 border-slate-300">
                                                <th rowSpan={2} className="border border-slate-300 px-3 py-2 text-left text-slate-700 sticky left-0 bg-slate-100 z-10">S.No</th>
                                                <th rowSpan={2} className="border border-slate-300 px-3 py-2 text-left text-slate-700 sticky left-12 bg-slate-100 z-10">Roll No</th>
                                                <th rowSpan={2} className="border border-slate-300 px-3 py-2 text-left text-slate-700">Name</th>
                                                <th rowSpan={2} className="border border-slate-300 px-3 py-2 text-center text-slate-700">Year</th>
                                                {subjects.map(s => (
                                                    <th key={s.subject_id} colSpan={3}
                                                        className="border border-slate-300 px-3 py-2 text-center text-slate-800 bg-slate-200 font-semibold">
                                                        {s.subject_name}
                                                        <br />
                                                        <span className="text-xs font-normal text-slate-500">({s.subject_code})</span>
                                                    </th>
                                                ))}
                                            </tr>
                                            {/* ── Header Row 2: Sub-headers ── */}
                                            <tr className="bg-slate-50 border border-slate-300">
                                                {subjects.map(s => (
                                                    <React.Fragment key={`sub-${s.subject_id}`}>
                                                        <th className="border border-slate-300 px-2 py-1 text-center text-xs text-slate-600">Total</th>
                                                        <th className="border border-slate-300 px-2 py-1 text-center text-xs text-slate-600">Present</th>
                                                        <th className="border border-slate-300 px-2 py-1 text-center text-xs text-slate-600">%</th>
                                                    </React.Fragment>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {students.map((st, i) => (
                                                <tr key={st.student_id} className="border border-slate-300 hover:bg-slate-50">
                                                    <td className="border border-slate-300 px-3 py-2 text-slate-700 sticky left-0 bg-white">{i + 1}</td>
                                                    <td className="border border-slate-300 px-3 py-2 text-slate-700 font-mono text-xs sticky left-12 bg-white">{st.roll_number}</td>
                                                    <td className="border border-slate-300 px-3 py-2 text-slate-700 whitespace-nowrap">{st.name}</td>
                                                    <td className="border border-slate-300 px-3 py-2 text-center text-slate-700">{st.current_year}</td>
                                                    {subjects.map(sub => {
                                                        const stats = st.subjects[sub.subject_id];
                                                        return (
                                                            <React.Fragment key={`${st.student_id}-${sub.subject_id}`}>
                                                                <td className="border border-slate-300 px-2 py-2 text-center text-slate-600 text-xs">
                                                                    {stats?.total_hours ?? 0}
                                                                </td>
                                                                <td className="border border-slate-300 px-2 py-2 text-center text-slate-600 text-xs">
                                                                    {stats?.present_hours ?? 0}
                                                                </td>
                                                                <td className={`border border-slate-300 px-2 py-2 text-center text-xs font-semibold ${stats ? pctColor(stats.percentage) : 'text-slate-400'}`}>
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
