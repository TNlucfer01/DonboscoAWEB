import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../app/components/ui/dialog';
import { Button } from '../../app/components/ui/button';
import { Input } from '../../app/components/ui/input';
import { Label } from '../../app/components/ui/label';
import { SelectField } from './SelectField';
import { YEAR_OPTIONS, GENDER_OPTIONS } from './constants';
import { updateStudent } from '../../api/student.api';
import { Batch } from '../../api/batch.api';
import { toast } from 'sonner';
import { Loader2, UserPen } from 'lucide-react';
import { ApiError } from '../../api/apiClient';

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

export function EditStudentDialog({
    student,
    open,
    onOpenChange,
    onSuccess,
    theoryBatches,
    labBatches,
    managedYear
}: {
    student: StudentData | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
    theoryBatches: Batch[];
    labBatches: Batch[];
    managedYear?: number;
}) {
    const [name, setName] = useState('');
    const [rollNumber, setRollNumber] = useState('');
    const [parentPhone, setParentPhone] = useState('');
    const [currentYear, setCurrentYear] = useState('');
    const [theoryBatchId, setTheoryBatchId] = useState('');
    const [labBatchId, setLabBatchId] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [dob, setDob] = useState('');
    const [gender, setGender] = useState('');
    const [address, setAddress] = useState('');
    const [loading, setLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (student) {
            setName(student.name || '');
            setRollNumber(student.roll_number || '');
            setParentPhone(student.parent_phone || '');
            setCurrentYear(student.current_year ? student.current_year.toString() : '');
            setPhone(student.phone || '');
            setEmail(student.email || '');
            setDob(student.dob ? new Date(student.dob).toISOString().split('T')[0] : '');
            setGender(student.gender || '');
            setAddress(student.address || '');
            
            // Try to set batch IDs if they exist directly or nested
            let t_id = student.theory_batch_id?.toString() || student.theoryBatch?.batch_id?.toString() || '';
            let l_id = student.lab_batch_id?.toString() || student.labBatch?.batch_id?.toString() || '';
            
            // If we don't have explicit IDs but we have names, try to match them with batch lists
            if (!t_id && student.theoryBatch?.name) {
                const matched = theoryBatches.find(b => b.name === student.theoryBatch?.name);
                if (matched) t_id = matched.batch_id.toString();
            }
            if (!l_id && student.labBatch?.name) {
                const matched = labBatches.find(b => b.name === student.labBatch?.name);
                if (matched) l_id = matched.batch_id.toString();
            }

            setTheoryBatchId(t_id);
            setLabBatchId(l_id);
            setFieldErrors({});
        }
    }, [student, theoryBatches, labBatches]);

    const validatePhone = (phone: string) => /^[6-9]\d{9}$/.test(phone);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFieldErrors({});

        if (!student) return;
        if (!name.trim()) return toast.error('Student name is required');
        if (!rollNumber.trim()) return toast.error('Roll number is required');
        if (!parentPhone || !validatePhone(parentPhone)) return toast.error('Please enter a valid 10-digit parent phone number');
        
        if (phone && !validatePhone(phone)) return toast.error('Please enter a valid 10-digit student phone number');
        
        setLoading(true);
        try {
            await updateStudent(student.roll_number, {
                name,
                roll_number: rollNumber,
                parent_phone: parentPhone,
                current_year: currentYear ? parseInt(currentYear) : undefined,
                theory_batch_id: theoryBatchId ? parseInt(theoryBatchId) : undefined,
                lab_batch_id: labBatchId ? parseInt(labBatchId) : undefined,
                phone: phone || undefined,
                email: email || undefined,
                dob: dob || undefined,
                gender: gender || undefined,
                address: address || undefined,
            });
            toast.success(`Student ${name} (${rollNumber}) updated successfully!`);
            onSuccess();
            onOpenChange(false);
        } catch (err: any) {
            if (err instanceof ApiError && err.code === 'VALIDATION_ERROR') {
                toast.error(err.message || 'Validation failed. Please check your inputs.');
                if (err.fieldErrors) setFieldErrors(err.fieldErrors);
            } else {
                toast.error(err.message || 'Failed to update student');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl bg-card border-border rounded-2xl shadow-2xl p-0 overflow-hidden focus:outline-none">
                <DialogHeader className="bg-primary/5 pb-6 p-6 border-b border-border">
                    <DialogTitle className="text-foreground flex items-center gap-2 text-2xl font-bold">
                        <UserPen className="w-6 h-6 text-primary" />
                        Edit Student Details
                    </DialogTitle>
                </DialogHeader>
                <div className="p-6 pt-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="editStudentName" className="text-sm font-semibold text-foreground ml-1">Student Name *</Label>
                                <Input id="editStudentName" value={name} onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter student name" className={`h-11 rounded-xl bg-background border-border ${fieldErrors.name ? 'border-red-500' : ''}`} required />
                                {fieldErrors.name && <p className="text-red-600 text-xs mt-1">{fieldErrors.name}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="editRollNumber" className="text-sm font-semibold text-foreground ml-1">Roll Number *</Label>
                                <Input id="editRollNumber" value={rollNumber} onChange={(e) => setRollNumber(e.target.value)}
                                    placeholder="Roll No" className={`h-11 rounded-xl bg-background border-border ${fieldErrors.roll_number ? 'border-red-500' : ''}`} required />
                                {fieldErrors.roll_number && <p className="text-red-600 text-xs mt-1">{fieldErrors.roll_number}</p>}
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 col-span-1 md:col-span-2">
                                <SelectField label="Theory Batch" value={theoryBatchId} options={theoryBatches.map(b => ({ value: String(b.batch_id), label: b.name }))} onValueChange={setTheoryBatchId}
                                    placeholder="Select Theory Batch" />
                                <SelectField label="Lab Batch" value={labBatchId} options={labBatches.map(b => ({ value: String(b.batch_id), label: b.name }))} onValueChange={setLabBatchId}
                                    placeholder="Select Lab Batch" />
                            </div>

                            <SelectField label="Current Year" value={currentYear} options={YEAR_OPTIONS} onValueChange={setCurrentYear}
                                placeholder="Select Year" disabled={!!managedYear} />

                            <div className="space-y-2">
                                <Label htmlFor="editParentPhone" className="text-sm font-semibold text-foreground ml-1">Parent Phone *</Label>
                                <Input id="editParentPhone" type="tel" value={parentPhone} onChange={(e) => setParentPhone(e.target.value)}
                                    placeholder="10-digit phone" maxLength={10} className={`h-11 rounded-xl bg-background border-border ${fieldErrors.parent_phone ? 'border-red-500' : ''}`} required />
                                {fieldErrors.parent_phone && <p className="text-red-600 text-xs mt-1">{fieldErrors.parent_phone}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="editPhone" className="text-sm font-semibold text-foreground ml-1">Student Phone</Label>
                                <Input id="editPhone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                                    placeholder="10-digit phone" maxLength={10} className="h-11 rounded-xl bg-background border-border" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="editEmail" className="text-sm font-semibold text-foreground ml-1">Email Address</Label>
                                <Input id="editEmail" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                    placeholder="student@example.com" className="h-11 rounded-xl bg-background border-border" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="editDob" className="text-sm font-semibold text-foreground ml-1">Date of Birth</Label>
                                <Input id="editDob" type="date" value={dob} onChange={(e) => setDob(e.target.value)}
                                    className="h-11 rounded-xl bg-background border-border block w-full" />
                            </div>

                            <SelectField label="Gender" value={gender} options={GENDER_OPTIONS} onValueChange={setGender}
                                placeholder="Select Gender" />
                                
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="editAddress" className="text-sm font-semibold text-foreground ml-1">Residential Address</Label>
                                <Input id="editAddress" value={address} onChange={(e) => setAddress(e.target.value)}
                                    placeholder="Enter full address" className="h-11 rounded-xl bg-background border-border" />
                            </div>
                        </div>

                        <div className="flex justify-end pt-4 gap-4">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="h-12 px-6 rounded-xl">
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading} className="px-8 h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98]">
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPen className="mr-2 h-4 w-4" />}
                                {loading ? 'Saving…' : 'Save Changes'}
                            </Button>
                        </div>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
