import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../app/components/ui/dialog';
import { Button } from '../../app/components/ui/button';
import { Input } from '../../app/components/ui/input';
import { Label } from '../../app/components/ui/label';
import { Textarea } from '../../app/components/ui/textarea';
import { SelectField } from './SelectField';
import { YEAR_OPTIONS, SEMESTER_OPTIONS } from './constants';
import { Subject, updateSubject } from '../../api/subject.api';
import { toast } from 'sonner';
import { Loader2, BookCheck } from 'lucide-react';

export function EditSubjectDialog({
    subject,
    open,
    onOpenChange,
    onSuccess
}: {
    subject: Subject | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}) {
    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [year, setYear] = useState('');
    const [semester, setSemester] = useState('');
    const [credits, setCredits] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (subject) {
            setName(subject.subject_name || '');
            setCode(subject.subject_code || '');
            setYear(subject.subject_year ? subject.subject_year.toString() : '');
            setSemester(subject.semester ? subject.semester.toUpperCase() : '');
            setCredits(subject.credits ? subject.credits.toString() : '');
            setDescription(subject.subject_description || '');
        }
    }, [subject]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!subject) return;
        if (!name || !code || !year || !semester || !credits) return toast.error('Please fill in all required fields');
        setLoading(true);
        try {
            await updateSubject(subject.subject_id, {
                subject_name: name,
                subject_code: code,
                subject_year: parseInt(year),
                semester: semester.toUpperCase(),
                credits: parseInt(credits),
                subject_description: description || undefined,
            });
            toast.success(`Subject ${name} (${code}) updated successfully!`);
            onSuccess();
            onOpenChange(false);
        } catch (err: any) {
            toast.error(err.message || 'Failed to update subject');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl bg-card border-border rounded-2xl shadow-2xl p-0 overflow-hidden focus:outline-none">
                <DialogHeader className="bg-primary/5 pb-6 p-6 border-b border-border">
                    <DialogTitle className="text-foreground flex items-center gap-2 text-2xl font-bold">
                        <BookCheck className="w-6 h-6 text-primary" />
                        Edit Subject Details
                    </DialogTitle>
                </DialogHeader>
                <div className="p-6 pt-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="editSubName" className="text-sm font-semibold text-foreground ml-1">Subject Name *</Label>
                                <Input id="editSubName" value={name} onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter full subject title" className="h-11 rounded-xl bg-background border-border" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="editSubCode" className="text-sm font-semibold text-foreground ml-1">Subject Code *</Label>
                                <Input id="editSubCode" value={code} onChange={(e) => setCode(e.target.value)}
                                    placeholder="e.g., AGRI-101" className="h-11 rounded-xl bg-background border-border" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <SelectField label="Year *" value={year} options={YEAR_OPTIONS} onValueChange={setYear} />
                                <SelectField label="Semester *" value={semester} options={SEMESTER_OPTIONS} onValueChange={setSemester} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="editCredits" className="text-sm font-semibold text-foreground ml-1">Credits *</Label>
                                <Input id="editCredits" type="number" min="1" max="6" value={credits}
                                    onChange={(e) => setCredits(e.target.value)} placeholder="Credit hours (1-6)" className="h-11 rounded-xl bg-background border-border" />
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <Label htmlFor="editSubDesc" className="text-sm font-semibold text-foreground ml-1">Description</Label>
                                <Textarea id="editSubDesc" value={description} onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Brief overview of the subject curriculum (optional)" rows={3} className="rounded-xl bg-background border-border resize-none" />
                            </div>
                        </div>

                        <div className="flex justify-end pt-4 gap-4">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="h-12 px-6 rounded-xl">
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading} className="px-8 h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98]">
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BookCheck className="mr-2 h-4 w-4" />}
                                {loading ? 'Saving…' : 'Save Changes'}
                            </Button>
                        </div>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
