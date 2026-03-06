import { useState } from 'react';
import { format } from 'date-fns';
import Layout from './Layout';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { DatePickerField } from './attendance/DatePickerField';
import { AttendanceTable } from './attendance/AttendanceTable';
import { mockStudents, type Student } from './attendance/attendanceView.types';

interface PrincipalAttendanceViewProps {
	user: { role: string; name: string };
	onLogout: () => void;
}

export default function PrincipalAttendanceView({ user, onLogout }: PrincipalAttendanceViewProps) {
	const [year, setYear] = useState('');
	const [date, setDate] = useState<Date | undefined>(new Date());
	const [students, setStudents] = useState<Student[]>([]);
	const [showTable, setShowTable] = useState(false);

	const handleFetch = () => {
		if (!year || !date) return;
		setStudents(mockStudents);
		setShowTable(true);
	};

	return (
		<Layout user={user} onLogout={onLogout}>
			<div className="space-y-6">
				<h1 className="text-2xl text-slate-800">Attendance View (College-wide)</h1>

				{/* Filter Card */}
				<Card className="border-2 border-slate-300">
					<CardHeader>
						<CardTitle className="text-slate-800">Filter Attendance</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex flex-col sm:flex-row gap-4 items-end">

							{/* Year Select */}
							<div className="flex-1">
								<Label className="text-slate-700">Year</Label>
								<Select value={year} onValueChange={setYear}>
									<SelectTrigger className="mt-1 border-slate-300">
										<SelectValue placeholder="Select year" />
									</SelectTrigger>
									<SelectContent className="bg-white border-2 border-slate-300">
										<SelectItem value="1">1st Year</SelectItem>
										<SelectItem value="2">2nd Year</SelectItem>
										<SelectItem value="3">3rd Year</SelectItem>
										<SelectItem value="4">4th Year</SelectItem>
									</SelectContent>
								</Select>
							</div>

							{/* Date Picker */}
							<DatePickerField date={date} onDateChange={setDate} label="Date" />

							<Button
								onClick={handleFetch}
								className="bg-slate-700 hover:bg-slate-800 text-white"
							>
								View Attendance
							</Button>
						</div>
					</CardContent>
				</Card>

				{/* Results Table */}
				{showTable && (
					<Card className="border-2 border-slate-300">
						<CardHeader>
							<CardTitle className="text-slate-800">
								Attendance — Year {year}{date ? ` — ${format(date, 'PPP')}` : ''}
							</CardTitle>
							<p className="text-sm text-slate-600 mt-2">
								P = Present, A = Absent, OD = On Duty, IL = Informed Leave
							</p>
						</CardHeader>
						<CardContent>
							<AttendanceTable students={students} />
						</CardContent>
					</Card>
				)}
			</div>
		</Layout>
	);
}
