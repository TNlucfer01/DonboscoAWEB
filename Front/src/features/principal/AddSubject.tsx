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
import { Pencil, Trash2, Loader2 } from 'lucide-react';

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
                description: description || undefined,
            });
            toast.success(`Subject ${name} (${code}) added successfully!`);
            setName(''); setCode(''); setYear(''); setSemester(''); setCredits(''); setDescription('');
            await loadSubjects();
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
            <div className="space-y-8">
                {/* ── Add Subject Form ──────────────────────────────── */}
                <div className="max-w-2xl">
                    <h1 className="text-2xl text-slate-800 mb-6">Subject Management</h1>
                    <Card className="border-2 border-slate-300">
                        <CardHeader><CardTitle className="text-slate-800">Add New Subject</CardTitle></CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <Label htmlFor="subjectName" className="text-slate-700">Subject Name *</Label>
                                    <Input id="subjectName" value={name} onChange={(e) => setName(e.target.value)}
                                        placeholder="Enter subject name" className="mt-1 border-slate-300" />
                                </div>
                                <div>
                                    <Label htmlFor="subjectCode" className="text-slate-700">Subject Code *</Label>
                                    <Input id="subjectCode" value={code} onChange={(e) => setCode(e.target.value)}
                                        placeholder="e.g., CS101" className="mt-1 border-slate-300" />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <SelectField label="Year *" value={year} options={YEAR_OPTIONS} onValueChange={setYear} />
                                    <SelectField label="Semester *" value={semester} options={SEMESTER_OPTIONS} onValueChange={setSemester} />
                                </div>
                                <div>
                                    <Label htmlFor="credits" className="text-slate-700">Credits *</Label>
                                    <Input id="credits" type="number" min="1" max="6" value={credits}
                                        onChange={(e) => setCredits(e.target.value)} placeholder="Enter credit hours" className="mt-1 border-slate-300" />
                                </div>
                                <div>
                                    <Label htmlFor="description" className="text-slate-700">Description</Label>
                                    <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Enter subject description (optional)" rows={3} className="mt-1 border-slate-300" />
                                </div>
                                <div className="pt-4">
                                    <Button type="submit" disabled={loading} className="w-full sm:w-auto bg-slate-700 hover:bg-slate-800 text-white">
                                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        {loading ? 'Saving…' : 'Save Subject'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                {/* ── Subject List Table ────────────────────────────── */}
                <div>
                    <h2 className="text-xl text-slate-800 mb-4">Subject List</h2>
                    <div className="border-2 border-slate-300 overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-slate-200 text-slate-800">
                                    <th className="text-left p-3 border border-slate-300 font-semibold">Subject Name</th>
                                    <th className="text-left p-3 border border-slate-300 font-semibold">Code</th>
                                    <th className="text-left p-3 border border-slate-300 font-semibold">Year</th>
                                    <th className="text-left p-3 border border-slate-300 font-semibold">Semester</th>
                                    <th className="text-left p-3 border border-slate-300 font-semibold">Credits</th>
                                    <th className="text-center p-3 border border-slate-300 font-semibold w-32">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {listLoading ? (
                                    <tr>
                                        <td colSpan={6} className="text-center p-6 text-slate-500">
                                            <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                                        </td>
                                    </tr>
                                ) : subjectList.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center p-6 text-slate-500">
                                            No subjects found. Add one using the form above.
                                        </td>
                                    </tr>
                                ) : (
                                    subjectList.map((s, i) => (
                                        <tr key={s.subject_id} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                                            <td className="p-3 border border-slate-300">{s.subject_name}</td>
                                            <td className="p-3 border border-slate-300">{s.subject_code}</td>
                                            <td className="p-3 border border-slate-300">{yearLabel(s.subject_year)}</td>
                                            <td className="p-3 border border-slate-300 capitalize">{s.semester.toLowerCase()}</td>
                                            <td className="p-3 border border-slate-300">{s.credits}</td>
                                            <td className="p-3 border border-slate-300 text-center">
                                                <div className="flex justify-center gap-2">
                                                    <button title="Edit" className="text-blue-600 hover:text-blue-800">
                                                        <Pencil className="h-4 w-4" />
                                                    </button>
                                                    <button title="Delete" className="text-red-600 hover:text-red-800"
                                                        onClick={() => handleDelete(s.subject_id, s.subject_name)}>
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
