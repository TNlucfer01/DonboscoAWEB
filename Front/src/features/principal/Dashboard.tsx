// ─── Principal Dashboard ──────────────────────────────────────────────────────
// Real data from /api/reports; fallback to defaults if no attendance recorded yet.

import { useState, useEffect } from 'react';
import Layout from '../../app/components/Layout';
import { Users, TrendingUp, Calendar as CalendarIcon, Activity, AlertTriangle } from 'lucide-react';
import { StatCard } from '../shared/StatCard';
import { ChartCard, CHART_TOOLTIP_STYLE } from '../shared/ChartCard';
import { Card, CardContent, CardHeader, CardTitle } from '../../app/components/ui/card';
import { PageProps } from '../shared/types';
import { fetchDashboardStats } from '../../api/dashboard.api';
import { fetchAuditLogs } from '../../api/audit.api';
import { AuditLogEntry } from '../shared/attendance.types';
import {
	BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

export default function PrincipalDashboard({ user, onLogout }: PageProps) {
	const [stats, setStats] = useState({
		totalStudents: 0,
		overallAttendance: '0%',
		belowThreshold: 0,
		yearWise: [] as { year: string; attendance: number; target: number }[],
	});

	const [recentLogs, setRecentLogs] = useState<AuditLogEntry[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const load = async () => {
			setLoading(true);
			try {
				const [dashData, logs] = await Promise.all([
					fetchDashboardStats(),
					fetchAuditLogs().then(l => l.slice(0, 5)).catch(() => []),
				]);

				setStats(dashData);
				setRecentLogs(logs);
			} catch { /* fallback to zeros */ }
			finally { setLoading(false); }
		};
		load();
	}, []);

	const now = new Date();
	const acadStartYear = now.getMonth() >= 5 ? now.getFullYear() : now.getFullYear() - 1; 
	const academicYear = `${acadStartYear}-${String(acadStartYear + 1).slice(-2)}`;

	const statCards = [
		{ icon: Users, label: 'Total Students', value: String(stats.totalStudents) },
		{ icon: Activity, label: 'Overall Attendance', value: stats.overallAttendance },
		{ icon: AlertTriangle, label: 'Below 80%', value: String(stats.belowThreshold) },
		{ icon: CalendarIcon, label: 'Academic Year', value: academicYear },
	];

	return (
		<Layout user={user} onLogout={onLogout}>
			<div className="space-y-8">
				<div className="flex flex-col gap-1">
					<h1 className="text-3xl font-bold text-foreground">Principal Dashboard</h1>
					<p className="text-muted-foreground">Overview of institutional attendance performance</p>
				</div>

				{/* Stats */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
					{statCards.map((stat) => (
						<StatCard key={stat.label} icon={stat.icon} label={stat.label} value={loading ? '...' : stat.value} />
					))}
				</div>

				{/* Charts */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
					<ChartCard title="Year-wise Attendance">
						<ResponsiveContainer width="100%" height={300}>
						<BarChart data={stats.yearWise}>
							<CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
							<XAxis dataKey="year" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
							<YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}%`} />
							<Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
							<Legend verticalAlign="top" align="right" height={36} />
							<Bar dataKey="attendance" fill="#9caf88" name="Attendance %" radius={[4, 4, 0, 0]} />
							<Bar dataKey="target" fill="#d6a75e" opacity={0.3} name="Target %" radius={[4, 4, 0, 0]} />
						</BarChart>
						</ResponsiveContainer>
					</ChartCard>

					{/* Recent Manual Changes (from Audit Log) */}
					<Card className="border-none shadow-sm shadow-black/5 bg-card overflow-hidden">
						<CardHeader className="bg-muted/30 pb-4">
							<CardTitle className="text-foreground text-lg flex items-center gap-2">
								<Activity className="w-5 h-5 text-secondary" />
								Last 5 Manual Changes
							</CardTitle>
						</CardHeader>
						<CardContent className="pt-6">
							{recentLogs.length === 0 ? (
								<div className="flex flex-col items-center justify-center py-8 text-center">
									<p className="text-sm text-muted-foreground">No corrections made yet.</p>
								</div>
							) : (
								<div className="space-y-4">
									{recentLogs.map((c) => (
										<div key={c.id} className="p-4 rounded-xl bg-background border border-border/50 transition-all hover:border-primary/30">
											<div className="flex justify-between items-start mb-2">
												<p className="text-sm font-semibold text-foreground">{c.student}</p>
												<p className="text-[10px] font-medium text-muted-foreground uppercase">{c.dateOfPeriod}</p>
											</div>
											<div className="flex items-center justify-between">
												<p className="text-xs text-secondary font-medium">{c.period}</p>
												<div className="flex items-center gap-2">
													<span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-bold">{c.oldStatus}</span>
													<TrendingUp className="w-3 h-3 text-muted-foreground" />
													<span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-bold">{c.newStatus}</span>
												</div>
											</div>
										</div>
									))}
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			</div>
		</Layout>
	);
}
