import { useState, useEffect } from 'react';
import Layout from '../../app/components/Layout';
import { Button } from '../../app/components/ui/button';
import { Input } from '../../app/components/ui/input';
import { Label } from '../../app/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../app/components/ui/card';
import { PageProps, User } from '../shared/types';
import { SelectField } from '../shared/SelectField';
import { GENDER_OPTIONS, YEAR_OPTIONS } from '../shared/constants';
import { addStudent, getStudents } from '../../api/student.api';
import { fetchBatches, Batch } from '../../api/batch.api';
import { ApiError } from '../../api/apiClient';
import { toast } from 'sonner';
import { Loader2, Pencil } from 'lucide-react';
import { EditStudentDialog } from '../shared/EditStudentDialog';

interface StudentData {
	student_id: number;
	name: string;
	roll_number: string;
	parent_phone: string;
    phone?: string;
    email?: string;
    dob?: string;
    gender?: string;
    address?: string;
    current_year?: number;
    theory_batch_id?: number | null;
    lab_batch_id?: number | null;
	theoryBatch?: { batch_id?: number; name: string };
	labBatch?: { batch_id?: number; name: string };
}

// ─── Validation Helpers ──────────────────────────────────────────────────────
function validatePhone(phone: string): boolean {
	return /^[6-9]\d{9}$/.test(phone);
}

function validateStudentForm(data: {
	name: string; roll_number: string; parent_phone: string;
	lab_batch: string; current_year: string;
}): string | null {
	if (!data.name.trim()) return 'Student name is required';
	if (!data.roll_number.trim()) return 'Roll number is required';
	if (!data.parent_phone || !validatePhone(data.parent_phone)) return 'Please enter a valid 10-digit parent phone number';
	if (!data.current_year || Number(data.current_year) < 1 || Number(data.current_year) > 4) return 'Year must be between 1 and 4';
	if (!data.lab_batch) return 'Lab batch is required';
	return null;
}

