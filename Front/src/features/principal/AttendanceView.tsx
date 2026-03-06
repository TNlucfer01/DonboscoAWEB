import { useState } from 'react';
import Layout from '../../app/components/Layout';
import { Button } from '../../app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../app/components/ui/card';
import { format } from 'date-fns';
import { PageProps } from '../shared/types';
import { SelectField } from '../shared/SelectField';
import { DatePickerField } from '../shared/DatePickerField';
import { AttendanceTable } from '../shared/AttendanceTable';
import { YEAR_OPTIONS } from '../shared/constants';
import { useAttendanceView } from '../../hooks/useAttendanceView';

export default function AttendanceView({ user, onLogout }: PageProps) {
    const [year, setYear] = useState('');
    const [date, setDate] = useState<Date | undefined>(new Date());
    const { students, loading, error, fetch } = useAttendanceView();
    const [showTable, setShowTable] = useState(false);

    const handleFetch = async () => {
        if (!year || !date) return;
        await fetch(year, date);
        setShowTable(true);
    };

    return (
        <Layout user={user} onLogout={onLogout}>
            <div className="space-y-6">
                <h1 className="text-2xl text-slate-800">Attendance View (College-wide)</h1>

                <Card className="border-2 border-slate-300">
                    <CardHeader><CardTitle className="text-slate-800">Filter Attendance</CardTitle></CardHeader>
                    <CardContent>
                        <div className="flex flex-col sm:flex-row gap-4 items-end">
                            <SelectField label="Year" value={year} options={YEAR_OPTIONS} onValueChange={setYear} className="flex-1" />
                            <DatePickerField date={date} onDateChange={setDate} label="Date" />
                            <Button onClick={handleFetch} disabled={loading} className="bg-slate-700 hover:bg-slate-800 text-white">
                                {loading ? 'Loading…' : 'View Attendance'}
                            </Button>
                        </div>
                        {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
                    </CardContent>
                </Card>

                {showTable && students.length > 0 && (
                    <Card className="border-2 border-slate-300">
                        <CardHeader>
                            <CardTitle className="text-slate-800">
                                Attendance — Year {year}{date ? ` — ${format(date, 'PPP')}` : ''}
                            </CardTitle>
                            <p className="text-sm text-slate-600 mt-2">P = Present, A = Absent, OD = On Duty, IL = Informed Leave</p>
                        </CardHeader>
                        <CardContent><AttendanceTable students={students} /></CardContent>
                    </Card>
                )}
            </div>
        </Layout>
    );
}
