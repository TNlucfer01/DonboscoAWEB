// ─── Principal: Staff CRUD ────────────────────────────────────────────────────
// Form on top, staff list table below (per UI Design § 4).

import { useState, useEffect } from 'react';
import Layout from '../../app/components/Layout';
import { Button } from '../../app/components/ui/button';
import { Input } from '../../app/components/ui/input';
import { Label } from '../../app/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../app/components/ui/card';
import { PageProps } from '../shared/types';
import { StaffMember, fetchStaffMembers, addStaffMember, deleteStaffMember } from '../../api/staff.api';
import { SelectField } from '../shared/SelectField';
import { toast } from 'sonner';
import { Pencil, Trash2, Loader2 } from 'lucide-react';

const ROLE_OPTIONS = [
	{ value: 'YEAR_COORDINATOR', label: 'Year Co-ordinator' },
	{ value: 'SUBJECT_STAFF', label: 'Subject Staff' },
];

export default function AddStaff({ user, onLogout }: PageProps) {
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [phone, setPhone] = useState('');
	const [role, setRole] = useState('');
	const [managed_year, setmanaged_year] = useState(0);
	const [loading, setLoading] = useState(false);

	// ── Staff List ────────────────────────────────────────────────
	const [staffList, setStaffList] = useState<StaffMember[]>([]);
	const [listLoading, setListLoading] = useState(true);

	const loadStaff = async () => {
		setListLoading(true);
		try {
			const data = await fetchStaffMembers();
			setStaffList(data);
		} catch {
			toast.error('Failed to load staff list');
		} finally {
			setListLoading(false);
		}
	};

	useEffect(() => { loadStaff(); }, []);

	// ── Add Staff ─────────────────────────────────────────────────
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!name || !email || !phone || !role) return toast.error('Please fill in all fields');
		setLoading(true);
		try {
			await addStaffMember(name, email, phone, role, managed_year);
			toast.success(`Staff member ${name} added! Default password: Password@123`);
			setName(''); setEmail(''); setPhone(''); setRole(''); setmanaged_year(0);
			await loadStaff(); // refresh table
		} catch (err: any) {
			toast.error(err.message || 'Failed to add staff member');
		} finally {
			setLoading(false);
		}
	};

	// ── Deactivate Staff ──────────────────────────────────────────
	const handleDelete = async (id: number, staffName: string) => {
		if (!confirm(`Are you sure you want to deactivate ${staffName}?`)) return;
		try {
			await deleteStaffMember(id);
			toast.success(`${staffName} has been deactivated`);
			await loadStaff();
		} catch (err: any) {
			toast.error(err.message || 'Failed to deactivate staff member');
		}
	};

	const roleLabel = (r: string) =>
		r === 'YEAR_COORDINATOR' ? 'Year Co-ordinator' : r === 'SUBJECT_STAFF' ? 'Subject Staff' : r;

	return (
		<Layout user={user} onLogout={onLogout}>
			<div className="space-y-8">
				{/* ── Add Staff Form ─────────────────────────────────── */}
				<div className="max-w-2xl">
					<h1 className="text-2xl text-slate-800 mb-6">Staff Management</h1>
					<Card className="border-2 border-slate-300">
						<CardHeader><CardTitle className="text-slate-800">Add New Staff</CardTitle></CardHeader>
						<CardContent>
							<form onSubmit={handleSubmit} className="space-y-4">
								<div>
									<Label htmlFor="staffName" className="text-slate-700">Staff Name *</Label>
									<Input id="staffName" value={name} onChange={(e) => setName(e.target.value)}
										placeholder="Enter staff name" className="mt-1 border-slate-300" />
								</div>
								<div>
									<Label htmlFor="email" className="text-slate-700">Email *</Label>
									<Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
										placeholder="Enter email address" className="mt-1 border-slate-300" />
								</div>
								<div>
									<Label htmlFor="phone" className="text-slate-700">Phone Number *</Label>
									<Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
										placeholder="Enter 10-digit phone number" maxLength={10} className="mt-1 border-slate-300" />
								</div>
								<SelectField label="Role *" value={role} options={ROLE_OPTIONS} onValueChange={setRole} />
								{role == "YEAR_COORDINATOR" ?
									<div>
										<Label htmlFor="phone" className="text-slate-700">Managing Year *</Label>
										<input id="managed_year" value={managed_year} onChange={(e) => setmanaged_year(Number(e.target.value))} className="mt-1 border-slate-300" placeholder='enter the Year 1 - 4' type='number' /> </div> : <br />
								}
								<div className="pt-4">
									<Button type="submit" disabled={loading} className="w-full sm:w-auto bg-slate-700 hover:bg-slate-800 text-white">
										{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
										{loading ? 'Saving…' : 'Save Staff Member'}
									</Button>
								</div>
								<p className="text-sm text-slate-600 bg-slate-50 border border-slate-300 p-3">
									Note: A default password (Password@123) will be created for the new staff member.
								</p>
							</form>
						</CardContent>
					</Card>
				</div>

				{/* ── Staff List Table ──────────────────────────────── */}
				<div>
					<h2 className="text-xl text-slate-800 mb-4">Staff List</h2>
					<div className="border-2 border-slate-300 overflow-x-auto">
						<table className="w-full text-sm">
							<thead>
								<tr className="bg-slate-200 text-slate-800">
									<th className="text-left p-3 border border-slate-300 font-semibold">Name</th>
									<th className="text-left p-3 border border-slate-300 font-semibold">Email</th>
									<th className="text-left p-3 border border-slate-300 font-semibold">Phone</th>
									<th className="text-left p-3 border border-slate-300 font-semibold">Role</th>
									<th className="text-center p-3 border border-slate-300 font-semibold w-32">Actions</th>
								</tr>
							</thead>
							<tbody>
								{listLoading ? (
									<tr>
										<td colSpan={5} className="text-center p-6 text-slate-500">
											<Loader2 className="mx-auto h-6 w-6 animate-spin" />
										</td>
									</tr>
								) : staffList.length === 0 ? (
									<tr>
										<td colSpan={5} className="text-center p-6 text-slate-500">
											No staff members found. Add one using the form above.
										</td>
									</tr>
								) : (
									staffList.map((s, i) => (
										<tr key={s.user_id} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
											<td className="p-3 border border-slate-300">{s.name}</td>
											<td className="p-3 border border-slate-300">{s.email}</td>
											<td className="p-3 border border-slate-300">{s.phone_number}</td>
											<td className="p-3 border border-slate-300">{roleLabel(s.role)}</td>
											<td className="p-3 border border-slate-300 text-center">
												<div className="flex justify-center gap-2">
													<button title="Edit" className="text-blue-600 hover:text-blue-800">
														<Pencil className="h-4 w-4" />
													</button>
													<button title="Deactivate" className="text-red-600 hover:text-red-800"
														onClick={() => handleDelete(s.user_id, s.name)}>
														<Trash2 className="h-4 w-4" />
													</button>
												</div>
											</td>
										</tr>
									))
								)}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</Layout>
	);
}
