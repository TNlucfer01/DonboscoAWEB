import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../app/components/ui/dialog';
import { Button } from '../../app/components/ui/button';
import { Input } from '../../app/components/ui/input';
import { Label } from '../../app/components/ui/label';
import { SelectField } from './SelectField';
import { StaffMember, updateStaffMember } from '../../api/staff.api';
import { toast } from 'sonner';
import { Loader2, UserCheck } from 'lucide-react';

const ROLE_OPTIONS = [
    { value: 'YEAR_COORDINATOR', label: 'Year Co-ordinator' },
    { value: 'SUBJECT_STAFF', label: 'Subject Staff' },
];

export function EditStaffDialog({
    staff,
    open,
    onOpenChange,
    onSuccess
}: {
    staff: StaffMember | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [role, setRole] = useState('');
    const [managed_year, setManagedYear] = useState<number>(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (staff) {
            setName(staff.name || '');
            setEmail(staff.email || '');
            setPhone(staff.phone_number || '');
            setRole(staff.role || '');
            setManagedYear(staff.managed_year || 0);
        }
    }, [staff]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!staff) return;
        if (!name || !email || !phone || !role) return toast.error('Please fill in all fields');
        setLoading(true);
        try {
            await updateStaffMember(staff.user_id, {
                name,
                email,
                phone_number: phone,
                role,
                managed_year: role === 'YEAR_COORDINATOR' ? managed_year : null,
            });
            toast.success(`Staff member ${name} updated successfully!`);
            onSuccess();
            onOpenChange(false);
        } catch (err: any) {
            toast.error(err.message || 'Failed to update staff member');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl bg-card border-border rounded-2xl shadow-2xl p-0 overflow-hidden focus:outline-none">
                <DialogHeader className="bg-primary/5 pb-6 p-6 border-b border-border">
                    <DialogTitle className="text-foreground flex items-center gap-2 text-2xl font-bold">
                        <UserCheck className="w-6 h-6 text-primary" />
                        Edit Staff Details
                    </DialogTitle>
                </DialogHeader>
                <div className="p-6 pt-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="editStaffName" className="text-sm font-semibold text-foreground ml-1">Staff Name *</Label>
                                <Input id="editStaffName" value={name} onChange={(e) => setName(e.target.value)}
                                    placeholder="Full name of the staff" className="h-11 rounded-xl bg-background border-border" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="editEmail" className="text-sm font-semibold text-foreground ml-1">Email *</Label>
                                <Input id="editEmail" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                    placeholder="staff@institute.edu" className="h-11 rounded-xl bg-background border-border" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="editPhone" className="text-sm font-semibold text-foreground ml-1">Phone Number *</Label>
                                <Input id="editPhone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                                    placeholder="10-digit mobile number" maxLength={10} className="h-11 rounded-xl bg-background border-border" />
                            </div>
                            <div className="space-y-2">
                                <SelectField label="Role *" value={role} options={ROLE_OPTIONS} onValueChange={setRole} />
                            </div>
                        </div>

                        {role === "YEAR_COORDINATOR" && (
                            <div className="space-y-2 p-4 bg-secondary/5 rounded-xl border border-secondary/10">
                                <Label htmlFor="edit_managed_year" className="text-sm font-semibold text-secondary ml-1">Managing Year *</Label>
                                <Input
                                    id="edit_managed_year"
                                    value={managed_year}
                                    onChange={(e) => setManagedYear(Number(e.target.value))}
                                    className="h-11 rounded-xl bg-background border-border"
                                    placeholder='Enter year (1-4)'
                                    type='number'
                                    min={1}
                                    max={4}
                                />
                            </div>
                        )}

                        <div className="flex justify-end pt-4 gap-4">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="h-12 px-6 rounded-xl">
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading} className="px-8 h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98]">
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserCheck className="mr-2 h-4 w-4" />}
                                {loading ? 'Saving…' : 'Save Changes'}
                            </Button>
                        </div>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
