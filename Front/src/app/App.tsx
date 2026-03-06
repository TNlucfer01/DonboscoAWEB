import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { Toaster } from './components/ui/sonner';
import Login from './components/Login';
import PrincipalDashboard from './components/PrincipalDashboard';
import AddStaff from './components/AddStaff';
import AddSubject from './components/AddSubject';
import HolidayMarking from './components/HolidayMarking';
import AttendanceCorrection from './components/AttendanceCorrection';
import AuditLog from './components/AuditLog';
import YCDashboard from './components/YCDashboard';
import AddStudent from './components/AddStudent';
import ODLeaveEntry from './components/ODLeaveEntry';
import YCAttendanceView from './components/YCAttendanceView';
import StaffTakeAttendance from './components/StaffTakeAttendance';
import PrincipalAttendanceView from './components/PrincipalAttendanceView';

export default function App() {
  const [user, setUser] = useState<{ role: string; name: string } | null>(null);

  const handleLogin = (role: string, username: string) => {
    setUser({ role, name: username });
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <>
      <Toaster position="top-right" />
      <BrowserRouter>
        <Routes>
        <Route 
          path="/" 
          element={
            user ? (
              user.role === 'principal' ? (
                <Navigate to="/principal/dashboard" replace />
              ) : user.role === 'yc' ? (
                <Navigate to="/yc/dashboard" replace />
              ) : (
                <Navigate to="/staff/attendance" replace />
              )
            ) : (
              <Login onLogin={handleLogin} />
            )
          } 
        />
        
        {/* Principal Routes */}
        <Route path="/principal/dashboard" element={user?.role === 'principal' ? <PrincipalDashboard user={user} onLogout={handleLogout} /> : <Navigate to="/" />} />
        <Route path="/principal/add-staff" element={user?.role === 'principal' ? <AddStaff user={user} onLogout={handleLogout} /> : <Navigate to="/" />} />
        <Route path="/principal/add-subject" element={user?.role === 'principal' ? <AddSubject user={user} onLogout={handleLogout} /> : <Navigate to="/" />} />
        <Route path="/principal/holidays" element={user?.role === 'principal' ? <HolidayMarking user={user} onLogout={handleLogout} /> : <Navigate to="/" />} />
        <Route path="/principal/attendance-correction" element={user?.role === 'principal' ? <AttendanceCorrection user={user} onLogout={handleLogout} /> : <Navigate to="/" />} />
        <Route path="/principal/attendance-view" element={user?.role === 'principal' ? <PrincipalAttendanceView user={user} onLogout={handleLogout} /> : <Navigate to="/" />} />
        <Route path="/principal/audit-log" element={user?.role === 'principal' ? <AuditLog user={user} onLogout={handleLogout} /> : <Navigate to="/" />} />
        
        {/* YC Routes */}
        <Route path="/yc/dashboard" element={user?.role === 'yc' ? <YCDashboard user={user} onLogout={handleLogout} /> : <Navigate to="/" />} />
        <Route path="/yc/add-student" element={user?.role === 'yc' ? <AddStudent user={user} onLogout={handleLogout} /> : <Navigate to="/" />} />
        <Route path="/yc/od-leave" element={user?.role === 'yc' ? <ODLeaveEntry user={user} onLogout={handleLogout} /> : <Navigate to="/" />} />
        <Route path="/yc/attendance-view" element={user?.role === 'yc' ? <YCAttendanceView user={user} onLogout={handleLogout} /> : <Navigate to="/" />} />
        
        {/* Staff Routes */}
        <Route path="/staff/attendance" element={user?.role === 'staff' ? <StaffTakeAttendance user={user} onLogout={handleLogout} /> : <Navigate to="/" />} />
      </Routes>
      </BrowserRouter>
    </>
  );
}
