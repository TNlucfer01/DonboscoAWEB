// ─── Principal: Subject CRUD ──────────────────────────────────────────────────
// Form on top, subject list table below (per UI Design § 5).

import { useState, useEffect } from 'react';
import Layout from '../../app/components/Layout';
import { Button } from '../../app/components/ui/button';
import { Input } from '../../app/components/ui/input';
import { Label } from '../../app/components/ui/label';
import { Textarea } from '../../app/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../../app/components/ui/card';
import { PageProps } from '../shared/types';
import { SelectField } from '../shared/SelectField';
import { YEAR_OPTIONS, SEMESTER_OPTIONS } from '../shared/constants';
import { Subject, fetchSubjects, addSubject, deleteSubject } from '../../api/subject.api';
import { toast } from 'sonner';
import { Pencil, Trash2, Loader2, BookPlus } from 'lucide-react';

export default function AddSubject({ user, onLogout }: PageProps) {
    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [year, setYear] = useState('');
    const [semester, setSemester] = useState('');
    const [credits, setCredits] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    // ── Subject List ──────────────────────────────────────────────
    const [subjectList, setSubjectList] = useState<Subject[]>([]);
    const [listLoading, setListLoading] = useState(true);

    const loadSubjects = async () => {
        setListLoading(true);
        try {
            const data = await fetchSubjects();
            setSubjectList(data);
        } catch {
            toast.error('Failed to load subject list');
        } finally {
            setListLoading(false);
        }
    };

    useEffect(() => { loadSubjects(); }, []);

    // ── Add Subject ───────────────────────────────────────────────
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !code || !year || !semester || !credits) return toast.error('Please fill in all required fields');
        setLoading(true);
        try {
            await addSubject({
                subject_name: name,
                subject_code: code,
                subject_year: parseInt(year),
                semester: semester.toUpperCase(),
                credits: parseInt(credits),
                //description: description || undefined,
            });
            toast.success(`Subject ${name} (${code}) added successfully!`);
            setName(''); setCode(''); setYear(''); setSemester(''); setCredits(''); setDescription('');
            await loadSubjects();1
        } catch (err: any) {
            toast.error(err.message || 'Failed to add subject');
        } finally {
            setLoading(false);
        }
    };

    // ── Delete Subject ────────────────────────────────────────────
    const handleDelete = async (id: number, subjectName: string) => {
        if (!confirm(`Are you sure you want to delete "${subjectName}"?`)) return;
        try {
            await deleteSubject(id);
            toast.success(`${subjectName} deleted`);
            await loadSubjects();
        } catch (err: any) {
            toast.error(err.message || 'Failed to delete subject');
        }
    };

    const yearLabel = (y: number) => `${y}${y === 1 ? 'st' : y === 2 ? 'nd' : y === 3 ? 'rd' : 'th'} Year`;

    return (
        <Layout user={user} onLogout={onLogout}>
            <div className="space-y-10">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-bold text-foreground">Curriculum Management</h1>
                    <p className="text-muted-foreground">Define and organize academic subjects for each year</p>
                </div>

                {/* ── Add Subject Form ──────────────────────────────── */}
                <div className="max-w-4xl">
                    <Card className="border-none shadow-xl shadow-black/5 bg-card overflow-hidden">
                        <CardHeader className="bg-primary/5 pb-6">
                            <CardTitle className="text-foreground flex items-center gap-2">
                                <BookPlus className="w-5 h-5 text-primary" />
                                Register New Subject
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-8">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="subjectName" className="text-sm font-semibold text-foreground ml-1">Subject Name *</Label>
                                        <Input id="subjectName" value={name} onChange={(e) => setName(e.target.value)}
                                            placeholder="Enter full subject title" className="h-11 rounded-xl bg-background border-border" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="subjectCode" className="text-sm font-semibold text-foreground ml-1">Subject Code *</Label>
                                        <Input id="subjectCode" value={code} onChange={(e) => setCode(e.target.value)}
                                            placeholder="e.g., AGRI-101" className="h-11 rounded-xl bg-background border-border" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <SelectField label="Year *" value={year} options={YEAR_OPTIONS} onValueChange={setYear} />
                                        <SelectField label="Semester *" value={semester} options={SEMESTER_OPTIONS} onValueChange={setSemester} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="credits" className="text-sm font-semibold text-foreground ml-1">Credits *</Label>
                                        <Input id="credits" type="number" min="1" max="6" value={credits}
                                            onChange={(e) => setCredits(e.target.value)} placeholder="Credit hours (1-6)" className="h-11 rounded-xl bg-background border-border" />
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <Label htmlFor="description" className="text-sm font-semibold text-foreground ml-1">Description</Label>
                                        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)}
                                            placeholder="Brief overview of the subject curriculum (optional)" rows={3} className="rounded-xl bg-background border-border resize-none" />
                                    </div>
                                </div>
                                <div className="flex justify-end pt-4">
                                    <Button type="submit" disabled={loading} className="px-10 h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98]">
                                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BookPlus className="mr-2 h-4 w-4" />}
                                        {loading ? 'Processing…' : 'Finalize & Save Subject'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                {/* ── Subject List Table ────────────────────────────── */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-xl font-bold text-foreground">Catalogue of Subjects</h2>
                        <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">{subjectList.length} Registered Subjects</span>
                    </div>

                    <div className="rounded-2xl border border-border/50 bg-card shadow-xl shadow-black/5 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-muted/30 border-b border-border">
                                        <th className="text-left p-4 text-muted-foreground font-bold uppercase text-[10px] tracking-wider">Subject Details</th>
                                        <th className="text-left p-4 text-muted-foreground font-bold uppercase text-[10px] tracking-wider">Timeline</th>
                                        <th className="text-left p-4 text-muted-foreground font-bold uppercase text-[10px] tracking-wider">Credits</th>
                                        <th className="text-center p-4 text-muted-foreground font-bold uppercase text-[10px] tracking-wider w-32">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/30">
                                    {listLoading ? (
                                        <tr>
                                            <td colSpan={4} className="p-12 text-center text-muted-foreground font-medium italic">
                                                <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary opacity-50 mb-2" />
                                                Retrieving curriculum data...
                                            </td>
                                        </tr>
                                    ) : subjectList.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="p-12 text-center text-muted-foreground italic bg-muted/5 font-medium">
                                                No subjects have been registered in the curriculum yet.
                                            </td>
                                        </tr>
                                    ) : (
                                        subjectList.map((s) => (
                                            <tr key={s.subject_id} className="hover:bg-muted/20 transition-colors group">
                                                <td className="p-4">
                                                    <div className="font-bold text-foreground group-hover:text-primary transition-colors">{s.subject_name}</div>
                                                    <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-wide mt-1 inline-block px-1.5 py-0.5 bg-muted/50 rounded">{s.subject_code}</div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="text-foreground font-semibold text-xs">{yearLabel(s.subject_year)}</div>
                                                    <div className="text-[10px] text-secondary font-bold uppercase mt-0.5">{s.semester.toLowerCase()} Semester</div>
                                                </td>
                                                <td className="p-4">
                                                    <span className="text-xs font-black text-foreground">{s.credits}</span>
                                                    <span className="text-[10px] text-muted-foreground font-medium ml-1">Credits</span>
                                                </td>
                                                <td className="p-4 text-center text-foreground font-medium">
                                                    <div className="flex justify-center gap-1">
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-primary hover:bg-primary/10 transition-colors">
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon" 
                                                            className="h-8 w-8 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
                                                            onClick={() => handleDelete(s.subject_id, s.subject_name)}
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
		</Layout>
    );
}
