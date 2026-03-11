import { useState } from 'react';
import Layout from '../../app/components/Layout';
import { Button } from '../../app/components/ui/button';
import { Input } from '../../app/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../app/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../app/components/ui/select';
import { PageProps } from '../shared/types';
import { SelectField } from '../shared/SelectField';
import { DatePickerField } from '../shared/DatePickerField';
import { YEAR_OPTIONS, LAB_BATCH_OPTIONS, PERIOD_OPTIONS } from '../shared/constants';
import { useAttendanceCorrection } from '../../hooks/useAttendanceCorrection';
import { format } from 'date-fns';

export default function AttendanceCorrection({ user, onLogout }: PageProps) {
    const [year, setYear] = useState('');
    const [batch, setBatch] = useState('');
    const [period, setPeriod] = useState('');
    const [date, setDate] = useState<Date | undefined>(undefined);
    const { students, loading, saving, error, fetch, updateStatus, updateODReason, save } = useAttendanceCorrection();
    const [showTable, setShowTable] = useState(false);

    const handleFetch = async () => {
        if (!year || !batch || !period || !date) return;
        await fetch(year, batch, period, date);
        setShowTable(true);
    };

    return (
        <Layout user={user} onLogout={onLogout}>
            <div className="space-y-6">
                <h1 className="text-2xl text-slate-800">Attendance Correction</h1>

                <Card className="border-2 border-slate-300">
                    <CardHeader><CardTitle className="text-slate-800">Select Criteria</CardTitle></CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                            <SelectField label="Year *" value={year} options={YEAR_OPTIONS} onValueChange={setYear} />
                            <SelectField label="Batch *" value={batch} options={LAB_BATCH_OPTIONS} onValueChange={setBatch} />
                            <SelectField label="Period *" value={period} options={PERIOD_OPTIONS} onValueChange={setPeriod} />
                            <div><DatePickerField date={date} onDateChange={setDate} label="Date *" /></div>
                            <div className="flex items-end">
                                <Button onClick={handleFetch} disabled={loading} className="w-full bg-slate-700 hover:bg-slate-800 text-white">
                                    {loading ? 'Fetching…' : 'Fetch Students'}
                                </Button>
                            </div>
                        </div>
                        {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
                    </CardContent>
                </Card>

                {showTable && students.length > 0 && (
                    <Card className="border-2 border-slate-300">
                        <CardHeader>
                            <CardTitle className="text-slate-800">
                                Attendance — {year && `Year ${year}`} — Batch {batch} — Period {period}
                                {date && ` — ${format(date, 'PP')}`}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="bg-slate-100 border-2 border-slate-300">
                                            {['S.No', 'Roll No', 'Name', 'Status', 'OD Reason'].map((h) => (
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
                                                            {['Present', 'Absent', 'OD', 'Informed Leave'].map((v) => (
                                                                <SelectItem key={v} value={v}>{v}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </td>
                                                <td className="border border-slate-300 px-4 py-3">
                                                    {s.status === 'OD' && (
                                                        <Input value={s.odReason} onChange={(e) => updateODReason(s.id, e.target.value)}
                                                            placeholder="Enter OD reason" className="border-slate-300" />
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="mt-6 flex justify-end">
                                <Button onClick={save} disabled={saving} className="bg-slate-700 hover:bg-slate-800 text-white">
                                    {saving ? 'Saving…' : 'Save Changes'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </Layout>
    );
}
