import { useState } from 'react';
import { format } from 'date-fns';
import Layout from './Layout';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { DatePickerField } from './attendance/DatePickerField';
import { AttendanceTable } from './attendance/AttendanceTable';
import { mockStudents } from './attendance/attendanceView.types';

interface YCAttendanceViewProps {
  user: { role: string; name: string };
  onLogout: () => void;
}

export default function YCAttendanceView({ user, onLogout }: YCAttendanceViewProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="space-y-6">
        <h1 className="text-2xl text-slate-800">Attendance View</h1>

        {/* Date Picker Card */}
        <Card className="border-2 border-slate-300">
          <CardHeader>
            <CardTitle className="text-slate-800">Select Date</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <DatePickerField date={date} onDateChange={setDate} label="Date:" />
            </div>
          </CardContent>
        </Card>

        {/* Attendance Table Card */}
        <Card className="border-2 border-slate-300">
          <CardHeader>
            <CardTitle className="text-slate-800">
              Attendance — {date ? format(date, 'PPP') : 'Select a date'}
            </CardTitle>
            <p className="text-sm text-slate-600 mt-2">
              P = Present, A = Absent, OD = On Duty, IL = Informed Leave
            </p>
          </CardHeader>
          <CardContent>
            <AttendanceTable students={mockStudents} />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
