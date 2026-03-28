import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import Layout from '../../app/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../../app/components/ui/card';
import { Button } from '../../app/components/ui/button';
import { AlertTriangle, ArrowLeft, Loader2 } from 'lucide-react';
import { PageProps } from './types';
import { fetchBelowThreshold, AttendanceSummary } from '../../api/dashboard.api';

export default function Below80Page({ user, onLogout }: PageProps) {
    const navigate = useNavigate();
    const [students, setStudents] = useState<AttendanceSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const data = await fetchBelowThreshold();
                setStudents(data);
            } catch (err: any) {
                setError(err.message || 'Failed to fetch data');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const backPath = user?.role === 'principal' ? '/principal/dashboard' : '/yc/dashboard';

    return (
        <Layout user={user} onLogout={onLogout}>
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => navigate(backPath)} className="h-9 w-9 rounded-full border-border">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                            <span className="p-1.5 rounded-lg bg-red-100 text-red-600 inline-flex">
                                <AlertTriangle className="w-5 h-5" />
                            </span>
                            Students Below 80% Attendance
                        </h1>
                        <p className="text-muted-foreground font-medium text-sm mt-1">Detailed view of students running short on attendance hours</p>
                    </div>
                </div>

                <Card className="border-none shadow-sm shadow-black/5 bg-card overflow-hidden">
                    <CardHeader className="bg-muted/30 pb-4 border-b border-border">
                        <CardTitle className="text-foreground text-base font-bold">
                            Current Defaulters
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="flex items-center justify-center py-10 gap-2 text-muted-foreground">
                                <Loader2 className="animate-spin w-5 h-5" />
                                <span className="text-sm">Loading records...</span>
                            </div>
                        ) : error ? (
                            <div className="p-10 text-center text-red-500 font-medium">
                                {error}
                            </div>
                        ) : students.length === 0 ? (
                            <div className="p-10 text-center text-muted-foreground font-medium">
                                No students are currently below 80%.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted/20 border-b border-border">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-muted-foreground font-bold uppercase text-[11px] tracking-wider">Roll No.</th>
                                            <th className="px-6 py-4 text-left text-muted-foreground font-bold uppercase text-[11px] tracking-wider">Name</th>
                                            <th className="px-6 py-4 text-center text-muted-foreground font-bold uppercase text-[11px] tracking-wider">Year</th>
                                            <th className="px-4 py-4 text-center text-muted-foreground font-bold uppercase text-[11px] tracking-wider">Total Hours</th>
                                            <th className="px-4 py-4 text-center text-green-700 font-bold uppercase text-[11px] tracking-wider">Attended Hours</th>
                                            <th className="px-6 py-4 text-right text-red-600 font-bold uppercase text-[11px] tracking-wider">Attendance %</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/40">
                                        {students.map((s, index) => (
                                            <tr key={`${s.roll_number}-${index}`} className="hover:bg-muted/20 transition-colors group">
                                                <td className="px-6 py-4 font-mono font-bold text-foreground opacity-90">{s.roll_number}</td>
                                                <td className="px-6 py-4 text-foreground font-semibold whitespace-nowrap">{s.name}</td>
                                                <td className="px-6 py-4 text-center text-muted-foreground font-medium">Year {s.current_year}</td>
                                                <td className="px-4 py-4 text-center text-foreground font-medium">{s.total_periods || 0}</td>
                                                <td className="px-4 py-4 text-center text-green-700 font-bold bg-green-500/5">{s.attended || 0}</td>
                                                <td className="px-6 py-4 text-right text-red-600 font-black bg-red-500/5">{s.attendance_pct}%</td>
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
