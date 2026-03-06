import { useState } from 'react';
import Layout from '../../app/components/Layout';
import { Button } from '../../app/components/ui/button';
import { Input } from '../../app/components/ui/input';
import { Label } from '../../app/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../app/components/ui/card';
import { PageProps } from '../shared/types';
import { addStaffMember } from '../../api/staff.api';
import { toast } from 'sonner';

export default function AddStaff({ user, onLogout }: PageProps) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !email || !phone) return toast.error('Please fill in all fields');
        setLoading(true);
        try {
            await addStaffMember(name, email, phone);
            toast.success(`Staff member ${name} added! Default password sent to ${email}`);
            setName(''); setEmail(''); setPhone('');
        } catch { toast.error('Failed to add staff member'); }
        finally { setLoading(false); }
    };

    return (
        <Layout user={user} onLogout={onLogout}>
            <div className="max-w-2xl">
                <h1 className="text-2xl text-slate-800 mb-6">Add Staff</h1>
                <Card className="border-2 border-slate-300">
                    <CardHeader><CardTitle className="text-slate-800">Staff Information</CardTitle></CardHeader>
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
                            <div>
                                <Label className="text-slate-700">Role</Label>
                                <Input value="Subject Staff" disabled className="mt-1 border-slate-300 bg-slate-100" />
                            </div>
                            <div className="pt-4">
                                <Button type="submit" disabled={loading} className="w-full sm:w-auto bg-slate-700 hover:bg-slate-800 text-white">
                                    {loading ? 'Saving…' : 'Save Staff Member'}
                                </Button>
                            </div>
                            <p className="text-sm text-slate-600 bg-slate-50 border border-slate-300 p-3">
                                Note: A default password will be created and sent to the staff member's email address.
                            </p>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
}
