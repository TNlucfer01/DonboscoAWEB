import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router';
import {
	LayoutDashboard,
	UserPlus,
	BookPlus,
	Calendar,
	ClipboardEdit,
	ClipboardList,
	Eye,
	FileText,
	LogOut,
	Menu,
	X,
	GraduationCap
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from './ui/button';

interface LayoutProps {
	children: ReactNode;
	user: { role: string; name: string };
	onLogout: () => void;
}

export default function Layout({ children, user, onLogout }: LayoutProps) {
	const location = useLocation();
	const [sidebarOpen, setSidebarOpen] = useState(false);

	// BUG-020: Lock body scroll when mobile sidebar is open
	useEffect(() => {
		if (sidebarOpen) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = '';
		}
		return () => { document.body.style.overflow = ''; };
	}, [sidebarOpen]);

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
		{ to: '/staff/attendance', icon: ClipboardList, label: 'Take Attendance' },
		{ to: '/staff/attendance-correction', icon: ClipboardEdit, label: 'Attendance Correction' }
	];

	const links = user.role === 'principal' ? principalLinks : user.role === 'year_coordinator' ? ycLinks : staffLinks;

	return (
		<div className="min-h-screen bg-background">
			{/* Header */}
			<header className="bg-card border-b border-border sticky top-0 z-[60] backdrop-blur-md bg-opacity-80">
				<div className="px-6 py-4 flex items-center justify-between mx-auto">
					<div className="flex items-center gap-4">
						<button
							onClick={() => setSidebarOpen(!sidebarOpen)}
							aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
							className="lg:hidden p-2 hover:bg-muted rounded-lg transition-colors"
						>
							{sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
						</button>
						<div className="p-2 bg-primary/10 rounded-xl">
							<GraduationCap className="w-6 h-6 text-primary" />
						</div>
						<div>
							<h1 className="text-xl font-bold text-foreground leading-tight">Don Bosco</h1>
							<p className="text-[10px] uppercase tracking-widest text-[#8B5E3C] font-semibold">Agricultural Institute</p>
						</div>
					</div>
					
					<div className="flex items-center gap-6">
						<div className="hidden sm:block text-right">
							<p className="text-sm font-bold text-foreground">{user.name}</p>
							<p className="text-[10px] text-muted-foreground uppercase font-medium">{user.role.replace('_', ' ')}</p>
						</div>
						<Button
							onClick={onLogout}
							variant="ghost"
							className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all rounded-xl"
						>
							<LogOut className="w-4 h-4 mr-2" />
							<span className="hidden sm:inline">Logout</span>
						</Button>
					</div>
				</div>
			</header>

			<div className="flex">
				{/* Sidebar */}
				<aside
					className={`
            fixed lg:sticky top-[73px] left-0 h-[calc(100vh-73px)] bg-card border-r border-border w-64 z-50
            transition-transform duration-300 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
				>
					<nav className="p-4 space-y-2">
						{links.map((link) => {
							const Icon = link.icon;
							const isActive = location.pathname === link.to;
							return (
								<Link
									key={link.to}
									to={link.to}
									onClick={() => setSidebarOpen(false)}
									className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium
                    ${isActive
											? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
											: 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
										}
                  `}
								>
									<Icon className={`w-5 h-5 ${isActive ? 'text-primary-foreground' : 'text-primary'}`} />
									<span className="text-sm">{link.label}</span>
								</Link>
							);
						})}
					</nav>
				</aside>

				{/* Overlay for mobile */}
				{sidebarOpen && (
					<div
						className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
						onClick={() => setSidebarOpen(false)}
					/>
				)}

				{/* Main Content */}
				<main className="flex-1 p-6 lg:p-10 max-w-[1600px] mx-auto w-full">
					{children}
				</main>
			</div>
		</div>
	);
}