export default function AddStudent({ user, onLogout }: PageProps) {
    const managedYear = (user as User & { managedYear?: number })?.managedYear;
	const [name, setName] = useState('');
	const [roll_number, setroll_number] = useState('');
	const [parent_phone, setparent_phone] = useState('');
	const [lab_batch, setlab_Batch] = useState('');
	const [theory_batch, settheory_Batch] = useState('');

	const [phone, setphone] = useState('');
	const [dob, setdob] = useState('');
	const [gender, setgender] = useState('');
	const [email, setemail] = useState('');
	const [address, setaddress] = useState('');
	const [current_year, setcurrent_year] = useState(managedYear ? String(managedYear) : '');
	const [loading, setLoading] = useState(false);
	const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

	const [theoryBatches, setTheoryBatches] = useState<Batch[]>([]);
	const [labBatches, setLabBatches] = useState<Batch[]>([]);
	const [students, setStudents] = useState<StudentData[]>([]);
	const [initialLoading, setInitialLoading] = useState(true);
    const [editingStudent, setEditingStudent] = useState<StudentData | null>(null);

    const refreshStudents = async () => {
        try {
            const updatedStudents = await getStudents();
            setStudents(updatedStudents);
        } catch (err) {
            toast.error('Failed to refresh students list');
        }
    };

	useEffect(() => {
		const loadData = async () => {
			try {
				const [batchesData, studentsData] = await Promise.all([
					fetchBatches(),
					getStudents()
				]);
				setTheoryBatches(batchesData.filter(b => b.batch_type === 'THEORY'));
				setLabBatches(batchesData.filter(b => b.batch_type === 'LAB'));
				setStudents(studentsData);
			} catch (err) {
				toast.error('Failed to load initial data');
			} finally {
				setInitialLoading(false);
			}
		};
		loadData();
	}, []);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setFieldErrors({});

		// Client-side validation
		const validationError = validateStudentForm({ name, roll_number, parent_phone, lab_batch, current_year });
		if (validationError) return toast.error(validationError);

		// Optional phone validation
		if (phone && !validatePhone(phone)) return toast.error('Please enter a valid 10-digit student phone number');

		setLoading(true);
		try {
			await addStudent(name, roll_number, parent_phone, Number(theory_batch), Number(lab_batch), phone, Number(current_year), email, dob, gender, address);
			toast.success(`Student ${name} (${roll_number}) added successfully!`);
			setName(''); setroll_number(''); setparent_phone(''); setlab_Batch(''); settheory_Batch(''); 
            if (!managedYear) setcurrent_year('');
			setphone(''); setemail(''); setdob(''); setgender(''); setaddress('');
			setFieldErrors({});

			// Refresh table
			await refreshStudents();
		} catch (err: any) {
			if (err instanceof ApiError && err.code === 'VALIDATION_ERROR') {
				toast.error(err.message || 'Validation failed. Please check your inputs.');
				if (err.fieldErrors) {
					setFieldErrors(err.fieldErrors);
				}
			} else {
				toast.error(err.message || 'Failed to add student');
			}
		}
		finally { setLoading(false); }
	};

	return (
		<Layout user={user} onLogout={onLogout}>
			<div className="max-w-4xl mx-auto pb-10">
				<h1 className="text-2xl font-semibold text-foreground mb-6">Student Registration</h1>
				<Card className="border-2 border-border">
					<CardHeader>
						<CardTitle className="text-foreground">New Student Details</CardTitle>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSubmit} className="space-y-6">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								{/* Basic Info */}
								<div className="space-y-4">
									<h3 className="font-medium text-foreground opacity-90 border-b pb-1">Academic Information</h3>
									<div>
										<Label htmlFor="studentName" className="text-foreground opacity-90 uppercase text-xs font-bold">Student Name *</Label>
										<Input id="studentName" value={name} onChange={(e) => setName(e.target.value)}
											placeholder="Enter student name" className={`mt-1 border-border ${fieldErrors.name ? 'border-red-500' : ''}`} required />
										{fieldErrors.name && <p className="text-red-600 text-xs mt-1">{fieldErrors.name}</p>}
									</div>
									<div className="grid grid-cols-2 gap-4">
										<div>
											<Label htmlFor="rollNumber" className="text-foreground opacity-90 uppercase text-xs font-bold">Roll Number *</Label>
											<Input id="rollNumber" value={roll_number} onChange={(e) => setroll_number(e.target.value)}
												placeholder="Roll No" className={`mt-1 border-border ${fieldErrors.roll_number ? 'border-red-500' : ''}`} required />
											{fieldErrors.roll_number && <p className="text-red-600 text-xs mt-1">{fieldErrors.roll_number}</p>}
										</div>
										<SelectField label="Theory Batch *" value={theory_batch} options={theoryBatches.map(b => ({ value: String(b.batch_id), label: b.name }))} onValueChange={settheory_Batch}
											placeholder="Select Theory Batch" />
										<SelectField label="Lab Batch *" value={lab_batch} options={labBatches.map(b => ({ value: String(b.batch_id), label: b.name }))} onValueChange={setlab_Batch}
											placeholder="Select Lab Batch" />

									</div>
									<SelectField label="Current Year *" value={current_year} options={YEAR_OPTIONS} onValueChange={setcurrent_year}
										placeholder="Select Year" disabled={!!managedYear} />
								</div>

								{/* Contact Info */}
								<div className="space-y-4">
									<h3 className="font-medium text-foreground opacity-90 border-b pb-1">Contact & Personal</h3>
									<div className="grid grid-cols-2 gap-4">
										<div>
											<Label htmlFor="phone" className="text-foreground opacity-90 uppercase text-xs font-bold">Student Phone</Label>
											<Input id="phone" type="tel" value={phone} onChange={(e) => setphone(e.target.value)}
												placeholder="10-digit phone" maxLength={10} className="mt-1 border-border" />
										</div>
										<div>
											<Label htmlFor="parentPhone" className="text-foreground opacity-90 uppercase text-xs font-bold">Parent Phone *</Label>
											<Input id="parentPhone" type="tel" value={parent_phone} onChange={(e) => setparent_phone(e.target.value)}
												placeholder="10-digit phone" maxLength={10} className={`mt-1 border-border ${fieldErrors.parent_phone ? 'border-red-500' : ''}`} required />
											{fieldErrors.parent_phone && <p className="text-red-600 text-xs mt-1">{fieldErrors.parent_phone}</p>}
										</div>
									</div>
									<div>
										<Label htmlFor="email" className="text-foreground opacity-90 uppercase text-xs font-bold">Email Address</Label>
										<Input id="email" type="email" value={email} onChange={(e) => setemail(e.target.value)}
											placeholder="student@example.com" className="mt-1 border-border" />
									</div>
									<div className="grid grid-cols-2 gap-4">
										<div>
											<Label htmlFor="dob" className="text-foreground opacity-90 uppercase text-xs font-bold">Date of Birth</Label>
											<Input id="dob" type="date" value={dob} onChange={(e) => setdob(e.target.value)}
												className="mt-1 border-border block w-full" />
										</div>
										<SelectField label="Gender" value={gender} options={GENDER_OPTIONS} onValueChange={setgender}
											placeholder="Select" />
									</div>
								</div>
							</div>

							<div className="space-y-2 border-t pt-4">
								<Label htmlFor="address" className="text-foreground opacity-90 uppercase text-xs font-bold">Residential Address</Label>
								<Input id="address" value={address} onChange={(e) => setaddress(e.target.value)}
									placeholder="Enter full address" className="mt-1 border-border" />
							</div>

							<div className="pt-4 flex justify-end">
								<Button type="submit" disabled={loading} className="w-full sm:w-48 bg-primary hover:bg-primary/90 text-primary-foreground hover:bg-primary/90 text-white font-semibold">
									{loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding...</> : 'Add Student'}
								</Button>
							</div>
						</form>
					</CardContent>
				</Card>

				<div className="mt-8">
					<h2 className="text-xl font-semibold text-foreground mb-4">Added Students List</h2>
					<Card className="border-2 border-border">
						<CardContent className="p-0">
							{initialLoading ? (
								<div className="p-8 flex justify-center text-muted-foreground"><Loader2 className="animate-spin mr-2" /> Loading...</div>
							) : students.length === 0 ? (
								<div className="p-8 text-center text-muted-foreground italic">No students added yet.</div>
							) : (
								<div className="overflow-x-auto rounded-lg border border-border bg-background">
									<table className="w-full text-sm">
										<thead className="bg-muted/30 border-b border-border">
											<tr>
												<th className="px-6 py-4 text-left text-muted-foreground font-bold uppercase text-[10px] tracking-wider">Roll Number</th>
												<th className="px-6 py-4 text-left text-muted-foreground font-bold uppercase text-[10px] tracking-wider">Name</th>
												<th className="px-6 py-4 text-left text-muted-foreground font-bold uppercase text-[10px] tracking-wider">Theory Batch</th>
												<th className="px-6 py-4 text-left text-muted-foreground font-bold uppercase text-[10px] tracking-wider">Lab Batch</th>
												<th className="px-6 py-4 text-left text-muted-foreground font-bold uppercase text-[10px] tracking-wider">Parent Phone</th>
												<th className="px-6 py-4 text-center text-muted-foreground font-bold uppercase text-[10px] tracking-wider w-24">Actions</th>
											</tr>
										</thead>
										<tbody className="divide-y divide-border/30">
											{students.map((student) => (
												<tr key={student.student_id} className="hover:bg-muted/20 transition-colors group">
													<td className="px-6 py-4 font-mono font-bold text-foreground opacity-90">{student.roll_number}</td>
													<td className="px-6 py-4 text-foreground font-semibold whitespace-nowrap">{student.name}</td>
													<td className="px-6 py-4 text-muted-foreground font-medium text-xs">{student.theoryBatch?.name || '-'}</td>
													<td className="px-6 py-4 text-muted-foreground font-medium text-xs">{student.labBatch?.name || '-'}</td>
													<td className="px-6 py-4 text-muted-foreground font-medium text-xs">{student.parent_phone}</td>
                                                    <td className="px-6 py-4 text-center">
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-primary hover:bg-primary/10 transition-colors" onClick={() => setEditingStudent(student)}>
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                    </td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			</div>
            <EditStudentDialog 
                student={editingStudent} 
                open={!!editingStudent} 
                onOpenChange={(open) => !open && setEditingStudent(null)} 
                onSuccess={refreshStudents} 
                theoryBatches={theoryBatches}
                labBatches={labBatches}
                managedYear={managedYear}
            />
		</Layout>
	);
}
