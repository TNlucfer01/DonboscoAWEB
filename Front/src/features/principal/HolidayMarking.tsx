import { useState } from 'react';
import Layout from '../../app/components/Layout';
import { Button } from '../../app/components/ui/button';
import { Input } from '../../app/components/ui/input';
import { Label } from '../../app/components/ui/label';
import { Textarea } from '../../app/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../../app/components/ui/card';
import { Calendar } from '../../app/components/ui/calendar';
import { PageProps } from '../shared/types';
import { markHoliday, enableWorkingSaturday } from '../../api/holiday.api';
import { toast } from 'sonner';
import { format } from 'date-fns';

const today = new Date();
today.setHours(0, 0, 0, 0);

const MODIFIERS_STYLES = {
    holiday: { backgroundColor: '#fee2e2', color: '#991b1b', border: '2px solid #991b1b' },
    workingSaturday: { backgroundColor: '#dcfce7', color: '#166534', border: '2px solid #166534' },
    disabled: { backgroundColor: '#f1f5f9', color: '#94a3b8', cursor: 'not-allowed' },
};

export default function HolidayMarking({ user, onLogout }: PageProps) {
    const [date, setDate] = useState<Date | undefined>(undefined);
    const [holidayName, setHolidayName] = useState('');
    const [holidayDescription, setHolidayDescription] = useState('');
    const [holidays, setHolidays] = useState<Date[]>([new Date(2026, 2, 15)]);
    const [saturdays, setSaturdays] = useState<Date[]>([]);
    const [loading, setLoading] = useState(false);

    const isPast = !!date && date < today;
    const isFuture = !!date && date >= today;

    const handleMarkHoliday = async () => {
        if (!date) return toast.error('Please select a date');
        if (isPast) return toast.error('Cannot modify past dates');
        if (!holidayName) return toast.error('Please enter holiday name');
        setLoading(true);
        try {
            await markHoliday(format(date, 'yyyy-MM-dd'), holidayName, holidayDescription);
            setHolidays([...holidays, date]);
            toast.success(`Holiday "${holidayName}" marked for ${format(date, 'PPP')}`);
            setHolidayName(''); setHolidayDescription('');
        } catch { toast.error('Failed to mark holiday'); }
        finally { setLoading(false); }
    };

    const handleEnableSaturday = async () => {
        if (!date) return toast.error('Please select a date');
        if (isPast) return toast.error('Cannot modify past dates');
        if (date.getDay() !== 6) return toast.error('Selected date is not a Saturday');
        setLoading(true);
        try {
            await enableWorkingSaturday(format(date, 'yyyy-MM-dd'));
            setSaturdays([...saturdays, date]);
            toast.success(`Saturday ${format(date, 'PPP')} marked as working day`);
        } catch { toast.error('Failed to enable Saturday'); }
        finally { setLoading(false); }
    };

    return (
        <Layout user={user} onLogout={onLogout}>
            <div className="space-y-6">
                <h1 className="text-2xl text-slate-800">Holiday Marking</h1>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Calendar */}
                    <Card className="border-2 border-slate-300">
                        <CardHeader>
                            <CardTitle className="text-slate-800">College Calendar</CardTitle>
                            <div className="flex gap-4 text-sm mt-2">
                                {[
                                    { color: 'bg-white border-2 border-slate-300', label: 'Working Day' },
                                    { style: { backgroundColor: '#fee2e2', border: '2px solid #991b1b' }, label: 'Holiday' },
                                    { style: { backgroundColor: '#dcfce7', border: '2px solid #166534' }, label: 'Working Saturday' },
                                ].map(({ color, style, label }) => (
                                    <div key={label} className="flex items-center gap-2">
                                        <div className={`w-4 h-4 ${color ?? ''}`} style={style} />
                                        <span className="text-slate-600">{label}</span>
                                    </div>
                                ))}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Calendar
                                mode="single" selected={date} onSelect={setDate}
                                className="border border-slate-300"
                                modifiers={{ holiday: holidays, workingSaturday: saturdays, disabled: (d) => d < today }}
                                modifiersStyles={MODIFIERS_STYLES}
                            />
                            {date && (
                                <div className="mt-4 p-3 bg-slate-50 border border-slate-300">
                                    <p className="text-sm text-slate-700">Selected: <strong>{format(date, 'PPP')}</strong></p>
                                    {isPast && <p className="text-sm text-red-700 mt-1">Past dates cannot be modified</p>}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Forms */}
                    <div className="space-y-4">
                        <Card className="border-2 border-slate-300">
                            <CardHeader><CardTitle className="text-slate-800">Mark Holiday</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="holidayName" className="text-slate-700">Holiday Name *</Label>
                                    <Input id="holidayName" value={holidayName} onChange={(e) => setHolidayName(e.target.value)}
                                        placeholder="e.g., Republic Day" className="mt-1 border-slate-300" disabled={!isFuture} />
                                </div>
                                <div>
                                    <Label htmlFor="holidayDesc" className="text-slate-700">Description</Label>
                                    <Textarea id="holidayDesc" value={holidayDescription} onChange={(e) => setHolidayDescription(e.target.value)}
                                        placeholder="e.g., National Holiday" rows={3} className="mt-1 border-slate-300" disabled={!isFuture} />
                                </div>
                                <Button onClick={handleMarkHoliday} disabled={!isFuture || loading}
                                    className="w-full bg-red-700 hover:bg-red-800 text-white">
                                    Mark as Holiday
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="border-2 border-slate-300">
                            <CardHeader><CardTitle className="text-slate-800">Enable Working Saturday</CardTitle></CardHeader>
                            <CardContent>
                                <p className="text-sm text-slate-600 mb-4">Only Saturdays can be enabled as working days.</p>
                                <Button onClick={handleEnableSaturday}
                                    disabled={!isFuture || !date || date.getDay() !== 6 || loading}
                                    className="w-full bg-green-700 hover:bg-green-800 text-white">
                                    Enable Saturday as Working Day
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
