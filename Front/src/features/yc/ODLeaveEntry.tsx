import Layout from '../../app/components/Layout';
import { Button } from '../../app/components/ui/button';
import { Input } from '../../app/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../app/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../app/components/ui/select';
import { PageProps } from '../shared/types';
import { DatePickerField } from '../shared/DatePickerField';
import { SelectField } from '../shared/SelectField';
import { useODLeaveEntry } from './hooks/useODLeaveEntry';
import { YEAR_OPTIONS, ATTENDANCE_STATUS_OPTIONS } from '../shared/constants';
import { AttendancePeriodKey, PERIOD_KEYS } from '../shared/attendance.types';
import { useState } from 'react';
import { format } from 'date-fns';
import { getStudents } from '../../api/student.api';
import { toast } from 'sonner';

export default function ODLeaveEntry({ user, onLogout }: PageProps) {
    const [year, setYear] = useState('');
    const [date, setDate] = useState<Date | undefined>(new Date());
    const { students, loading, saving, addStudent, updatePeriod, updateRemarks, save, load } = useODLeaveEntry(year);

    // ── Add Student Search ──────────────────────────────────────
    const [searchRoll, setSearchRoll] = useState('');
    const [searchLoading, setSearchLoading] = useState(false);

    const handleAddStudent = async () => {
        if (!searchRoll.trim() || !year) {
            toast.error('Please select a year and enter a roll number');
            return;
        }
        setSearchLoading(true);
        try {
            const allStudents = await getStudents(Number(year));
            const found = allStudents.find(
                (s: any) => s.roll_number.toLowerCase() === searchRoll.trim().toLowerCase()
            );
            if (!found) {
                toast.error(`Student with roll number "${searchRoll}" not found in Year ${year}`);
                return;
            }
            // Check if already in the table
            if (students.some(s => s.rollNo === found.roll_number)) {
                toast.info('Student is already in the list');
                return;
            }
            addStudent({
                id: found.student_id,
                sno: students.length + 1,
                rollNo: found.roll_number,
                name: found.name,
                batch: found.theoryBatch?.name || '-',
                period1: '-', period2: '-', period3: '-', period4: '-', period5: '-',
                status: 'OD',
                remarks: '',
                attendancePercentage: 0,
                slot_id: 1,
                date: date ? format(date, 'yyyy-MM-dd') : new Date().toISOString().split('T')[0],
            });
            setSearchRoll('');
            toast.success(`Added ${found.name} to the list`);
        } catch {
            toast.error('Failed to search for student');
        } finally {
            setSearchLoading(false);
        }
    };

    const handleFetch = () => {
        if (year) load(year);
    };

    return (
        <Layout user={user} onLogout={onLogout}>
            <div className="space-y-6">
                <h1 className="text-2xl text-slate-800">OD / Informed Leave Entry</h1>

                <Card className="border-2 border-slate-300">
                    <CardHeader><CardTitle className="text-slate-800">Filters</CardTitle></CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                            <SelectField label="Year *" value={year} options={YEAR_OPTIONS} onValueChange={(v) => { setYear(v); }} />
                            <DatePickerField date={date} onDateChange={setDate} label="Date" />
                            <Button onClick={handleFetch} disabled={loading || !year} className="bg-slate-700 hover:bg-slate-800 text-white">
                                {loading ? 'Loading…' : 'Load Existing Entries'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* ── Add Student ──────────────────────────── */}
                {year && (
                    <Card className="border-2 border-slate-300">
                        <CardHeader><CardTitle className="text-slate-800">Add Student for OD/IL</CardTitle></CardHeader>
                        <CardContent>
                            <div className="flex gap-4 items-end">
                                <div className="flex-1">
                                    <label className="text-sm text-slate-700 mb-1 block">Student Roll Number</label>
                                    <Input
                                        value={searchRoll}
                                        onChange={(e) => setSearchRoll(e.target.value)}
                                        placeholder="e.g. 23AG001"
                                        className="border-slate-300"
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddStudent()}
                                    />
                                </div>
                                <Button onClick={handleAddStudent} disabled={searchLoading || !searchRoll.trim()}
                                    className="bg-slate-700 hover:bg-slate-800 text-white">
                                    {searchLoading ? 'Searching…' : 'Add Student'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* ── Table ──────────────────────────────────── */}
                <Card className="border-2 border-slate-300">
                    <CardHeader>
                        <CardTitle className="text-slate-800">
                            Attendance — {date ? format(date, 'PPP') : 'Select Date'}
                        </CardTitle>
                        <p className="text-sm text-slate-600 mt-2">P = Present, A = Absent, OD = On Duty, IL = Informed Leave</p>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-sm">
                                <thead>
                                    <tr className="bg-slate-100 border-2 border-slate-300">
                                        {['S.No', 'Roll No', 'Name', 'Batch', 'P1', 'P2', 'P3', 'P4', 'P5', 'Remarks', 'Att %'].map((h) => (
                                            <th key={h} className="border border-slate-300 px-3 py-2 text-left text-slate-700">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.length === 0 ? (
                                        <tr>
                                            <td colSpan={11} className="text-center py-8 text-slate-400">
                                                {year ? 'No entries yet. Use "Add Student" above to create OD/IL entries.' : 'Select a year to get started.'}
                                            </td>
                                        </tr>
                                    ) : students.map((s, i) => (
                                        <tr key={s.id} className="border border-slate-300 hover:bg-slate-50">
                                            <td className="border border-slate-300 px-3 py-2 text-slate-700">{i + 1}</td>
                                            <td className="border border-slate-300 px-3 py-2 text-slate-700">{s.rollNo}</td>
                                            <td className="border border-slate-300 px-3 py-2 text-slate-700">{s.name}</td>
                                            <td className="border border-slate-300 px-3 py-2 text-slate-700">{s.batch}</td>
                                            {PERIOD_KEYS.map((pk: AttendancePeriodKey) => (
                                                <td key={pk} className="border border-slate-300 px-2 py-2">
                                                    <Select value={s[pk]} onValueChange={(v) => updatePeriod(s.id, pk, v)}>
                                                        <SelectTrigger className="h-8 border-slate-300 text-xs"><SelectValue /></SelectTrigger>
                                                        <SelectContent className="bg-white border-2 border-slate-300">
                                                            {ATTENDANCE_STATUS_OPTIONS.map((o) => (
                                                                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </td>
                                            ))}
                                            <td className="border border-slate-300 px-2 py-2">
                                                <Input value={s.remarks} onChange={(e) => updateRemarks(s.id, e.target.value)}
                                                    placeholder="Add remarks" className="h-8 border-slate-300 text-xs" />
                                            </td>
                                            <td className="border border-slate-300 px-3 py-2 text-center text-slate-700">
                                                {s.attendancePercentage}%
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {students.length > 0 && (
                            <div className="mt-6 flex justify-end">
                                <Button onClick={save} disabled={saving} className="bg-slate-700 hover:bg-slate-800 text-white">
                                    {saving ? 'Saving…' : 'Save Entries'}
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
}
