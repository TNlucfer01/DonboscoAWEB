// ─── Principal Dashboard ──────────────────────────────────────────────────────
// Real data from /api/reports; fallback to defaults if no attendance recorded yet.

import { useState, useEffect } from 'react';
import Layout from '../../app/components/Layout';
import { Users, TrendingUp, Calendar as CalendarIcon, Activity, AlertTriangle } from 'lucide-react';
import { StatCard } from '../shared/StatCard';
import { ChartCard, CHART_TOOLTIP_STYLE } from '../shared/ChartCard';
import { Card, CardContent, CardHeader, CardTitle } from '../../app/components/ui/card';
import { PageProps } from '../shared/types';
import { fetchDashboardStats } from '../../api/dashboard.api'; //these are the inputs that comes from the apis 
import { fetchAuditLogs } from '../../api/audit.api';
import { AuditLogEntry } from '../shared/attendance.types';
import {
	BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';

export default function PrincipalDashboard({ user, onLogout }: PageProps) {
	//initil value are 0 
	const [stats, setStats] = useState({
		totalStudents: 0,
		overallAttendance: '0%',
		belowThreshold: 0,
		//do we een need these things
		yearWise: [] as { year: string; attendance: number; target: number }[],
	});

	const [recentLogs, setRecentLogs] = useState<AuditLogEntry[]>([]);
	//for the ui 
	const [loading, setLoading] = useState(true);
	//for the reloadin
	useEffect(() => {
		const load = async () => {
			setLoading(true);
			try {
				//store
				const [dashData, logs] = await Promise.all([//fetching all the dashboard datas 
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

	const statCards = [
		{ icon: Users, label: 'Total Students', value: String(stats.totalStudents) },
		{ icon: Activity, label: 'Overall Attendance', value: stats.overallAttendance },
		{ icon: AlertTriangle, label: 'Below 80%', value: String(stats.belowThreshold) },
		{ icon: CalendarIcon, label: 'Academic Year', value: '2025-26' },
	];

	return (
		<Layout user={user} onLogout={onLogout}>
			<div className="space-y-6">
				<h1 className="text-2xl text-slate-800">Principal Dashboard</h1>

				{/* Stats */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
					{statCards.map((stat) => (
						<StatCard key={stat.label} icon={stat.icon} label={stat.label} value={loading ? '...' : stat.value} />
					))}
				</div>

				{/* Charts */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					<ChartCard title="Year-wise Attendance">
						<BarChart data={stats.yearWise}>
							<CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
							<XAxis dataKey="year" stroke="#475569" />
							<YAxis stroke="#475569" />
							<Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
							<Legend />
							<Bar dataKey="attendance" fill="#475569" name="Attendance %" />
							<Bar dataKey="target" fill="#94a3b8" name="Target %" />
						</BarChart>
					</ChartCard>

					{/* Recent Manual Changes (from Audit Log) */}
					<Card className="border-2 border-slate-300">
						<CardHeader>
							<CardTitle className="text-slate-800">Last 5 Manual Changes</CardTitle>
						</CardHeader>
						<CardContent>
							{recentLogs.length === 0 ? (
								<p className="text-sm text-slate-500">No corrections made yet.</p>
							) : (
								<div className="space-y-3">
									{recentLogs.map((c) => (
										<div key={c.id} className="border border-slate-300 p-3 bg-white">
											<div className="flex justify-between items-start mb-1">
												<p className="text-sm text-slate-800">{c.student} ({c.rollNo})</p>
												<p className="text-xs text-slate-500">{c.dateOfPeriod}</p>
											</div>
											<p className="text-xs text-slate-600">{c.period}</p>
											<p className="text-xs text-slate-500 mt-1">
												<span className="text-red-600">{c.oldStatus}</span> → <span className="text-green-600">{c.newStatus}</span>
											</p>
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
