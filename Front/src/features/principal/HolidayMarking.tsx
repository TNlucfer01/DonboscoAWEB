// ─── Principal: Holiday CRUD ──────────────────────────────────────────────────
// Calendar view with colour-coded days (per UI Design § 6).

import { useState, useEffect } from 'react';
import Layout from '../../app/components/Layout';
import { Button } from '../../app/components/ui/button';
import { Input } from '../../app/components/ui/input';
import { Label } from '../../app/components/ui/label';
import { Textarea } from '../../app/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../../app/components/ui/card';
import { Calendar } from '../../app/components/ui/calendar';
import { PageProps } from '../shared/types';
import {
    CalendarEntry, fetchCalendarEntries, markHoliday,
    enableWorkingSaturday, deleteCalendarEntry,
} from '../../api/holiday.api';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';
import { Loader2, Trash2 } from 'lucide-react';
import { usePageCache } from '../../app/PageCache';

const HOLIDAY_CACHE_KEY = 'holiday-entries';

const today = new Date();
today.setHours(0, 0, 0, 0);

const MODIFIERS_STYLES = {
    holiday: { backgroundColor: '#fee2e2', color: '#991b1b', border: '2px solid #991b1b' },
    workingSaturday: { backgroundColor: '#dcfce7', color: '#166534', border: '2px solid #166534' },
    disabled: { backgroundColor: '#f1f5f9', color: '#94a3b8', cursor: 'not-allowed' },
};

