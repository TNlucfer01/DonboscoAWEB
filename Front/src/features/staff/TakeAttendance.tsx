import { useState } from 'react';
import Layout from '../../app/components/Layout';
import { Button } from '../../app/components/ui/button';
import { Label } from '../../app/components/ui/label';
import { RadioGroup, RadioGroupItem } from '../../app/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../app/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../../app/components/ui/card';
import { PageProps } from '../shared/types';
import { SelectField } from '../shared/SelectField';
import { BATCH_OPTIONS, PERIOD_OPTIONS, SUBJECT_OPTIONS } from '../shared/constants';
import { useStaffAttendance } from '../../hooks/useStaffAttendance';

const YEAR_RADIO = ['1', '2', '3', '4'];
const YEAR_LABELS: Record<string, string> = { '1': '1st Year', '2': '2nd Year', '3': '3rd Year', '4': '4th Year' };

export default function StaffTakeAttendance({ user, onLogout }: PageProps) {
    const [year, setYear] = useState('');
    const [batch, setBatch] = useState('');
    const [period, setPeriod] = useState('');
    const [subject, setSubject] = useState('');
    const { students, loading, submitting, fetched, fetch, updateStatus, markAllPresent, submit } = useStaffAttendance();

    const handleFetch = () => {
        if (!year || !batch || !period || !subject) return;
        fetch(year, batch, period, subject);
    };

    return (
        <Layout user={user} onLogout={onLogout}>
            <div className="space-y-6">
                <h1 className="text-2xl text-slate-800">Take Attendance</h1>

                <Card className="border-2 border-slate-300">
                    <CardHeader><CardTitle className="text-slate-800">Select Class Details</CardTitle></CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {/* Year — Radio (UX preference for this field) */}
                            <div>
                                <Label className="text-slate-700 mb-3 block">Step 1: Select Year *</Label>
                                <RadioGroup value={year} onValueChange={setYear} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    {YEAR_RADIO.map((v) => (
                                        <div key={v} className="flex items-center space-x-2">
                                            <RadioGroupItem value={v} id={`year${v}`} className="border-slate-300" />
                                            <Label htmlFor={`year${v}`} className="text-slate-700 cursor-pointer">{YEAR_LABELS[v]}</Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            </div>
                            <SelectField label="Step 2: Select Batch *" value={batch} options={BATCH_OPTIONS} onValueChange={setBatch} />
                            <SelectField label="Step 3: Select Period *" value={period} options={PERIOD_OPTIONS} onValueChange={setPeriod} />
                            <SelectField label="Step 4: Select Subject *" value={subject} options={SUBJECT_OPTIONS} onValueChange={setSubject} />
                            <div>
                                <Button onClick={handleFetch} disabled={loading}
                                    className="w-full sm:w-auto bg-slate-700 hover:bg-slate-800 text-white">
                                    {loading ? 'Fetching…' : 'Fetch Students'}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {fetched && students.length > 0 && (
                    <Card className="border-2 border-slate-300">
                        <CardHeader>
                            <CardTitle className="text-slate-800">
                                Mark Attendance — Year {year} — Batch {batch} — Period {period} — {subject}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="bg-slate-100 border-2 border-slate-300">
                                            {['S.No', 'Roll No', 'Name', 'Status'].map((h) => (
                                                <th key={h} className="border border-slate-300 px-4 py-3 text-left text-slate-700">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {students.map((s, i) => (
                                            <tr key={s.id} className="border border-slate-300 hover:bg-slate-50">
                                                <td className="border border-slate-300 px-4 py-3 text-slate-700">{i + 1}</td>
                                                <td className="border border-slate-300 px-4 py-3 text-slate-700">{s.rollNo}</td>
                                                <td className="border border-slate-300 px-4 py-3 text-slate-700">{s.name}</td>
                                                <td className="border border-slate-300 px-4 py-3">
                                                    <Select value={s.status} onValueChange={(v) => updateStatus(s.id, v)}>
                                                        <SelectTrigger className="border-slate-300"><SelectValue /></SelectTrigger>
                                                        <SelectContent className="bg-white border-2 border-slate-300">
                                                            <SelectItem value="Present">Present</SelectItem>
                                                            <SelectItem value="Absent">Absent</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="mt-6 flex justify-end gap-4">
                                <Button variant="outline" onClick={markAllPresent} className="border-slate-300 text-slate-700">
                                    Mark All Present
                                </Button>
                                <Button onClick={() => submit(year, batch, period, subject)} disabled={submitting}
                                    className="bg-slate-700 hover:bg-slate-800 text-white">
                                    {submitting ? 'Submitting…' : 'Submit Attendance'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </Layout>
    );
}
