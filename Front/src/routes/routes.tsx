// ─── App Routes ───────────────────────────────────────────────────────────────
// All route declarations in one place.
// ProtectedRoute enforces role-based access — redirect to "/" if wrong role.

import { ReactNode } from 'react';
import { Routes, Route, Navigate } from 'react-router';
import { User } from '../features/shared/types';

// Auth
import Login from '../features/auth/Login';
import LandingPage from '../features/auth/LandingPage';

// Principal
import PrincipalDashboard from '../features/principal/Dashboard';
import AddStaff from '../features/principal/AddStaff';
import AddSubject from '../features/principal/AddSubject';
import HolidayMarking from '../features/principal/HolidayMarking';
import AttendanceCorrection from '../features/principal/AttendanceCorrection';
import PrincipalAttendanceView from '../features/principal/AttendanceView';
import AuditLog from '../features/principal/AuditLog';

// YC
import YCDashboard from '../features/yc/Dashboard';
import AddStudent from '../features/yc/AddStudent';
import ODLeaveEntry from '../features/yc/ODLeaveEntry';
import YCAttendanceView from '../features/yc/AttendanceView';
import AttendanceDetailPage from '../features/shared/AttendanceDetailPage';
import Below80Page from '../features/shared/Below80Page';

// Staff
import StaffTakeAttendance from '../features/staff/TakeAttendance';
import StaffAttendanceCorrection from '../features/staff/AttendanceCorrection';
import StaffMonthlyRegister from '../features/staff/MonthlyRegister';

// ─── Helpers ─────────────────────────────────────────────────────────────────

interface ProtectedProps {
	user: User | null;
	requiredRole: string;
	children: ReactNode;
}

function Protected({ user, requiredRole, children }: ProtectedProps) {
	if (!user) return <Navigate to="/?login=true" replace />;
	if (user.role.toLowerCase() !== requiredRole.toLowerCase()) return <Navigate to="/?login=true" replace />;
	return <>{children}</>;
}

// ─── Route Definitions ───────────────────────────────────────────────────────

interface AppRoutesProps {
	user: User | null;
	onLogin: (role: string, username: string) => void;
	onLogout: () => void;
}

export default function AppRoutes({ user, onLogin, onLogout }: AppRoutesProps) {
	const pp = { user: user!, onLogout }; // page props shorthand (only passed to Protected routes)

	return (
		<Routes>
			{/* Root — show Landing (with Login transition) when not logged in */}
			<Route
				path="/"
				element={
					!user ? <LandingPage onLogin={onLogin} /> :
						user.role === 'principal' ? <Navigate to="/principal/dashboard" replace /> :
							user.role === 'year_coordinator' ? <Navigate to="/yc/dashboard" replace /> :
							<Navigate to="/staff/attendance" replace />}/>
			{/* Principal Routes */}
			<Route path="/principal/dashboard" element={<Protected user={user} requiredRole="principal"><PrincipalDashboard     {...pp} /></Protected>} />
			<Route path="/principal/add-staff" element={<Protected user={user} requiredRole="principal"><AddStaff               {...pp} /></Protected>} />
			<Route path="/principal/add-subject" element={<Protected user={user} requiredRole="principal"><AddSubject             {...pp} /></Protected>} />
			<Route path="/principal/holidays" element={<Protected user={user} requiredRole="principal"><HolidayMarking         {...pp} /></Protected>} />
			<Route path="/principal/attendance-correction" element={<Protected user={user} requiredRole="principal"><AttendanceCorrection {...pp} /></Protected>} />
			<Route path="/principal/attendance-view" element={<Protected user={user} requiredRole="principal"><PrincipalAttendanceView {...pp} /></Protected>} />
			<Route path="/principal/audit-log" element={<Protected user={user} requiredRole="principal"><AuditLog              {...pp} /></Protected>} />
			<Route path="/principal/attendance-day-detail" element={<Protected user={user} requiredRole="principal"><AttendanceDetailPage  {...pp} /></Protected>} />
			<Route path="/principal/below-threshold" element={<Protected user={user} requiredRole="principal"><Below80Page       {...pp} /></Protected>} />

			{/* YC Routes */}
			<Route path="/yc/dashboard" element={<Protected user={user} requiredRole="year_coordinator"><YCDashboard      {...pp} /></Protected>} />
			<Route path="/yc/add-student" element={<Protected user={user} requiredRole="year_coordinator"><AddStudent       {...pp} /></Protected>} />
			<Route path="/yc/od-leave" element={<Protected user={user} requiredRole="year_coordinator"><ODLeaveEntry     {...pp} /></Protected>} />
			<Route path="/yc/attendance-view" element={<Protected user={user} requiredRole="year_coordinator"><YCAttendanceView {...pp} /></Protected>} />
			<Route path="/yc/academic-report" element={<Protected user={user} requiredRole="year_coordinator"><PrincipalAttendanceView {...pp} /></Protected>} />
			<Route path="/yc/attendance-day-detail" element={<Protected user={user} requiredRole="year_coordinator"><AttendanceDetailPage {...pp} /></Protected>} />
			<Route path="/yc/below-threshold" element={<Protected user={user} requiredRole="year_coordinator"><Below80Page {...pp} /></Protected>} />
			
			{/* Staff Routes */}
			<Route path="/staff/attendance" element={<Protected user={user} requiredRole="subject_staff"><StaffTakeAttendance {...pp} /></Protected>} />
			<Route path="/staff/attendance-correction" element={<Protected user={user} requiredRole="subject_staff"><StaffAttendanceCorrection {...pp} /></Protected>} />
			<Route path="/staff/monthly-register" element={<Protected user={user} requiredRole="subject_staff"><StaffMonthlyRegister {...pp} /></Protected>} />

			{/* Catch-all redirect to index (which handles login state) */}
			<Route path="*" element={<Navigate to="/?login=true" replace />} />
		</Routes>
	);
}
