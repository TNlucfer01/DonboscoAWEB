import { useState } from 'react';
import Layout from './Layout';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { toast } from 'sonner';

interface AddSubjectProps {
  user: { role: string; name: string };
  onLogout: () => void;
}

export default function AddSubject({ user, onLogout }: AddSubjectProps) {
  const [subjectName, setSubjectName] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
  const [year, setYear] = useState('');
  const [semester, setSemester] = useState('');
  const [credits, setCredits] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subjectName || !subjectCode || !year || !semester || !credits) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Mock save
    toast.success(`Subject ${subjectName} (${subjectCode}) added successfully!`);
    
    // Reset form
    setSubjectName('');
    setSubjectCode('');
    setYear('');
    setSemester('');
    setCredits('');
    setDescription('');
  };

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="max-w-2xl">
        <h1 className="text-2xl text-slate-800 mb-6">Add Subject</h1>

        <Card className="border-2 border-slate-300">
          <CardHeader>
            <CardTitle className="text-slate-800">Subject Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="subjectName" className="text-slate-700">Subject Name *</Label>
                <Input
                  id="subjectName"
                  type="text"
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  placeholder="Enter subject name"
                  className="mt-1 border-slate-300"
                />
              </div>

              <div>
                <Label htmlFor="subjectCode" className="text-slate-700">Subject Code *</Label>
                <Input
                  id="subjectCode"
                  type="text"
                  value={subjectCode}
                  onChange={(e) => setSubjectCode(e.target.value)}
                  placeholder="Enter subject code (e.g., CS101)"
                  className="mt-1 border-slate-300"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="year" className="text-slate-700">Year *</Label>
                  <Select value={year} onValueChange={setYear}>
                    <SelectTrigger className="mt-1 border-slate-300">
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-2 border-slate-300">
                      <SelectItem value="1">1st Year</SelectItem>
                      <SelectItem value="2">2nd Year</SelectItem>
                      <SelectItem value="3">3rd Year</SelectItem>
                      <SelectItem value="4">4th Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="semester" className="text-slate-700">Semester *</Label>
                  <Select value={semester} onValueChange={setSemester}>
                    <SelectTrigger className="mt-1 border-slate-300">
                      <SelectValue placeholder="Select semester" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-2 border-slate-300">
                      <SelectItem value="odd">Odd</SelectItem>
                      <SelectItem value="even">Even</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="credits" className="text-slate-700">Credits *</Label>
                <Input
                  id="credits"
                  type="number"
                  min="1"
                  max="6"
                  value={credits}
                  onChange={(e) => setCredits(e.target.value)}
                  placeholder="Enter credit hours"
                  className="mt-1 border-slate-300"
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-slate-700">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter subject description (optional)"
                  rows={4}
                  className="mt-1 border-slate-300"
                />
              </div>

              <div className="pt-4">
                <Button 
                  type="submit" 
                  className="w-full sm:w-auto bg-slate-700 hover:bg-slate-800 text-white"
                >
                  Save Subject
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
