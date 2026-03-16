import { useState, useEffect } from 'react';
import Layout from '../../app/components/Layout';
import { Button } from '../../app/components/ui/button';
import { Label } from '../../app/components/ui/label';
import { RadioGroup, RadioGroupItem } from '../../app/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../app/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../../app/components/ui/card';
import { PageProps } from '../shared/types';
import { SelectField } from '../shared/SelectField';
import { PERIOD_OPTIONS } from '../shared/constants';
import { useStaffAttendanceCorrection } from './hooks/useStaffAttendanceCorrection';
import { DatePickerField } from '../shared/DatePickerField';
import { fetchBatches, Batch } from '../../api/batch.api';
import { fetchSubjects, Subject } from '../../api/subject.api';
import { Clock, AlertTriangle } from 'lucide-react';

const YEAR_RADIO = ['1', '2', '3', '4'];
const YEAR_LABELS: Record<string, string> = { '1': '1st Year', '2': '2nd Year', '3': '3rd Year', '4': '4th Year' };

export default function StaffAttendanceCorrection({ user, onLogout }: PageProps) {
    const [year, setYear] = useState('');
    const [classType, setClassType] = useState('');
    const [batch, setBatch] = useState('');
    const [period, setPeriod] = useState('');
    const [subject, setSubject] = useState('');
    const [date, setDate] = useState<Date | undefined>(undefined);
    const [batches, setBatches] = useState<Batch[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const { students, metadata, loading, submitting, fetched, remainingMinutes, fetch, updateStatus, markAllPresent, submit } = useStaffAttendanceCorrection();
    // ── Countdown Timer ───────────────────────────────────────────
    const [secondsLeft, setSecondsLeft] = useState(0);
    const timerExpired = fetched && secondsLeft <= 0;

    useEffect(() => {
        if (fetched && remainingMinutes > 0) {
            setSecondsLeft(remainingMinutes * 60);
        }
    }, [fetched, remainingMinutes]);
    useEffect(() => {
        if (secondsLeft <= 0) return;
        const timer = setTimeout(() => {
            setSecondsLeft(prev => prev - 1);
        }, 1000);
        return () => clearTimeout(timer);
    }, [secondsLeft]);

    const timerMins = Math.floor(secondsLeft / 60);
    const timerSecs = secondsLeft % 60;
    const timerDisplay = `${String(timerMins).padStart(2, '0')}:${String(timerSecs).padStart(2, '0')}`;

    // ── Load batches when year + classType change ─────────────────
    useEffect(() => {
        if (year && classType) {
            fetchBatches(Number(year)).then(res => {
                setBatches(res.filter(b => b.batch_type === classType));
                setBatch('');
            }).catch(() => setBatches([]));
        } else {
            setBatches([]);
        }
    }, [year, classType]);

    // ── Load subjects from backend when year changes ──────────────
    useEffect(() => {
        if (year) {
            fetchSubjects(year).then(res => {
                setSubjects(res);
                setSubject('');
            }).catch(() => setSubjects([]));
        } else {
            setSubjects([]);
        }
    }, [year]);

    const handleFetch = () => {
        if (!year || !classType || !batch || !period || !subject || !date) return;
        const yearVal = date.getFullYear();
        const monthVal = String(date.getMonth() + 1).padStart(2, '0');
        const dayVal = String(date.getDate()).padStart(2, '0');
        const dateStr = `${yearVal}-${monthVal}-${dayVal}`;

        fetch(year, batch, classType, period, subject, dateStr);
    };

    return (
        <Layout user={user} onLogout={onLogout}>
            <div className="space-y-6">
                <h1 className="text-2xl text-slate-800">Attendance Correction</h1>

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
                            <SelectField label="Step 2: Select Class Type *" value={classType} options={[{ value: 'THEORY', label: 'Theory' }, { value: 'LAB', label: 'Lab' }]} onValueChange={setClassType} />
                            <SelectField label="Step 3: Select Batch *" value={batch} options={batches.map(b => ({ value: String(b.batch_id), label: b.name }))} onValueChange={setBatch} disabled={!year || !classType} />
                            <SelectField label="Step 4: Select Period *" value={period} options={PERIOD_OPTIONS} onValueChange={setPeriod} />
                            <SelectField
                                label="Step 5: Select Subject *"
                                value={subject}
                                options={subjects.map(s => ({ value: String(s.subject_id), label: `${s.subject_name} (${s.subject_code})` }))}
                                onValueChange={setSubject}
                                disabled={!year || subjects.length === 0}
                            />
                            <div><DatePickerField date={date} onDateChange={setDate} label="Step 6: Select Date *" maxDate={new Date()} /></div>
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
                            <div className="flex items-center justify-between flex-wrap gap-4">
                                <CardTitle className="text-slate-800">
                                    Mark Attendance — Year {year} — Batch {batch} — Period {period}
                                </CardTitle>
                                {/* Countdown Timer */}
                                <div className={`flex items-center gap-2 px-3 py-2 rounded text-sm font-mono font-semibold ${timerExpired
                                        ? 'bg-red-100 border border-red-300 text-red-800'
                                        : secondsLeft < 300
                                            ? 'bg-amber-100 border border-amber-300 text-amber-800'
                                            : 'bg-green-100 border border-green-300 text-green-800'
                                    }`}>
                                    {timerExpired ? (
                                        <><AlertTriangle className="h-4 w-4" /> Submission window closed</>
                                    ) : (
                                        <><Clock className="h-4 w-4" /> {timerDisplay} remaining</>
                                    )}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {metadata && (
                                <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-6 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                                    <div>
                                        <p className="text-sm font-medium text-slate-500">Subject Name</p>
                                        <p className="mt-1 text-slate-800 font-semibold">{metadata.subjectName} ({metadata.subjectCode})</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-500">Year</p>
                                        <p className="mt-1 text-slate-800 font-semibold">{metadata.year}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-500">Batch Name</p>
                                        <p className="mt-1 text-slate-800 font-semibold">{metadata.batchName}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-500">Submitted By</p>
                                        <p className="mt-1 text-slate-800 font-semibold">{metadata.submitterName}</p>
                                    </div>
                                </div>
                            )}
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="bg-slate-100 border-2 border-slate-300">
                                            {['S.No', 'Roll No', 'Name', 'Status', 'Remarks'].map((h) => (
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
                                                     <div className="flex items-center gap-2">
                                                         <Select value={s.status} onValueChange={(v) => updateStatus(s.id, v)} disabled={timerExpired || s.isLocked}>
                                                             <SelectTrigger className="border-slate-300"><SelectValue /></SelectTrigger>
                                                             <SelectContent className="bg-white border-2 border-slate-300">
                                                                 <SelectItem value="PRESENT">Present</SelectItem>
                                                                 <SelectItem value="ABSENT">Absent</SelectItem>
                                                                 {s.isLocked && s.status !== 'PRESENT' && s.status !== 'ABSENT' && (
                                                                     <SelectItem value={s.status}>{s.status}</SelectItem>
                                                                 )}
                                                             </SelectContent>
                                                         </Select>
                                                         {s.isLocked && (
                                                             <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded border border-amber-300 whitespace-nowrap">
                                                                 Locked
                                                             </span>
                                                         )}
                                                     </div>
                                                 </td>
                                                 <td className="border border-slate-300 px-4 py-3 text-slate-700 whitespace-pre-wrap max-w-xs">{s.odReason || '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="mt-6 flex justify-end gap-4">
                                <Button variant="outline" onClick={markAllPresent} disabled={timerExpired} className="border-slate-300 text-slate-700">
                                    Mark All Present
                                </Button>
                                {/* //i have to make this dynamic in the future */}
                                <Button onClick={() => submit(year, batch, period, subject, date ? date.toISOString().split('T')[0] : "")} disabled={submitting || timerExpired || !date}
                                    className="bg-slate-700 hover:bg-slate-800 text-white">
                                    {timerExpired ? 'Window Closed' : submitting ? 'Submitting…' : 'Submit Attendance'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </Layout>
    );
}
