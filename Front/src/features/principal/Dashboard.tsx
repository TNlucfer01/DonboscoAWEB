import Layout from '../../app/components/Layout';
import { Users, TrendingUp, Calendar as CalendarIcon, Activity } from 'lucide-react';
import { StatCard } from '../shared/StatCard';
import { ChartCard, CHART_TOOLTIP_STYLE } from '../shared/ChartCard';
import { Card, CardContent, CardHeader, CardTitle } from '../../app/components/ui/card';
import { PageProps } from '../shared/types';
import {
    yearAttendanceData, attendanceTrendData, batchAttendanceData,
    recentChanges, dashboardStats,
} from './data/dashboard.data';
import {
    BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';

const STAT_ICONS = [Users, Activity, TrendingUp, CalendarIcon];

export default function PrincipalDashboard({ user, onLogout }: PageProps) {
    return (
        <Layout user={user} onLogout={onLogout}>
            <div className="space-y-6">
                <h1 className="text-2xl text-slate-800">Principal Dashboard</h1>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {dashboardStats.map((stat, i) => (
                        <StatCard key={stat.label} icon={STAT_ICONS[i]} label={stat.label} value={stat.value} />
                    ))}
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ChartCard title="Year-wise Attendance">
                        <BarChart data={yearAttendanceData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
                            <XAxis dataKey="year" stroke="#475569" />
                            <YAxis stroke="#475569" />
                            <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                            <Legend />
                            <Bar dataKey="attendance" fill="#475569" name="Attendance %" />
                            <Bar dataKey="target" fill="#94a3b8" name="Target %" />
                        </BarChart>
                    </ChartCard>

                    <ChartCard title="Attendance Trend (6 Months)">
                        <LineChart data={attendanceTrendData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
                            <XAxis dataKey="month" stroke="#475569" />
                            <YAxis stroke="#475569" />
                            <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                            <Legend />
                            <Line type="monotone" dataKey="attendance" stroke="#475569" strokeWidth={2} name="Attendance %" />
                        </LineChart>
                    </ChartCard>

                    <ChartCard title="Batch-wise Attendance">
                        <BarChart data={batchAttendanceData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
                            <XAxis dataKey="batch" stroke="#475569" />
                            <YAxis stroke="#475569" />
                            <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                            <Legend />
                            <Bar dataKey="attendance" fill="#475569" name="Attendance %" />
                        </BarChart>
                    </ChartCard>

                    {/* Recent Manual Changes */}
                    <Card className="border-2 border-slate-300">
                        <CardHeader>
                            <CardTitle className="text-slate-800">Last 5 Manual Changes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {recentChanges.map((c, i) => (
                                    <div key={i} className="border border-slate-300 p-3 bg-white">
                                        <div className="flex justify-between items-start mb-1">
                                            <p className="text-sm text-slate-800">{c.student}</p>
                                            <p className="text-xs text-slate-500">{c.date}</p>
                                        </div>
                                        <p className="text-xs text-slate-600">{c.period}</p>
                                        <p className="text-xs text-slate-500 mt-1">{c.change}</p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </Layout>
    );
}
