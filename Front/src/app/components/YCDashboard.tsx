import Layout from './Layout';
import { Users, Activity, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface YCDashboardProps {
  user: { role: string; name: string };
  onLogout: () => void;
}

const batchData = [
  { batch: 'Batch A', attendance: 87 },
  { batch: 'Batch B', attendance: 85 },
  { batch: 'Batch C', attendance: 89 },
  { batch: 'Batch D', attendance: 84 },
];

const trendData = [
  { month: 'Sep', attendance: 80 },
  { month: 'Oct', attendance: 84 },
  { month: 'Nov', attendance: 86 },
  { month: 'Dec', attendance: 85 },
  { month: 'Jan', attendance: 88 },
  { month: 'Feb', attendance: 87 },
];

export default function YCDashboard({ user, onLogout }: YCDashboardProps) {
  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="space-y-6">
        <h1 className="text-2xl text-slate-800">Year Coordinator Dashboard</h1>
        <p className="text-slate-600">Managing 2nd Year Students</p>

        {/* Key Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="border-2 border-slate-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-600 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Total Students
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl text-slate-800">320</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-slate-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-600 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Year Attendance
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
              <p className="text-3xl text-slate-800">87.0%</p>
            </CardContent>
          </Card>
        </div>

        {/* Attendance Graphs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
        </div>
      </div>
    </Layout>
  );
}
