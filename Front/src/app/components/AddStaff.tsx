import { useState } from 'react';
import Layout from './Layout';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { toast } from 'sonner';

interface AddStaffProps {
  user: { role: string; name: string };
  onLogout: () => void;
}

export default function AddStaff({ user, onLogout }: AddStaffProps) {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [staffName, setStaffName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !phone || !staffName) {
      toast.error('Please fill in all fields');
      return;
    }

    // Mock save
    toast.success(`Staff member ${staffName} added successfully! Default password sent to ${email}`);
    
    // Reset form
    setEmail('');
    setPhone('');
    setStaffName('');
  };

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="max-w-2xl">
        <h1 className="text-2xl text-slate-800 mb-6">Add Staff</h1>

        <Card className="border-2 border-slate-300">
          <CardHeader>
            <CardTitle className="text-slate-800">Staff Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="staffName" className="text-slate-700">Staff Name *</Label>
                <Input
                  id="staffName"
                  type="text"
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                  placeholder="Enter staff name"
                  className="mt-1 border-slate-300"
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-slate-700">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="mt-1 border-slate-300"
                />
              </div>

              <div>
                <Label htmlFor="phone" className="text-slate-700">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter 10-digit phone number"
                  maxLength={10}
                  className="mt-1 border-slate-300"
                />
              </div>

              <div>
                <Label className="text-slate-700">Role</Label>
                <Input
                  type="text"
                  value="Subject Staff"
                  disabled
                  className="mt-1 border-slate-300 bg-slate-100"
                />
              </div>

              <div className="pt-4">
                <Button 
                  type="submit" 
                  className="w-full sm:w-auto bg-slate-700 hover:bg-slate-800 text-white"
                >
                  Save Staff Member
                </Button>
              </div>

              <div className="text-sm text-slate-600 bg-slate-50 border border-slate-300 p-3 mt-4">
                <p>Note: A default password will be created and sent to the staff member's email address.</p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
