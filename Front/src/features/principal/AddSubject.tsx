import { useState } from 'react';
import Layout from '../../app/components/Layout';
import { Button } from '../../app/components/ui/button';
import { Input } from '../../app/components/ui/input';
import { Label } from '../../app/components/ui/label';
import { Textarea } from '../../app/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../../app/components/ui/card';
import { PageProps } from '../shared/types';
import { SelectField } from '../shared/SelectField';
import { YEAR_OPTIONS, SEMESTER_OPTIONS } from '../shared/constants';
import { toast } from 'sonner';
import { apiClient } from '../../api/apiClient';

const USE_MOCK = true;

export default function AddSubject({ user, onLogout }: PageProps) {
    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [year, setYear] = useState('');
    const [semester, setSemester] = useState('');
    const [credits, setCredits] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !code || !year || !semester || !credits) return toast.error('Please fill in all required fields');
        setLoading(true);
        try {
            if (!USE_MOCK) await apiClient.post('/subjects', { name, code, year, semester, credits, description });
            toast.success(`Subject ${name} (${code}) added successfully!`);
            setName(''); setCode(''); setYear(''); setSemester(''); setCredits(''); setDescription('');
        } catch { toast.error('Failed to add subject'); }
        finally { setLoading(false); }
    };

    return (
        <Layout user={user} onLogout={onLogout}>
            <div className="max-w-2xl">
                <h1 className="text-2xl text-slate-800 mb-6">Add Subject</h1>
                <Card className="border-2 border-slate-300">
                    <CardHeader><CardTitle className="text-slate-800">Subject Information</CardTitle></CardHeader>
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
                                    placeholder="Enter subject description (optional)" rows={4} className="mt-1 border-slate-300" />
                            </div>
                            <div className="pt-4">
                                <Button type="submit" disabled={loading} className="w-full sm:w-auto bg-slate-700 hover:bg-slate-800 text-white">
                                    {loading ? 'Saving…' : 'Save Subject'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
}
