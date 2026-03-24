import { useState } from 'react';
import Layout from './Layout';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { toast } from 'sonner';

interface StaffTakeAttendanceProps {
  user: { role: string; name: string };
  onLogout: () => void;
}

interface Student {
  id: number;
  rollNo: string;
  name: string;
  status: string;
}

export default function StaffTakeAttendance({ user, onLogout }: StaffTakeAttendanceProps) {
  const [year, setYear] = useState('');
  const [batch, setBatch] = useState('');
  const [period, setPeriod] = useState('');
  const [subject, setSubject] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [showTable, setShowTable] = useState(false);

  const handleFetchStudents = () => {
    if (!year || !batch || !period || !subject) {
      toast.error('Please fill in all fields');
      return;
    }

    // Mock student data
    const mockStudents: Student[] = [
      { id: 1, rollNo: '2021001', name: 'John Doe', status: 'Present' },
      { id: 2, rollNo: '2021002', name: 'Jane Smith', status: 'Present' },
      { id: 3, rollNo: '2021003', name: 'Mike Johnson', status: 'Present' },
      { id: 4, rollNo: '2021004', name: 'Sarah Williams', status: 'Present' },
      { id: 5, rollNo: '2021005', name: 'Tom Brown', status: 'Present' },
      { id: 6, rollNo: '2021006', name: 'Emma Davis', status: 'Present' },
      { id: 7, rollNo: '2021007', name: 'David Wilson', status: 'Present' },
      { id: 8, rollNo: '2021008', name: 'Olivia Martinez', status: 'Present' },
    ];

    setStudents(mockStudents);
    setShowTable(true);
  };

  const handleStatusChange = (id: number, status: string) => {
    setStudents(students.map(s => 
      s.id === id ? { ...s, status } : s
    ));
  };

  const handleSubmit = () => {
    toast.success('Attendance saved successfully!');
  };

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="space-y-6">
        <h1 className="text-2xl text-slate-800">Take Attendance</h1>

        <Card className="border-2 border-slate-300">
          <CardHeader>
            <CardTitle className="text-slate-800">Select Class Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Step 1: Year Selection */}
              <div>
                <Label className="text-slate-700 mb-3 block">Step 1: Select Year *</Label>
                <RadioGroup value={year} onValueChange={setYear} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1" id="year1" className="border-slate-300" />
                    <Label htmlFor="year1" className="text-slate-700 cursor-pointer">1st Year</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="2" id="year2" className="border-slate-300" />
                    <Label htmlFor="year2" className="text-slate-700 cursor-pointer">2nd Year</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="3" id="year3" className="border-slate-300" />
                    <Label htmlFor="year3" className="text-slate-700 cursor-pointer">3rd Year</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="4" id="year4" className="border-slate-300" />
                    <Label htmlFor="year4" className="text-slate-700 cursor-pointer">4th Year</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Step 2: Batch Selection */}
              <div>
                <Label className="text-slate-700">Step 2: Select Batch *</Label>
                <Select value={batch} onValueChange={setBatch}>
                  <SelectTrigger className="mt-2 border-slate-300">
                    <SelectValue placeholder="Select batch" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#f7f3ea] border-2 border-slate-300">
                    <SelectItem value="A">Batch A</SelectItem>
                    <SelectItem value="B">Batch B</SelectItem>
                    <SelectItem value="C">Batch C</SelectItem>
                    <SelectItem value="D">Batch D</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Step 3: Period Selection */}
              <div>
                <Label className="text-slate-700">Step 3: Select Period *</Label>
                <Select value={period} onValueChange={setPeriod}>
                  <SelectTrigger className="mt-2 border-slate-300">
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#f7f3ea] border-2 border-slate-300">
                    <SelectItem value="1">Period 1</SelectItem>
                    <SelectItem value="2">Period 2</SelectItem>
                    <SelectItem value="3">Period 3</SelectItem>
                    <SelectItem value="4">Period 4</SelectItem>
                    <SelectItem value="5">Period 5</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Step 4: Subject Selection */}
              <div>
                <Label className="text-slate-700">Step 4: Select Subject *</Label>
                <Select value={subject} onValueChange={setSubject}>
                  <SelectTrigger className="mt-2 border-slate-300">
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#f7f3ea] border-2 border-slate-300">
                    <SelectItem value="CS101">Computer Science (CS101)</SelectItem>
                    <SelectItem value="MA101">Mathematics (MA101)</SelectItem>
                    <SelectItem value="PH101">Physics (PH101)</SelectItem>
                    <SelectItem value="CH101">Chemistry (CH101)</SelectItem>
                    <SelectItem value="EE101">Electrical Engineering (EE101)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Step 5: Fetch Students */}
              <div>
                <Button
                  onClick={handleFetchStudents}
                  className="w-full sm:w-auto bg-slate-700 hover:bg-slate-800 text-white"
                >
                  Fetch Students
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step 6: Attendance Table */}
        {showTable && (
          <Card className="border-2 border-slate-300">
            <CardHeader>
              <CardTitle className="text-slate-800">
                Mark Attendance - Year {year} - Batch {batch} - Period {period} - {subject}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-2 border-slate-300">
                      <th className="border border-slate-300 px-4 py-3 text-left text-slate-700">S.No</th>
                      <th className="border border-slate-300 px-4 py-3 text-left text-slate-700">Roll No</th>
                      <th className="border border-slate-300 px-4 py-3 text-left text-slate-700">Name</th>
                      <th className="border border-slate-300 px-4 py-3 text-left text-slate-700">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student, index) => (
                      <tr key={student.id} className="border border-slate-300 hover:bg-slate-50">
                        <td className="border border-slate-300 px-4 py-3 text-slate-700">{index + 1}</td>
                        <td className="border border-slate-300 px-4 py-3 text-slate-700">{student.rollNo}</td>
                        <td className="border border-slate-300 px-4 py-3 text-slate-700">{student.name}</td>
                        <td className="border border-slate-300 px-4 py-3">
                          <Select 
                            value={student.status} 
                            onValueChange={(value) => handleStatusChange(student.id, value)}
                          >
                            <SelectTrigger className="border-slate-300">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-[#f7f3ea] border-2 border-slate-300">
                              <SelectItem value="Present">Present</SelectItem>
                              <SelectItem value="Absent">Absent</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 flex justify-end gap-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setStudents(students.map(s => ({ ...s, status: 'Present' })));
                  }}
                  className="border-slate-300 text-slate-700"
                >
                  Mark All Present
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="bg-slate-700 hover:bg-slate-800 text-white"
                >
                  Submit Attendance
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
