// ─── App Routes ───────────────────────────────────────────────────────────────
// All route declarations in one place.
// ProtectedRoute enforces role-based access — redirect to "/" if wrong role.

import { ReactNode } from 'react';
import { Routes, Route, Navigate } from 'react-router';
import { User } from '../features/shared/types';

// Auth
import Login from '../features/auth/Login';

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

// Staff
import StaffTakeAttendance from '../features/staff/TakeAttendance';

// ─── Helpers ─────────────────────────────────────────────────────────────────

interface ProtectedProps {
    user: User | null;
    requiredRole: string;
    children: ReactNode;
}

function Protected({ user, requiredRole, children }: ProtectedProps) {
    if (!user || user.role !== requiredRole) return <Navigate to="/" replace />;
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
            {/* Root — redirect by role or show login */}
            <Route
                path="/"
                element={
                    !user ? <Login onLogin={onLogin} /> :
                        user.role === 'principal' ? <Navigate to="/principal/dashboard" replace /> :
                            user.role === 'yc' ? <Navigate to="/yc/dashboard" replace /> :
                                <Navigate to="/staff/attendance" replace />
                }
            />

            {/* Principal Routes */}
            <Route path="/principal/dashboard" element={<Protected user={user} requiredRole="principal"><PrincipalDashboard     {...pp} /></Protected>} />
            <Route path="/principal/add-staff" element={<Protected user={user} requiredRole="principal"><AddStaff               {...pp} /></Protected>} />
            <Route path="/principal/add-subject" element={<Protected user={user} requiredRole="principal"><AddSubject             {...pp} /></Protected>} />
            <Route path="/principal/holidays" element={<Protected user={user} requiredRole="principal"><HolidayMarking         {...pp} /></Protected>} />
            <Route path="/principal/attendance-correction" element={<Protected user={user} requiredRole="principal"><AttendanceCorrection {...pp} /></Protected>} />
            <Route path="/principal/attendance-view" element={<Protected user={user} requiredRole="principal"><PrincipalAttendanceView {...pp} /></Protected>} />
            <Route path="/principal/audit-log" element={<Protected user={user} requiredRole="principal"><AuditLog              {...pp} /></Protected>} />

            {/* YC Routes */}
            <Route path="/yc/dashboard" element={<Protected user={user} requiredRole="yc"><YCDashboard      {...pp} /></Protected>} />
            <Route path="/yc/add-student" element={<Protected user={user} requiredRole="yc"><AddStudent       {...pp} /></Protected>} />
            <Route path="/yc/od-leave" element={<Protected user={user} requiredRole="yc"><ODLeaveEntry     {...pp} /></Protected>} />
            <Route path="/yc/attendance-view" element={<Protected user={user} requiredRole="yc"><YCAttendanceView {...pp} /></Protected>} />

            {/* Staff Routes */}
            <Route path="/staff/attendance" element={<Protected user={user} requiredRole="staff"><StaffTakeAttendance {...pp} /></Protected>} />
        </Routes>
    );
}
