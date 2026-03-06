// ─── Principal Dashboard Data ──────────────────────────────────────────────────
// Mock chart data, extracted from Dashboard.tsx.
// Replace with API calls from a dashboard.api.ts when backend is ready.

export const yearAttendanceData = [
    { year: '1st Year', attendance: 85, target: 75 },
    { year: '2nd Year', attendance: 88, target: 75 },
    { year: '3rd Year', attendance: 82, target: 75 },
    { year: '4th Year', attendance: 90, target: 75 },
];

export const attendanceTrendData = [
    { month: 'Sep', attendance: 78 },
    { month: 'Oct', attendance: 82 },
    { month: 'Nov', attendance: 85 },
    { month: 'Dec', attendance: 83 },
    { month: 'Jan', attendance: 87 },
    { month: 'Feb', attendance: 86 },
];

export const batchAttendanceData = [
    { batch: 'A', attendance: 87 },
    { batch: 'B', attendance: 85 },
    { batch: 'C', attendance: 89 },
    { batch: 'D', attendance: 84 },
];

export const recentChanges = [
    { date: '2026-03-05', student: 'John Doe (2021001)', period: 'Period 3', change: 'Absent → Present' },
    { date: '2026-03-04', student: 'Jane Smith (2021002)', period: 'Period 2', change: 'Present → OD' },
    { date: '2026-03-04', student: 'Mike Johnson (2022015)', period: 'Period 1', change: 'Absent → Informed Leave' },
    { date: '2026-03-03', student: 'Sarah Williams (2021045)', period: 'Period 5', change: 'Absent → Present' },
    { date: '2026-03-03', student: 'Tom Brown (2023012)', period: 'Period 4', change: 'Present → Absent' },
];

export const dashboardStats = [
    { label: 'Total Students', value: '1,245' },
    { label: 'Overall Attendance', value: '86.2%' },
    { label: 'This Month', value: '86.0%' },
    { label: 'Working Days', value: '22/26' },
];
