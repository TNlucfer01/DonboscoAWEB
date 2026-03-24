import { useState } from 'react';
import Layout from './Layout';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { toast } from 'sonner';

interface AddStudentProps {
  user: { role: string; name: string };
  onLogout: () => void;
}

export default function AddStudent({ user, onLogout }: AddStudentProps) {
  const [studentName, setStudentName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [batch, setBatch] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!studentName || !rollNumber || !parentPhone || !batch) {
      toast.error('Please fill in all fields');
      return;
    }

    // Mock save
    toast.success(`Student ${studentName} (${rollNumber}) added to Batch ${batch} successfully!`);
    
    // Reset form
    setStudentName('');
    setRollNumber('');
    setParentPhone('');
    setBatch('');
  };

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="max-w-2xl">
        <h1 className="text-2xl text-slate-800 mb-6">Add Student</h1>

        <Card className="border-2 border-slate-300">
          <CardHeader>
            <CardTitle className="text-slate-800">Student Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="studentName" className="text-slate-700">Student Name *</Label>
                <Input
                  id="studentName"
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="Enter student name"
                  className="mt-1 border-slate-300"
                />
              </div>

              <div>
                <Label htmlFor="rollNumber" className="text-slate-700">Roll Number *</Label>
                <Input
                  id="rollNumber"
                  type="text"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  placeholder="Enter roll number"
                  className="mt-1 border-slate-300"
                />
              </div>

              <div>
                <Label htmlFor="parentPhone" className="text-slate-700">Parent Phone *</Label>
                <Input
                  id="parentPhone"
                  type="tel"
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                  placeholder="Enter 10-digit parent phone number"
                  maxLength={10}
                  className="mt-1 border-slate-300"
                />
              </div>

              <div>
                <Label htmlFor="batch" className="text-slate-700">Batch Number *</Label>
                <Select value={batch} onValueChange={setBatch}>
                  <SelectTrigger className="mt-1 border-slate-300">
                    <SelectValue placeholder="Assign student to a batch" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#f7f3ea] border-2 border-slate-300">
                    <SelectItem value="A">Batch A</SelectItem>
                    <SelectItem value="B">Batch B</SelectItem>
                    <SelectItem value="C">Batch C</SelectItem>
                    <SelectItem value="D">Batch D</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4">
                <Button 
                  type="submit" 
                  className="w-full sm:w-auto bg-slate-700 hover:bg-slate-800 text-white"
                >
                  Add Student
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
