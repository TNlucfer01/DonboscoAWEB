import { useState } from 'react';
import Layout from './Layout';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { toast } from 'sonner';

interface ODLeaveEntryProps {
  user: { role: string; name: string };
  onLogout: () => void;
}

interface Student {
  id: number;
  sno: number;
  rollNo: string;
  name: string;
  batch: string;
  period1: string;
  period2: string;
  period3: string;
  period4: string;
  period5: string;
  remarks: string;
  attendancePercentage: number;
}

const mockStudents: Student[] = [
  { 
    id: 1, sno: 1, rollNo: '2021001', name: 'John Doe', batch: 'A',
    period1: 'P', period2: 'P', period3: 'P', period4: 'P', period5: 'P',
    remarks: '', attendancePercentage: 92.5
  },
  { 
    id: 2, sno: 2, rollNo: '2021002', name: 'Jane Smith', batch: 'A',
    period1: 'P', period2: 'P', period3: 'A', period4: 'P', period5: 'P',
    remarks: '', attendancePercentage: 88.0
  },
  { 
    id: 3, sno: 3, rollNo: '2021003', name: 'Mike Johnson', batch: 'B',
    period1: 'P', period2: 'P', period3: 'P', period4: 'P', period5: 'P',
    remarks: '', attendancePercentage: 90.0
  },
  { 
    id: 4, sno: 4, rollNo: '2021004', name: 'Sarah Williams', batch: 'B',
    period1: 'P', period2: 'OD', period3: 'OD', period4: 'OD', period5: 'OD',
    remarks: 'Sports Event', attendancePercentage: 85.5
  },
];

export default function ODLeaveEntry({ user, onLogout }: ODLeaveEntryProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [students, setStudents] = useState<Student[]>(mockStudents);

  const handlePeriodChange = (id: number, period: string, value: string) => {
    setStudents(students.map(s => 
      s.id === id ? { ...s, [period]: value } : s
    ));
  };

  const handleRemarksChange = (id: number, remarks: string) => {
    setStudents(students.map(s => 
      s.id === id ? { ...s, remarks } : s
    ));
  };

  const handleSave = () => {
    toast.success('OD/Leave entries saved successfully!');
  };

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="space-y-6">
        <h1 className="text-2xl text-slate-800">OD / Informed Leave Entry</h1>

        <Card className="border-2 border-slate-300">
          <CardHeader>
            <CardTitle className="text-slate-800">Select Date</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Label className="text-slate-700">Date:</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="justify-start text-left border-slate-300"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-white border-2 border-slate-300">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-slate-300">
          <CardHeader>
            <CardTitle className="text-slate-800">
              Attendance - {date ? format(date, 'PPP') : 'Select Date'}
            </CardTitle>
            <p className="text-sm text-slate-600 mt-2">
              P = Present, A = Absent, OD = On Duty, IL = Informed Leave
            </p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-100 border-2 border-slate-300">
                    <th className="border border-slate-300 px-3 py-2 text-left text-slate-700">S.No</th>
                    <th className="border border-slate-300 px-3 py-2 text-left text-slate-700">Roll No</th>
                    <th className="border border-slate-300 px-3 py-2 text-left text-slate-700">Name</th>
                    <th className="border border-slate-300 px-3 py-2 text-left text-slate-700">Batch</th>
                    <th className="border border-slate-300 px-3 py-2 text-center text-slate-700">P1</th>
                    <th className="border border-slate-300 px-3 py-2 text-center text-slate-700">P2</th>
                    <th className="border border-slate-300 px-3 py-2 text-center text-slate-700">P3</th>
                    <th className="border border-slate-300 px-3 py-2 text-center text-slate-700">P4</th>
                    <th className="border border-slate-300 px-3 py-2 text-center text-slate-700">P5</th>
                    <th className="border border-slate-300 px-3 py-2 text-left text-slate-700">Remarks</th>
                    <th className="border border-slate-300 px-3 py-2 text-center text-slate-700">Att %</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.id} className="border border-slate-300 hover:bg-slate-50">
                      <td className="border border-slate-300 px-3 py-2 text-slate-700">{student.sno}</td>
                      <td className="border border-slate-300 px-3 py-2 text-slate-700">{student.rollNo}</td>
                      <td className="border border-slate-300 px-3 py-2 text-slate-700">{student.name}</td>
                      <td className="border border-slate-300 px-3 py-2 text-slate-700">{student.batch}</td>
                      
                      {['period1', 'period2', 'period3', 'period4', 'period5'].map((period) => (
                        <td key={period} className="border border-slate-300 px-2 py-2">
                          <Select 
                            value={student[period as keyof Student] as string} 
                            onValueChange={(value) => handlePeriodChange(student.id, period, value)}
                          >
                            <SelectTrigger className="h-8 border-slate-300 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-white border-2 border-slate-300">
                              <SelectItem value="P">P</SelectItem>
                              <SelectItem value="A">A</SelectItem>
                              <SelectItem value="OD">OD</SelectItem>
                              <SelectItem value="IL">IL</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                      ))}
                      
                      <td className="border border-slate-300 px-2 py-2">
                        <Input
                          type="text"
                          value={student.remarks}
                          onChange={(e) => handleRemarksChange(student.id, e.target.value)}
                          placeholder="Add remarks"
                          className="h-8 border-slate-300 text-xs"
                        />
                      </td>
                      <td className="border border-slate-300 px-3 py-2 text-center text-slate-700">
                        {student.attendancePercentage}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                onClick={handleSave}
                className="bg-slate-700 hover:bg-slate-800 text-white"
              >
                Save Entries
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
