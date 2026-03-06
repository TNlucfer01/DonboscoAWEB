import Layout from '../../app/components/Layout';
import { Button } from '../../app/components/ui/button';
import { Input } from '../../app/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../app/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../app/components/ui/select';
import { PageProps } from '../shared/types';
import { DatePickerField } from '../shared/DatePickerField';
import { useODLeaveEntry } from '../../hooks/useODLeaveEntry';
import { ATTENDANCE_STATUS_OPTIONS } from '../shared/constants';
import { AttendancePeriodKey, PERIOD_KEYS } from '../shared/attendance.types';
import { useState } from 'react';
import { format } from 'date-fns';

export default function ODLeaveEntry({ user, onLogout }: PageProps) {
    const [date, setDate] = useState<Date | undefined>(new Date());
    const { students, loading, saving, updatePeriod, updateRemarks, save } = useODLeaveEntry(date);

    return (
        <Layout user={user} onLogout={onLogout}>
            <div className="space-y-6">
                <h1 className="text-2xl text-slate-800">OD / Informed Leave Entry</h1>

                <Card className="border-2 border-slate-300">
                    <CardHeader><CardTitle className="text-slate-800">Select Date</CardTitle></CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-4">
                            <DatePickerField date={date} onDateChange={setDate} label="Date:" />
                            {loading && <p className="text-slate-500 text-sm">Loading…</p>}
                        </div>
                    </CardContent>
                </Card>

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
                                    {students.map((s) => (
                                        <tr key={s.id} className="border border-slate-300 hover:bg-slate-50">
                                            <td className="border border-slate-300 px-3 py-2 text-slate-700">{s.sno}</td>
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
                        <div className="mt-6 flex justify-end">
                            <Button onClick={save} disabled={saving} className="bg-slate-700 hover:bg-slate-800 text-white">
                                {saving ? 'Saving…' : 'Save Entries'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
}
