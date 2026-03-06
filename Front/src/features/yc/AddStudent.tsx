import { useState } from 'react';
import Layout from '../../app/components/Layout';
import { Button } from '../../app/components/ui/button';
import { Input } from '../../app/components/ui/input';
import { Label } from '../../app/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../app/components/ui/card';
import { PageProps } from '../shared/types';
import { SelectField } from '../shared/SelectField';
import { BATCH_OPTIONS } from '../shared/constants';
import { addStudent } from '../../api/student.api';
import { toast } from 'sonner';

export default function AddStudent({ user, onLogout }: PageProps) {
    const [name, setName] = useState('');
    const [rollNumber, setRollNumber] = useState('');
    const [parentPhone, setParentPhone] = useState('');
    const [batch, setBatch] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !rollNumber || !parentPhone || !batch) return toast.error('Please fill in all fields');
        setLoading(true);
        try {
            await addStudent(name, rollNumber, parentPhone, batch);
            toast.success(`Student ${name} (${rollNumber}) added to Batch ${batch} successfully!`);
            setName(''); setRollNumber(''); setParentPhone(''); setBatch('');
        } catch { toast.error('Failed to add student'); }
        finally { setLoading(false); }
    };

    return (
        <Layout user={user} onLogout={onLogout}>
            <div className="max-w-2xl">
                <h1 className="text-2xl text-slate-800 mb-6">Add Student</h1>
                <Card className="border-2 border-slate-300">
                    <CardHeader><CardTitle className="text-slate-800">Student Information</CardTitle></CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="studentName" className="text-slate-700">Student Name *</Label>
                                <Input id="studentName" value={name} onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter student name" className="mt-1 border-slate-300" />
                            </div>
                            <div>
                                <Label htmlFor="rollNumber" className="text-slate-700">Roll Number *</Label>
                                <Input id="rollNumber" value={rollNumber} onChange={(e) => setRollNumber(e.target.value)}
                                    placeholder="Enter roll number" className="mt-1 border-slate-300" />
                            </div>
                            <div>
                                <Label htmlFor="parentPhone" className="text-slate-700">Parent Phone *</Label>
                                <Input id="parentPhone" type="tel" value={parentPhone} onChange={(e) => setParentPhone(e.target.value)}
                                    placeholder="Enter 10-digit parent phone number" maxLength={10} className="mt-1 border-slate-300" />
                            </div>
                            <SelectField label="Batch Number *" value={batch} options={BATCH_OPTIONS} onValueChange={setBatch}
                                placeholder="Assign student to a batch" />
                            <div className="pt-4">
                                <Button type="submit" disabled={loading} className="w-full sm:w-auto bg-slate-700 hover:bg-slate-800 text-white">
                                    {loading ? 'Adding…' : 'Add Student'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
}
