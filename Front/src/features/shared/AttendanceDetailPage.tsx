// features/shared/AttendanceDetailPage.tsx
// Drilldown page — shows individual student rows for a given day/year/status.
// Navigated to when clicking a Present or Absent cell in AttendanceSummaryTable.
//
// URL: /principal/attendance-day-detail?date=YYYY-MM-DD&year=1&status=ABSENT
//      /yc/attendance-day-detail?date=YYYY-MM-DD&year=1&status=ABSENT

import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import Layout from '../../app/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../../app/components/ui/card';
import { Button } from '../../app/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { PageProps } from './types';
import { fetchStudentDetail, StudentDetailRow } from '../../api/attendanceSummary.api';

const STATUS_LABEL: Record<string, string> = {
    PRESENT: 'Present',
    ABSENT: 'Absent',
    OD: 'OD',
    INFORMED_LEAVE: 'Informed Leave',
};

const STATUS_COLORS: Record<string, string> = {
    PRESENT: 'bg-green-100 text-green-700',
    ABSENT: 'bg-red-100 text-red-700',
    OD: 'bg-blue-100 text-blue-700',
    INFORMED_LEAVE: 'bg-yellow-100 text-yellow-700',
};

export default function AttendanceDetailPage({ user, onLogout }: PageProps) {
    const [params] = useSearchParams();
    const navigate = useNavigate();

    const date = params.get('date') || '';
    const year = Number(params.get('year') || 0);
    const status = (params.get('status') || 'ABSENT') as 'PRESENT' | 'ABSENT';

    const [rows, setRows] = useState<StudentDetailRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!date || !year || !status) return;
        const run = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await fetchStudentDetail(date, year, status);
                setRows(data);
            } catch (e) {
                setError(e instanceof Error ? e.message : 'Failed to load');
            } finally {
                setLoading(false);
            }
        };
        run();
    }, [date, year, status]);

    const periods = ['period1', 'period2', 'period3', 'period4', 'period5'] as const;

    return (
        <Layout user={user} onLogout={onLogout}>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(-1)}
                        className="gap-2 text-muted-foreground hover:text-foreground"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">
                            {status === 'ABSENT' ? '🔴' : '🟢'} {STATUS_LABEL[status]} Students
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            Year {year} &nbsp;·&nbsp; {date}
                        </p>
                    </div>
                </div>

                <Card className="border-none shadow-sm shadow-black/5 bg-card overflow-hidden">
                    <CardHeader className="bg-muted/30 pb-4">
                        <CardTitle className="text-foreground text-base font-bold flex items-center gap-2">
                            Student-wise Period Detail
                            {!loading && (
                                <span className="text-xs font-normal text-muted-foreground">
                                    ({rows.length} students)
                                </span>
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
                                <Loader2 className="animate-spin w-5 h-5" />
                                <span className="text-sm">Loading…</span>
                            </div>
                        ) : error ? (
                            <p className="text-destructive text-sm p-4">{error}</p>
                        ) : rows.length === 0 ? (
                            <p className="text-center py-10 text-muted-foreground text-sm">
                                No students found.
                            </p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-muted/20 border-b border-border">
                                            <th className="px-4 py-3 text-left text-muted-foreground font-bold uppercase text-[10px] tracking-wider">#</th>
                                            <th className="px-4 py-3 text-left text-muted-foreground font-bold uppercase text-[10px] tracking-wider">Name</th>
                                            <th className="px-4 py-3 text-left text-muted-foreground font-bold uppercase text-[10px] tracking-wider">Roll No</th>
                                            <th className="px-4 py-3 text-center text-muted-foreground font-bold uppercase text-[10px] tracking-wider">Periods&nbsp;Now</th>
                                            <th className="px-4 py-3 text-center text-muted-foreground font-bold uppercase text-[10px] tracking-wider">Period 1</th>
                                            <th className="px-4 py-3 text-center text-muted-foreground font-bold uppercase text-[10px] tracking-wider">Period 2</th>
                                            <th className="px-4 py-3 text-center text-muted-foreground font-bold uppercase text-[10px] tracking-wider">Period 3</th>
                                            <th className="px-4 py-3 text-center text-muted-foreground font-bold uppercase text-[10px] tracking-wider">Period 4</th>
                                            <th className="px-4 py-3 text-center text-muted-foreground font-bold uppercase text-[10px] tracking-wider">Period 5</th>
                                            <th className="px-4 py-3 text-left text-muted-foreground font-bold uppercase text-[10px] tracking-wider">Reason</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/40">
                                        {rows.map((r, i) => (
                                            <tr key={r.student_id} className="hover:bg-muted/20 transition-colors">
                                                <td className="px-4 py-3 text-muted-foreground text-xs">{i + 1}</td>
                                                <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">{r.name}</td>
                                                <td className="px-4 py-3 font-mono text-xs text-foreground">{r.roll_number}</td>
                                                <td className="px-4 py-3 text-center text-muted-foreground font-medium">{r.period_now}</td>
                                                {periods.map((p) => (
                                                    <td key={p} className="px-4 py-3 text-center">
                                                        {r[p] ? (
                                                            <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${STATUS_COLORS[r[p]!] || ''}`}>
                                                                {STATUS_LABEL[r[p]!] || r[p]}
                                                            </span>
                                                        ) : (
                                                            <span className="text-muted-foreground/30 text-xs">—</span>
                                                        )}
                                                    </td>
                                                ))}
                                                <td className="px-4 py-3 text-xs text-muted-foreground max-w-[180px] truncate">
                                                    {r.od_reason || (
                                                        <span className="text-muted-foreground/30">—</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
}
