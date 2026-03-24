import { useState } from 'react';
import Layout from '../../app/components/Layout';
import { Button } from '../../app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../app/components/ui/card';
import { format } from 'date-fns';
import { PageProps } from '../shared/types';
import { DatePickerField } from '../shared/DatePickerField';
import { AttendanceTable } from '../shared/AttendanceTable';
import { useAttendanceView } from '../principal/hooks/useAttendanceView';

export default function YCAttendanceView({ user, onLogout }: PageProps) {
    const [date, setDate] = useState<Date | undefined>(new Date());
    const { students, loading, error, fetch } = useAttendanceView();
    const [fetched, setFetched] = useState(false);

    const handleDateChange = async (d: Date | undefined) => {
        setDate(d);
        if (d) {
            // YC view fetches automatically on date change (no year filter needed)
            await fetch('', d);
            setFetched(true);
        }
    };

    return (
        <Layout user={user} onLogout={onLogout}>
            <div className="space-y-6">
                <h1 className="text-2xl text-foreground">Attendance View</h1>

                <Card className="border-2 border-border">
                    <CardHeader><CardTitle className="text-foreground">Select Date</CardTitle></CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-4">
                            <DatePickerField date={date} onDateChange={handleDateChange} label="Date:" />
                            {loading && <p className="text-muted-foreground text-sm">Loading…</p>}
                        </div>
                        {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
                    </CardContent>
                </Card>

                <Card className="border-2 border-border">
                    <CardHeader>
                        <CardTitle className="text-foreground">
                            Attendance — {date ? format(date, 'PPP') : 'Select a date'}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground font-medium mt-2">P = Present, A = Absent, OD = On Duty, IL = Informed Leave</p>
                    </CardHeader>
                    <CardContent>
                        {fetched && students.length > 0
                            ? <AttendanceTable students={students} />
                            : !loading && <p className="text-muted-foreground text-sm">Select a date to load attendance.</p>
                        }
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
}
