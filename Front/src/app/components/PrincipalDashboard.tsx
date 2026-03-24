import Layout from './Layout';
import { Users, TrendingUp, Calendar as CalendarIcon, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface PrincipalDashboardProps {
  user: { role: string; name: string };
  onLogout: () => void;
}

const attendanceData = [
  { year: '1st Year', attendance: 85, target: 75 },
  { year: '2nd Year', attendance: 88, target: 75 },
  { year: '3rd Year', attendance: 82, target: 75 },
  { year: '4th Year', attendance: 90, target: 75 },
];

const trendData = [
  { month: 'Sep', attendance: 78 },
  { month: 'Oct', attendance: 82 },
  { month: 'Nov', attendance: 85 },
  { month: 'Dec', attendance: 83 },
  { month: 'Jan', attendance: 87 },
  { month: 'Feb', attendance: 86 },
];

const batchData = [
  { batch: 'A', attendance: 87 },
  { batch: 'B', attendance: 85 },
  { batch: 'C', attendance: 89 },
  { batch: 'D', attendance: 84 },
];

const recentChanges = [
  { date: '2026-03-05', student: 'John Doe (2021001)', period: 'Period 3', change: 'Absent → Present' },
  { date: '2026-03-04', student: 'Jane Smith (2021002)', period: 'Period 2', change: 'Present → OD' },
  { date: '2026-03-04', student: 'Mike Johnson (2022015)', period: 'Period 1', change: 'Absent → Informed Leave' },
  { date: '2026-03-03', student: 'Sarah Williams (2021045)', period: 'Period 5', change: 'Absent → Present' },
  { date: '2026-03-03', student: 'Tom Brown (2023012)', period: 'Period 4', change: 'Present → Absent' },
];

export default function PrincipalDashboard({ user, onLogout }: PrincipalDashboardProps) {
  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="space-y-6">
        <h1 className="text-2xl text-slate-800">Principal Dashboard</h1>

        {/* Key Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-2 border-slate-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-600 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Total Students
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl text-slate-800">1,245</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-slate-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-600 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Overall Attendance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl text-slate-800">86.2%</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-slate-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-600 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                This Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl text-slate-800">86.0%</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-slate-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-600 flex items-center gap-2">
                <CalendarIcon className="w-4 h-4" />
                Working Days
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl text-slate-800">22/26</p>
            </CardContent>
          </Card>
        </div>

        {/* Attendance Graphs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-2 border-slate-300">
            <CardHeader>
              <CardTitle className="text-slate-800">Year-wise Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={attendanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
                  <XAxis dataKey="year" stroke="#475569" />
                  <YAxis stroke="#475569" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '2px solid #cbd5e1',
                      borderRadius: 0
                    }} 
                  />
                  <Legend />
                  <Bar dataKey="attendance" fill="#475569" name="Attendance %" />
                  <Bar dataKey="target" fill="#94a3b8" name="Target %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-2 border-slate-300">
            <CardHeader>
              <CardTitle className="text-slate-800">Attendance Trend (6 Months)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
                  <XAxis dataKey="month" stroke="#475569" />
                  <YAxis stroke="#475569" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '2px solid #cbd5e1',
                      borderRadius: 0
                    }} 
                  />
                  <Legend />
                  <Line type="monotone" dataKey="attendance" stroke="#475569" strokeWidth={2} name="Attendance %" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-2 border-slate-300">
            <CardHeader>
              <CardTitle className="text-slate-800">Batch-wise Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={batchData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
                  <XAxis dataKey="batch" stroke="#475569" />
                  <YAxis stroke="#475569" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '2px solid #cbd5e1',
                      borderRadius: 0
                    }} 
                  />
                  <Legend />
                  <Bar dataKey="attendance" fill="#475569" name="Attendance %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Recent Manual Changes */}
          <Card className="border-2 border-slate-300">
            <CardHeader>
              <CardTitle className="text-slate-800">Last 5 Manual Changes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentChanges.map((change, index) => (
                  <div key={index} className="border border-slate-300 p-3 bg-[#f7f3ea]">
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-sm text-slate-800">{change.student}</p>
                      <p className="text-xs text-slate-500">{change.date}</p>
                    </div>
                    <p className="text-xs text-slate-600">{change.period}</p>
                    <p className="text-xs text-slate-500 mt-1">{change.change}</p>
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
