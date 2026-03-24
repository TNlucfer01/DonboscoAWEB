import { useState } from 'react';
import Layout from './Layout';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';

interface AuditLogProps {
  user: { role: string; name: string };
  onLogout: () => void;
}

interface LogEntry {
  id: number;
  timestamp: string;
  student: string;
  rollNo: string;
  dateOfPeriod: string;
  period: string;
  oldStatus: string;
  newStatus: string;
  changedBy: string;
}

const mockLogs: LogEntry[] = [
  {
    id: 1,
    timestamp: '2026-03-05 10:30:15',
    student: 'John Doe',
    rollNo: '2021001',
    dateOfPeriod: '2026-03-04',
    period: 'Period 3',
    oldStatus: 'Absent',
    newStatus: 'Present',
    changedBy: 'Principal'
  },
  {
    id: 2,
    timestamp: '2026-03-04 14:20:45',
    student: 'Jane Smith',
    rollNo: '2021002',
    dateOfPeriod: '2026-03-04',
    period: 'Period 2',
    oldStatus: 'Present',
    newStatus: 'OD',
    changedBy: 'Principal'
  },
  {
    id: 3,
    timestamp: '2026-03-04 11:15:30',
    student: 'Mike Johnson',
    rollNo: '2022015',
    dateOfPeriod: '2026-03-03',
    period: 'Period 1',
    oldStatus: 'Absent',
    newStatus: 'Informed Leave',
    changedBy: 'Principal'
  },
  {
    id: 4,
    timestamp: '2026-03-03 16:45:20',
    student: 'Sarah Williams',
    rollNo: '2021045',
    dateOfPeriod: '2026-03-03',
    period: 'Period 5',
    oldStatus: 'Absent',
    newStatus: 'Present',
    changedBy: 'Principal'
  },
  {
    id: 5,
    timestamp: '2026-03-03 09:10:55',
    student: 'Tom Brown',
    rollNo: '2023012',
    dateOfPeriod: '2026-03-02',
    period: 'Period 4',
    oldStatus: 'Present',
    newStatus: 'Absent',
    changedBy: 'Principal'
  },
];

export default function AuditLog({ user, onLogout }: AuditLogProps) {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [logs, setLogs] = useState<LogEntry[]>(mockLogs);

  const handleFilter = () => {
    // In a real app, this would filter the logs based on the date range
    setLogs(mockLogs);
  };

  const handleClearFilter = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    setLogs(mockLogs);
  };

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="space-y-6">
        <h1 className="text-2xl text-slate-800">Audit Log</h1>

        <Card className="border-2 border-slate-300">
          <CardHeader>
            <CardTitle className="text-slate-800">Filter by Date Range</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1">
                <Label className="text-slate-700">Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full mt-1 justify-start text-left border-slate-300"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, 'PP') : <span>Pick start date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-[#f7f3ea] border-2 border-slate-300">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex-1">
                <Label className="text-slate-700">End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full mt-1 justify-start text-left border-slate-300"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, 'PP') : <span>Pick end date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-[#f7f3ea] border-2 border-slate-300">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <Button
                onClick={handleFilter}
                className="bg-slate-700 hover:bg-slate-800 text-white"
              >
                Apply Filter
              </Button>

              <Button
                onClick={handleClearFilter}
                variant="outline"
                className="border-slate-300 text-slate-700"
              >
                Clear Filter
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-slate-300">
          <CardHeader>
            <CardTitle className="text-slate-800">Attendance Changes Log</CardTitle>
            <p className="text-sm text-slate-600">All changes made by Principal - Read only, no undo</p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-2 border-slate-300">
                    <th className="border border-slate-300 px-4 py-3 text-left text-slate-700">Timestamp</th>
                    <th className="border border-slate-300 px-4 py-3 text-left text-slate-700">Student</th>
                    <th className="border border-slate-300 px-4 py-3 text-left text-slate-700">Roll No</th>
                    <th className="border border-slate-300 px-4 py-3 text-left text-slate-700">Date</th>
                    <th className="border border-slate-300 px-4 py-3 text-left text-slate-700">Period</th>
                    <th className="border border-slate-300 px-4 py-3 text-left text-slate-700">Old Status</th>
                    <th className="border border-slate-300 px-4 py-3 text-left text-slate-700">New Status</th>
                    <th className="border border-slate-300 px-4 py-3 text-left text-slate-700">Changed By</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border border-slate-300 hover:bg-slate-50">
                      <td className="border border-slate-300 px-4 py-3 text-slate-700">{log.timestamp}</td>
                      <td className="border border-slate-300 px-4 py-3 text-slate-700">{log.student}</td>
                      <td className="border border-slate-300 px-4 py-3 text-slate-700">{log.rollNo}</td>
                      <td className="border border-slate-300 px-4 py-3 text-slate-700">{log.dateOfPeriod}</td>
                      <td className="border border-slate-300 px-4 py-3 text-slate-700">{log.period}</td>
                      <td className="border border-slate-300 px-4 py-3">
                        <span className="inline-block px-2 py-1 bg-red-100 border border-red-300 text-red-800 text-sm">
                          {log.oldStatus}
                        </span>
                      </td>
                      <td className="border border-slate-300 px-4 py-3">
                        <span className="inline-block px-2 py-1 bg-green-100 border border-green-300 text-green-800 text-sm">
                          {log.newStatus}
                        </span>
                      </td>
                      <td className="border border-slate-300 px-4 py-3 text-slate-700">{log.changedBy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
