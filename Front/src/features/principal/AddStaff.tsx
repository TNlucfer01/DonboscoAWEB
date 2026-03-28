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
import { Pencil, Trash2, Loader2, UserPlus } from 'lucide-react';
import { StaffDetailsDialog } from '../shared/StaffDetailsDialog';
import { EditStaffDialog } from '../shared/EditStaffDialog';
import { toast } from 'sonner';

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
	const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);

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
			<div className="space-y-10">
				<div className="flex flex-col gap-1">
					<h1 className="text-3xl font-bold text-foreground">Staff Management</h1>
					<p className="text-muted-foreground">Manage administrative and academic staff members</p>
				</div>

				{/* ── Add Staff Form ─────────────────────────────────── */}
				<div className="max-w-3xl">
					<Card className="border-none shadow-xl shadow-black/5 bg-card overflow-hidden">
						<CardHeader className="bg-primary/5 pb-6">
							<CardTitle className="text-foreground flex items-center gap-2">
								<UserPlus className="w-5 h-5 text-primary" />
								Add New Staff
							</CardTitle>
						</CardHeader>
						<CardContent className="pt-8">
							<form onSubmit={handleSubmit} className="space-y-6">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<div className="space-y-2">
										<Label htmlFor="staffName" className="text-sm font-semibold text-foreground ml-1">Staff Name *</Label>
										<Input id="staffName" value={name} onChange={(e) => setName(e.target.value)}
											placeholder="Full name of the staff" className="h-11 rounded-xl bg-background border-border" />
									</div>
									<div className="space-y-2">
										<Label htmlFor="email" className="text-sm font-semibold text-foreground ml-1">Email *</Label>
										<Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
											placeholder="staff@institute.edu" className="h-11 rounded-xl bg-background border-border" />
									</div>
									<div className="space-y-2">
										<Label htmlFor="phone" className="text-sm font-semibold text-foreground ml-1">Phone Number *</Label>
										<Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
											placeholder="10-digit mobile number" maxLength={10} className="h-11 rounded-xl bg-background border-border" />
									</div>
									<div className="space-y-2">
										<SelectField label="Role *" value={role} options={ROLE_OPTIONS} onValueChange={setRole} />
									</div>
								</div>

								{role === "YEAR_COORDINATOR" && (
									<div className="space-y-2 p-4 bg-secondary/5 rounded-xl border border-secondary/10">
										<Label htmlFor="managed_year" className="text-sm font-semibold text-secondary ml-1">Managing Year *</Label>
										<Input 
											id="managed_year" 
											value={managed_year} 
											onChange={(e) => setmanaged_year(Number(e.target.value))} 
											className="h-11 rounded-xl bg-background border-border" 
											placeholder='Enter year (1-4)' 
											type='number' 
											min={1} 
											max={4}
										/>
									</div>
								)}

								<div className="flex items-center justify-between pt-4 gap-4">
									<p className="text-xs text-muted-foreground max-w-sm italic">
										Note: A default password <span className="font-mono font-bold text-secondary">(Password@123)</span> will be created for the new staff member.
									</p>
									<Button type="submit" disabled={loading} className="px-8 h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98]">
										{loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
										{loading ? 'Saving…' : 'Finalize & Save Staff'}
									</Button>
								</div>
							</form>
						</CardContent>
					</Card>
				</div>

				{/* ── Staff List Table ──────────────────────────────── */}
				<div className="space-y-4">
					<div className="flex items-center justify-between px-2">
						<h2 className="text-xl font-bold text-foreground">Registered Personnel</h2>
						<span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">{staffList.length} Active Records</span>
					</div>
					
					<div className="rounded-2xl border border-border/50 bg-background shadow-xl shadow-black/5 overflow-hidden">
						<div className="overflow-x-auto">
							<table className="w-full text-sm">
								<thead>
									<tr className="bg-muted/30 border-b border-border">
										<th className="px-6 py-4 text-left text-muted-foreground font-bold uppercase text-[10px] tracking-wider">Name</th>
										<th className="px-6 py-4 text-left text-muted-foreground font-bold uppercase text-[10px] tracking-wider">Contact Details</th>
										<th className="px-6 py-4 text-left text-muted-foreground font-bold uppercase text-[10px] tracking-wider">Designation</th>
										<th className="px-6 py-4 text-center text-muted-foreground font-bold uppercase text-[10px] tracking-wider w-32">Actions</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-border/30">
									{listLoading ? (
										<tr>
											<td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
												<Loader2 className="mx-auto h-8 w-8 animate-spin text-primary opacity-50" />
												<p className="mt-2 font-medium">Synchronizing records...</p>
											</td>
										</tr>
									) : staffList.length === 0 ? (
										<tr>
											<td colSpan={4} className="px-6 py-12 text-center text-muted-foreground italic bg-muted/5">
												No staff members found in the current directory.
											</td>
										</tr>
									) : (
										staffList.map((s) => (
											<tr key={s.user_id} className="hover:bg-muted/20 transition-colors group">
												<td className="px-6 py-4">
													<div className="font-bold text-foreground group-hover:text-primary transition-colors">
														<StaffDetailsDialog staffId={s.user_id} staffName={s.name} />
													</div>
													<div className="text-[10px] text-muted-foreground font-medium uppercase mt-0.5">ID: {s.user_id}</div>
												</td>
												<td className="px-6 py-4">
													<div className="text-foreground font-medium">{s.email}</div>
													<div className="text-xs text-muted-foreground">{s.phone_number}</div>
												</td>
												<td className="px-6 py-4">
													<span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
														s.role === 'YEAR_COORDINATOR' ? 'bg-secondary/10 text-secondary' : 'bg-primary/10 text-primary'
													}`}>
														{roleLabel(s.role)}
													</span>
												</td>
												<td className="px-6 py-4 text-center">
													<div className="flex justify-center gap-1">
														<Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-primary hover:bg-primary/10 transition-colors" onClick={() => setEditingStaff(s)}>
															<Pencil className="h-4 w-4" />
														</Button>
														<Button 
															variant="ghost" 
															size="icon" 
															className="h-8 w-8 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
															onClick={() => handleDelete(s.user_id, s.name)}
														>
															<Trash2 className="h-4 w-4" />
														</Button>
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
			</div>
			
			<EditStaffDialog 
				staff={editingStaff} 
				open={!!editingStaff} 
				onOpenChange={(open) => !open && setEditingStaff(null)} 
				onSuccess={loadStaff} 
			/>
		</Layout>
	);
}
