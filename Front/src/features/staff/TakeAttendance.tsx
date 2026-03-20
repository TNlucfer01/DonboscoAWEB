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
import { useStaffAttendance } from './hooks/useStaffAttendance';
import { fetchBatches, Batch } from '../../api/batch.api';
import { fetchSubjects, Subject } from '../../api/subject.api';
import { Clock, AlertTriangle } from 'lucide-react';
import { StudentDetailsDialog } from '../shared/StudentDetailsDialog';

const YEAR_RADIO = ['1', '2', '3', '4'];
const YEAR_LABELS: Record<string, string> = { '1': '1st Year', '2': '2nd Year', '3': '3rd Year', '4': '4th Year' };
    
export default function StaffTakeAttendance({ user, onLogout }: PageProps) {
    const [year, setYear] = useState('');
    const [classType, setClassType] = useState('');
    const [batch, setBatch] = useState('');
    const [period, setPeriod] = useState('');
    const [subject, setSubject] = useState('');
    const [batches, setBatches] = useState<Batch[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const { students, loading, submitting, fetched, remainingMinutes, fetch, updateStatus, markAllPresent, submit } = useStaffAttendance();

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
        if (!year || !classType || !batch || !period || !subject) return;
        fetch(year, batch, classType, period, subject);
    };

    return (
        <Layout user={user} onLogout={onLogout}>
            <div className="space-y-6">
                <h1 className="text-2xl text-foreground">Take Attendance</h1>

                <Card className="border-2 border-border">
                    <CardHeader><CardTitle className="text-foreground">Select Class Details</CardTitle></CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {/* Year — Radio (UX preference for this field) */}
                            <div>
                                <Label className="text-foreground opacity-90 mb-3 block">Step 1: Select Year *</Label>
                                {/* BUG-027: grid-cols-4 on all sizes — labels are short enough */}
                            <RadioGroup value={year} onValueChange={setYear} className="grid grid-cols-4 gap-4">
                                    {YEAR_RADIO.map((v) => (
                                        <div key={v} className="flex items-center space-x-2">
                                            <RadioGroupItem value={v} id={`year${v}`} className="border-border" />
                                            <Label htmlFor={`year${v}`} className="text-foreground opacity-90 cursor-pointer">{YEAR_LABELS[v]}</Label>
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
                            <div>
                                <Button onClick={handleFetch} disabled={loading}
                                    className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white">
                                    {loading ? 'Fetching…' : 'Fetch Students'}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* BUG-026: Empty state when fetch returns no students */}
                {fetched && students.length === 0 && (
                    <div className="text-center py-16 bg-muted/10 rounded-2xl border border-dashed border-border/50">
                        <p className="text-muted-foreground font-medium">No students found for the selected class and period.</p>
                        <p className="text-sm text-muted-foreground/70 mt-1">Please verify the batch and period selection above.</p>
                    </div>
                )}

                {fetched && students.length > 0 && (
                    <Card className="border-2 border-border">
                        <CardHeader>
                            <div className="flex items-center justify-between flex-wrap gap-4">
                                <CardTitle className="text-foreground">
                                    Mark Attendance — Year {year} — Batch {batch} — Period {period}
                                </CardTitle>
                                {/* Countdown Timer — BUG-010/011: themed colors, rounded-xl */}
                                <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-mono font-semibold ${
                                    timerExpired
                                        ? 'bg-destructive/10 border border-destructive/30 text-destructive'
                                        : secondsLeft < 300
                                            ? 'bg-accent/20 border border-accent/40 text-secondary'
                                            : 'bg-primary/10 border border-primary/30 text-primary'
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
                            <div className="overflow-x-auto rounded-lg border border-border bg-background">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-muted/30 border-b border-border">
                                            {['S.No', 'Roll No', 'Name', 'Status', 'Remarks'].map((h) => (
                                                <th key={h} className="px-6 py-4 text-left text-muted-foreground font-bold uppercase text-[10px] tracking-wider">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/30">
                                        {students.map((s, i) => (
                                            <tr key={s.id} className="hover:bg-muted/20 transition-colors group">
                                                <td className="px-6 py-4 text-muted-foreground font-medium text-xs">{i + 1}</td>
                                                <td className="px-6 py-4 font-mono font-bold text-foreground opacity-90">{s.rollNo}</td>
                                                <td className="px-6 py-4 text-foreground font-semibold whitespace-nowrap">
                                                    <StudentDetailsDialog studentId={s.id} studentName={s.name} />
                                                </td>
                                                 <td className="px-6 py-4">
                                                     <div className="flex items-center gap-2">
                                                         <Select value={s.status} onValueChange={(v) => updateStatus(s.id, v)} disabled={timerExpired || s.isLocked}>
                                                             <SelectTrigger><SelectValue /></SelectTrigger>
                                                             <SelectContent className="bg-popover border border-border">
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
                                                 <td className="px-6 py-4 text-muted-foreground whitespace-pre-wrap max-w-xs">{s.odReason || '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="mt-6 flex justify-end gap-4">
                                <Button variant="outline" onClick={markAllPresent} disabled={timerExpired} className="border-border text-foreground opacity-90">
                                    Mark All Present
                                </Button>
                                {/* //i have to make this dynamic in the future */}
                                <Button onClick={() => {
                                    const n = new Date();
                                    const localDate = `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}-${String(n.getDate()).padStart(2,'0')}`;
                                    submit(year, batch, period, subject, localDate);
                                }} disabled={submitting || timerExpired}
                                    className="bg-primary hover:bg-primary/90 text-primary-foreground hover:bg-primary/90 text-white">
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