export default function HolidayMarking({ user, onLogout }: PageProps) {
    const cache = usePageCache();
    const [date, setDate] = useState<Date | undefined>(undefined);
    const [holidayName, setHolidayName] = useState('');
    const [holidayDescription, setHolidayDescription] = useState('');
    const [loading, setLoading] = useState(false);

    // ── Calendar Data ─────────────────────────────────────────────
    const [entries, setEntries] = useState<CalendarEntry[]>(cache.get<CalendarEntry[]>(HOLIDAY_CACHE_KEY) ?? []);
    const [listLoading, setListLoading] = useState(!cache.get(HOLIDAY_CACHE_KEY));

    const loadEntries = async () => {
        setListLoading(true);
        try {
            const data = await fetchCalendarEntries();
            setEntries(data);
            cache.set(HOLIDAY_CACHE_KEY, data);
        } catch {
            // Silently fail — calendar just shows no markings
        } finally {
            setListLoading(false);
        }
    };

    useEffect(() => {
        if (!cache.get(HOLIDAY_CACHE_KEY)) loadEntries();
    }, []);

    // Derive Date[] arrays for calendar modifiers
    const holidayDates = entries
        .filter(e => e.day_type === 'HOLIDAY')
        .map(e => parseISO(e.date));
    const saturdayDates = entries
        .filter(e => e.day_type === 'SATURDAY_ENABLED')
        .map(e => parseISO(e.date));

    const isPast = !!date && date < today;
    const isFuture = !!date && date >= today;

    // Check if selected date has an existing entry
    const selectedEntry = date
        ? entries.find(e => e.date === format(date, 'yyyy-MM-dd'))
        : null;

    const handleMarkHoliday = async () => {
        if (!date) return toast.error('Please select a date');
        if (isPast) return toast.error('Cannot modify past dates');
        if (!holidayName) return toast.error('Please enter holiday name');
        setLoading(true);
        try {
            await markHoliday(format(date, 'yyyy-MM-dd'), holidayName, holidayDescription || undefined);
            toast.success(`Holiday "${holidayName}" marked for ${format(date, 'PPP')}`);
            setHolidayName(''); setHolidayDescription('');
            await loadEntries();
        } catch (err: any) {
            toast.error(err.message || 'Failed to mark holiday');
        } finally {
            setLoading(false);
        }
    };

    const handleEnableSaturday = async () => {
        if (!date) return toast.error('Please select a date');
        if (isPast) return toast.error('Cannot modify past dates');
        if (date.getDay() !== 6) return toast.error('Selected date is not a Saturday');
        setLoading(true);
        try {
            await enableWorkingSaturday(format(date, 'yyyy-MM-dd'));
            toast.success(`Saturday ${format(date, 'PPP')} marked as working day`);
            await loadEntries();
        } catch (err: any) {
            toast.error(err.message || 'Failed to enable Saturday');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteEntry = async (entry: CalendarEntry) => {
        if (!confirm(`Delete this ${entry.day_type === 'HOLIDAY' ? 'holiday' : 'working Saturday'} entry?`)) return;
        try {
            await deleteCalendarEntry(entry.calendar_id);
            toast.success('Calendar entry removed');
            await loadEntries();
        } catch (err: any) {
            toast.error(err.message || 'Failed to delete entry');
        }
    };

    return (
        <Layout user={user} onLogout={onLogout}>
            <div className="space-y-6">
                <h1 className="text-2xl text-foreground">Holiday Management</h1>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Calendar */}
                    <Card className="border-2 border-border">
                        <CardHeader>
                            <CardTitle className="text-foreground">College Calendar</CardTitle>
                            <div className="flex gap-4 text-sm mt-2">
                                {[
                                    { color: 'bg-[#f7f3ea] border-2 border-border', label: 'Working Day' },
                                    { style: { backgroundColor: '#fee2e2', border: '2px solid #991b1b' }, label: 'Holiday' },
                                    { style: { backgroundColor: '#dcfce7', border: '2px solid #166534' }, label: 'Working Saturday' },
                                ].map(({ color, style, label }) => (
                                    <div key={label} className="flex items-center gap-2">
                                        <div className={`w-4 h-4 ${color ?? ''}`} style={style} />
                                        <span className="text-muted-foreground font-medium">{label}</span>
                                    </div>
                                ))}
                            </div>
                        </CardHeader>
                        <CardContent>
                            {listLoading ? (
                                <div className="flex justify-center p-8">
                                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground/50" />
                                </div>
                            ) : (
                                <Calendar
                                    mode="single" selected={date} onSelect={setDate}
                                    className="border border-border"
                                    modifiers={{ holiday: holidayDates, workingSaturday: saturdayDates, disabled: (d) => d < today }}
                                    modifiersStyles={MODIFIERS_STYLES}
                                />
                            )}
                            {date && (
                                <div className="mt-4 p-3 bg-muted/10 border border-border rounded-xl">
                                    <p className="text-sm text-foreground opacity-90">Selected: <strong>{format(date, 'PPP')}</strong></p>
                                    {isPast && <p className="text-sm text-red-700 mt-1">Past dates cannot be modified</p>}
                                    {selectedEntry && (
                                        <p className="text-sm text-blue-700 mt-1">
                                            Currently marked as: <strong>{selectedEntry.day_type === 'HOLIDAY' ? '🔴 Holiday' : '🟢 Working Saturday'}</strong>
                                            {selectedEntry.holiday_name && ` — ${selectedEntry.holiday_name}`}
                                        </p>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Forms */}
                    <div className="space-y-4">
                        <Card className="border-2 border-border">
                            <CardHeader><CardTitle className="text-foreground">Mark Holiday</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="holidayName" className="text-foreground opacity-90">Holiday Name *</Label>
                                    <Input id="holidayName" value={holidayName} onChange={(e) => setHolidayName(e.target.value)}
                                        placeholder="e.g., Republic Day" className="mt-1 border-border" disabled={!isFuture} />
                                </div>
                                <div>
                                    <Label htmlFor="holidayDesc" className="text-foreground opacity-90">Description</Label>
                                    <Textarea id="holidayDesc" value={holidayDescription} onChange={(e) => setHolidayDescription(e.target.value)}
                                        placeholder="e.g., National Holiday" rows={3} className="mt-1 border-border" disabled={!isFuture} />
                                </div>
                                <Button onClick={handleMarkHoliday} disabled={!isFuture || loading}
                                    className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Mark as Holiday
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="border-2 border-border">
                            <CardHeader><CardTitle className="text-foreground">Enable Working Saturday</CardTitle></CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground font-medium mb-4">Only Saturdays can be enabled as working days.</p>
                                <Button onClick={handleEnableSaturday}
                                    disabled={!isFuture || !date || date.getDay() !== 6 || loading}
                                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Enable Saturday as Working Day
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Existing Entries Table */}
                {entries.length > 0 && (
                    <div>
                        <h2 className="text-xl text-foreground mb-4">Calendar Entries</h2>
                        <div className="overflow-x-auto rounded-lg border border-border bg-background">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/30 border-b border-border">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-muted-foreground font-bold uppercase text-[10px] tracking-wider">Date</th>
                                        <th className="px-6 py-4 text-left text-muted-foreground font-bold uppercase text-[10px] tracking-wider">Type</th>
                                        <th className="px-6 py-4 text-left text-muted-foreground font-bold uppercase text-[10px] tracking-wider">Holiday Name</th>
                                        <th className="px-6 py-4 text-left text-muted-foreground font-bold uppercase text-[10px] tracking-wider">Description</th>
                                        <th className="px-6 py-4 text-center text-muted-foreground font-bold uppercase text-[10px] tracking-wider w-24">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/30">
                                    {entries.map((e, i) => {
                                        const entryDate = parseISO(e.date);
                                        const canDelete = entryDate >= today;
                                        return (
                                            <tr key={e.calendar_id} className="hover:bg-muted/20 transition-colors group">
                                                <td className="px-6 py-4 font-mono font-bold text-foreground opacity-90">{format(entryDate, 'PPP')}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-block px-2 py-1 text-xs font-bold rounded-md border ${e.day_type === 'HOLIDAY' ? 'bg-destructive/10 text-destructive border-destructive/20' : 'bg-primary/10 text-primary border-primary/20'}`}>
                                                        {e.day_type === 'HOLIDAY' ? 'Holiday' : 'Working Saturday'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-foreground font-semibold whitespace-nowrap">{e.holiday_name || '-'}</td>
                                                <td className="px-6 py-4 text-muted-foreground font-medium text-xs">{e.holiday_description || '-'}</td>
                                                <td className="px-6 py-4 text-center">
                                                    {canDelete && (
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
                                                            onClick={() => handleDeleteEntry(e)}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}
