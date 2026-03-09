import { useState } from 'react';
import Layout from '../../app/components/Layout';
import { Button } from '../../app/components/ui/button';
import { Input } from '../../app/components/ui/input';
import { Label } from '../../app/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../app/components/ui/card';
import { PageProps } from '../shared/types';
import { SelectField } from '../shared/SelectField';
import { BATCH_OPTIONS, GENDER_OPTIONS, YEAR_OPTIONS } from '../shared/constants';
import { addStudent } from '../../api/student.api';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function AddStudent({ user, onLogout }: PageProps) {
	const [name, setName] = useState('');
	const [roll_number, setroll_number] = useState('');
	const [parent_phone, setparent_phone] = useState('');
	const [batch, setBatch] = useState('');
	const [phone, setphone] = useState('');
	const [dob, setdob] = useState('');
	const [gender, setgender] = useState('');
	const [email, setemail] = useState('');
	const [address, setaddress] = useState('');
	const [current_year, setcurrent_year] = useState('');
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!name || !roll_number || !parent_phone || !batch || !current_year) return toast.error('Please fill in required fields (*)');
		setLoading(true);
		try {
			
			await addStudent(name, roll_number, parent_phone, Number(batch), phone, Number(current_year), email, dob, gender, address);
			toast.success(`Student ${name} (${roll_number}) added to Batch ${batch} successfully!`);
			setName(''); setroll_number(''); setparent_phone(''); setBatch(''); setcurrent_year('');
			setphone(''); setemail(''); setdob(''); setgender(''); setaddress('');
		} catch (err: any) {
			toast.error(err.message || 'Failed to add student');
		}
		finally { setLoading(false); }
	};

	return (
		<Layout user={user} onLogout={onLogout}>
			<div className="max-w-4xl mx-auto pb-10">
				<h1 className="text-2xl font-semibold text-slate-800 mb-6">Student Registration</h1>
				<Card className="border-2 border-slate-300">
					<CardHeader>
						<CardTitle className="text-slate-800">New Student Details</CardTitle>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSubmit} className="space-y-6">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								{/* Basic Info */}
								<div className="space-y-4">
									<h3 className="font-medium text-slate-700 border-b pb-1">Academic Information</h3>
									<div>
										<Label htmlFor="studentName" className="text-slate-700 uppercase text-xs font-bold">Student Name *</Label>
										<Input id="studentName" value={name} onChange={(e) => setName(e.target.value)}
											placeholder="Enter student name" className="mt-1 border-slate-300" required />
									</div>
									<div className="grid grid-cols-2 gap-4">
										<div>
											<Label htmlFor="rollNumber" className="text-slate-700 uppercase text-xs font-bold">Roll Number *</Label>
											<Input id="rollNumber" value={roll_number} onChange={(e) => setroll_number(e.target.value)}
												placeholder="Roll No" className="mt-1 border-slate-300" required />
										</div>
										<SelectField label="Batch *" value={batch} options={BATCH_OPTIONS} onValueChange={setBatch}
											placeholder="Select Batch" />
									</div>
									<SelectField label="Current Year *" value={current_year} options={YEAR_OPTIONS} onValueChange={setcurrent_year}
										placeholder="Select Year" />
								</div>

								{/* Contact Info */}
								<div className="space-y-4">
									<h3 className="font-medium text-slate-700 border-b pb-1">Contact & Personal</h3>
									<div className="grid grid-cols-2 gap-4">
										<div>
											<Label htmlFor="phone" className="text-slate-700 uppercase text-xs font-bold">Student Phone</Label>
											<Input id="phone" type="tel" value={phone} onChange={(e) => setphone(e.target.value)}
												placeholder="10-digit phone" maxLength={10} className="mt-1 border-slate-300" />
										</div>
										<div>
											<Label htmlFor="parentPhone" className="text-slate-700 uppercase text-xs font-bold">Parent Phone *</Label>
											<Input id="parentPhone" type="tel" value={parent_phone} onChange={(e) => setparent_phone(e.target.value)}
												placeholder="10-digit phone" maxLength={10} className="mt-1 border-slate-300" required />
										</div>
									</div>
									<div>
										<Label htmlFor="email" className="text-slate-700 uppercase text-xs font-bold">Email Address</Label>
										<Input id="email" type="email" value={email} onChange={(e) => setemail(e.target.value)}
											placeholder="student@example.com" className="mt-1 border-slate-300" />
									</div>
									<div className="grid grid-cols-2 gap-4">
										<div>
											<Label htmlFor="dob" className="text-slate-700 uppercase text-xs font-bold">Date of Birth</Label>
											<Input id="dob" type="date" value={dob} onChange={(e) => setdob(e.target.value)}
												className="mt-1 border-slate-300 block w-full" />
										</div>
										<SelectField label="Gender" value={gender} options={GENDER_OPTIONS} onValueChange={setgender}
											placeholder="Select" />
									</div>
								</div>
							</div>

							<div className="space-y-2 border-t pt-4">
								<Label htmlFor="address" className="text-slate-700 uppercase text-xs font-bold">Residential Address</Label>
								<Input id="address" value={address} onChange={(e) => setaddress(e.target.value)}
									placeholder="Enter full address" className="mt-1 border-slate-300" />
							</div>

							<div className="pt-4 flex justify-end">
								<Button type="submit" disabled={loading} className="w-full sm:w-48 bg-slate-700 hover:bg-slate-800 text-white font-semibold">
									{loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding...</> : 'Add Student'}
								</Button>
							</div>
						</form>
					</CardContent>
				</Card>
			</div>
		</Layout>
	);
}

