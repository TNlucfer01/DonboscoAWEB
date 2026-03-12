import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router';
import {
	LayoutDashboard,
	UserPlus,
	BookPlus,
	Calendar,
	ClipboardEdit,
	Eye,
	FileText,
	LogOut,
	Menu,
	X,
	GraduationCap
} from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';

interface LayoutProps {
	children: ReactNode;
	user: { role: string; name: string };
	onLogout: () => void;
}

export default function Layout({ children, user, onLogout }: LayoutProps) {
	const location = useLocation();
	const [sidebarOpen, setSidebarOpen] = useState(false);

	const principalLinks = [
		{ to: '/principal/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
		{ to: '/principal/add-staff', icon: UserPlus, label: 'Add Staff' },
		{ to: '/principal/add-subject', icon: BookPlus, label: 'Add Subject' },
		{ to: '/principal/holidays', icon: Calendar, label: 'Holiday Marking' },
		{ to: '/principal/attendance-correction', icon: ClipboardEdit, label: 'Attendance Correction' },
		{ to: '/principal/attendance-view', icon: Eye, label: 'Attendance View' },
		{ to: '/principal/audit-log', icon: FileText, label: 'Audit Log' },
	];

	const ycLinks = [
		{ to: '/yc/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
		{ to: '/yc/add-student', icon: UserPlus, label: 'Add Student' },
		{ to: '/yc/od-leave', icon: ClipboardEdit, label: 'OD / Leave Entry' },
		{ to: '/yc/attendance-view', icon: Eye, label: 'Attendance View' },
	];

	const staffLinks = [
		{
			to: '/staff/attendance', icon: ClipboardEdit, label: 'Take Attendance',
		},
		{
			to: '/staff/attendance-correction', icon: ClipboardEdit, label: 'AttendanceCorrection '
		}
	];

	const links = user.role === 'principal' ? principalLinks : user.role === 'year_coordinator' ? ycLinks : staffLinks;

	return (
		<div className="min-h-screen bg-slate-50">
			{/* Header */}
			<header className="bg-white border-b-2 border-slate-300">
				<div className="px-4 py-3 flex items-center justify-between">
					<div className="flex items-center gap-3">
						<button
							onClick={() => setSidebarOpen(!sidebarOpen)}
							className="lg:hidden p-2 hover:bg-slate-100 border border-slate-300"
						>
							{sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
						</button>
						<GraduationCap className="w-8 h-8 text-slate-700" />
						<div>
							<h1 className="text-lg text-slate-800">College Attendance System</h1>
							<p className="text-sm text-slate-600">{user.name} ({user.role.toUpperCase()})</p>
						</div>
					</div>
					<Button
						onClick={onLogout}
						variant="outline"
						className="border-slate-300 text-slate-700 hover:bg-slate-100"
					>
						<LogOut className="w-4 h-4 mr-2" />
						Logout
					</Button>
				</div>
			</header>

			<div className="flex">
				{/* Sidebar */}
				<aside
					className={`
            fixed lg:sticky top-0 left-0 h-screen bg-white border-r-2 border-slate-300 w-64 z-50
            transition-transform duration-300 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
				>
					<nav className="p-4 space-y-1 mt-16 lg:mt-0">
						{links.map((link) => {
							const Icon = link.icon;
							const isActive = location.pathname === link.to;
							return (
								<Link
									key={link.to}
									to={link.to}
									onClick={() => setSidebarOpen(false)}
									className={`
                    flex items-center gap-3 px-4 py-3 border-2 transition-colors
                    ${isActive
											? 'bg-slate-700 text-white border-slate-700'
											: 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
										}
                  `}
								>
									<Icon className="w-5 h-5" />
									<span>{link.label}</span>
								</Link>
							);
						})}
					</nav>
				</aside>

				{/* Overlay for mobile */}
				{sidebarOpen && (
					<div
						className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
						onClick={() => setSidebarOpen(false)}
					/>
				)}

				{/* Main Content */}
				<main className="flex-1 p-4 lg:p-6">
					{children}
				</main>
			</div>
		</div>
	);
}
