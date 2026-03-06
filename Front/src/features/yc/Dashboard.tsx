import Layout from '../../app/components/Layout';
import { Users, Activity, TrendingUp } from 'lucide-react';
import { StatCard } from '../shared/StatCard';
import { ChartCard, CHART_TOOLTIP_STYLE } from '../shared/ChartCard';
import { PageProps } from '../shared/types';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const batchData = [{ batch: 'Batch A', attendance: 87 }, { batch: 'Batch B', attendance: 85 }, { batch: 'Batch C', attendance: 89 }, { batch: 'Batch D', attendance: 84 }];
const trendData = [{ month: 'Sep', attendance: 80 }, { month: 'Oct', attendance: 84 }, { month: 'Nov', attendance: 86 }, { month: 'Dec', attendance: 85 }, { month: 'Jan', attendance: 88 }, { month: 'Feb', attendance: 87 }];

const stats = [
    { icon: Users, label: 'Total Students', value: '320' },
    { icon: Activity, label: 'Year Attendance', value: '86.2%' },
    { icon: TrendingUp, label: 'This Month', value: '87.0%' },
];

export default function YCDashboard({ user, onLogout }: PageProps) {
    return (
        <Layout user={user} onLogout={onLogout}>
            <div className="space-y-6">
                <h1 className="text-2xl text-slate-800">Year Coordinator Dashboard</h1>
                <p className="text-slate-600">Managing 2nd Year Students</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {stats.map((s) => <StatCard key={s.label} icon={s.icon} label={s.label} value={s.value} />)}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ChartCard title="Batch-wise Attendance">
                        <BarChart data={batchData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
                            <XAxis dataKey="batch" stroke="#475569" />
                            <YAxis stroke="#475569" />
                            <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                            <Legend />
                            <Bar dataKey="attendance" fill="#475569" name="Attendance %" />
                        </BarChart>
                    </ChartCard>
                    <ChartCard title="Attendance Trend (6 Months)">
                        <LineChart data={trendData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
                            <XAxis dataKey="month" stroke="#475569" />
                            <YAxis stroke="#475569" />
                            <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                            <Legend />
                            <Line type="monotone" dataKey="attendance" stroke="#475569" strokeWidth={2} name="Attendance %" />
                        </LineChart>
                    </ChartCard>
                </div>
            </div>
        </Layout>
    );
}
