import { useState } from 'react';
import Layout from './Layout';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';

interface AttendanceCorrectionProps {
	user: { role: string; name: string };
	onLogout: () => void;
}

interface Student {
	id: number;
	rollNo: string;
	name: string;
	status: string;
	odReason: string;
}

export default function AttendanceCorrection({ user, onLogout }: AttendanceCorrectionProps) {
	const [year, setYear] = useState('');
	const [batch, setBatch] = useState('');
	const [period, setPeriod] = useState('');
	const [date, setDate] = useState<Date | undefined>(undefined);
	const [students, setStudents] = useState<Student[]>([]);
	const [showTable, setShowTable] = useState(false);

	const handleFetchStudents = () => {
		if (!year || !batch || !period || !date) {
			toast.error('Please fill in all fields');
			return;
		}

		// Mock student data
		const mockStudents: Student[] = [
			{ id: 1, rollNo: '2021001', name: 'John Doe', status: 'Present', odReason: '' },
			{ id: 2, rollNo: '2021002', name: 'Jane Smith', status: 'Present', odReason: '' },
			{ id: 3, rollNo: '2021003', name: 'Mike Johnson', status: 'Absent', odReason: '' },
			{ id: 4, rollNo: '2021004', name: 'Sarah Williams', status: 'Present', odReason: '' },
			{ id: 5, rollNo: '2021005', name: 'Tom Brown', status: 'OD', odReason: 'Sports Event' },
		];

		setStudents(mockStudents);
		setShowTable(true);
	};

	const handleStatusChange = (id: number, status: string) => {
		setStudents(students.map(s =>
			s.id === id ? { ...s, status, odReason: status === 'OD' ? s.odReason : '' } : s
		));
	};

	const handleODReasonChange = (id: number, reason: string) => {
		setStudents(students.map(s =>
			s.id === id ? { ...s, odReason: reason } : s
		));
	};

	const handleSave = () => {
		toast.success('Attendance corrections saved successfully! Audit log updated.');
	};

	return (
		<Layout user={user} onLogout={onLogout}>
			<div className="space-y-6">
				<h1 className="text-2xl text-slate-800">Attendance Correction</h1>

				<Card className="border-2 border-slate-300">
					<CardHeader>
						<CardTitle className="text-slate-800">Select Criteria</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
							<div>
								<Label className="text-slate-700">Year *</Label>
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

							<div>
								<Label className="text-slate-700">Batch *</Label>
								<Select value={batch} onValueChange={setBatch}>
									<SelectTrigger className="mt-1 border-slate-300">
										<SelectValue placeholder="Select batch" />
									</SelectTrigger>
									<SelectContent className="bg-white border-2 border-slate-300">
										<SelectItem value="A">Batch A</SelectItem>
										<SelectItem value="B">Batch B</SelectItem>
										<SelectItem value="C">Batch C</SelectItem>
										<SelectItem value="D">Batch D</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div>
								<Label className="text-slate-700">Period *</Label>
								<Select value={period} onValueChange={setPeriod}>
									<SelectTrigger className="mt-1 border-slate-300">
										<SelectValue placeholder="Select period" />
									</SelectTrigger>
									<SelectContent className="bg-white border-2 border-slate-300">
										<SelectItem value="1">Period 1</SelectItem>
										<SelectItem value="2">Period 2</SelectItem>
										<SelectItem value="3">Period 3</SelectItem>
										<SelectItem value="4">Period 4</SelectItem>
										<SelectItem value="5">Period 5</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div>
								<Label className="text-slate-700">Date *</Label>
								<Popover>
									<PopoverTrigger asChild>
										<Button
											variant="outline"
											className="w-full mt-1 justify-start text-left border-slate-300"
										>
											<CalendarIcon className="mr-2 h-4 w-4" />
											{date ? format(date, 'PP') : <span>Pick a date</span>}
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

							<div className="flex items-end">
								<Button
									onClick={handleFetchStudents}
									className="w-full bg-slate-700 hover:bg-slate-800 text-white"
								>
									Fetch Students
								</Button>
							</div>
						</div>
					</CardContent>
				</Card>

				{showTable && (
					<Card className="border-2 border-slate-300">
						<CardHeader>
							<CardTitle className="text-slate-800">
								Attendance for {year && `Year ${year}`} - Batch {batch} - Period {period}
								{date && ` - ${format(date, 'PP')}`}
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
											<th className="border border-slate-300 px-4 py-3 text-left text-slate-700">OD Reason</th>
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
														<SelectContent className="bg-white border-2 border-slate-300">
															<SelectItem value="Present">Present</SelectItem>
															<SelectItem value="Absent">Absent</SelectItem>
															<SelectItem value="OD">OD</SelectItem>
															<SelectItem value="Informed Leave">Informed Leave</SelectItem>
														</SelectContent>
													</Select>
												</td>
												<td className="border border-slate-300 px-4 py-3">
													{student.status === 'OD' && (
														<Input
															type="text"
															value={student.odReason}
															onChange={(e) => handleODReasonChange(student.id, e.target.value)}
															placeholder="Enter OD reason"
															className="border-slate-300"
														/>
													)}
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
									Save Changes
								</Button>
							</div>
						</CardContent>
					</Card>
				)}
			</div>
		</Layout>
	);
}
