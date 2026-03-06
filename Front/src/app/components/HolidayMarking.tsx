import { useState } from 'react';
import Layout from './Layout';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Calendar } from './ui/calendar';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface HolidayMarkingProps {
  user: { role: string; name: string };
  onLogout: () => void;
}

export default function HolidayMarking({ user, onLogout }: HolidayMarkingProps) {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [holidayName, setHolidayName] = useState('');
  const [holidayDescription, setHolidayDescription] = useState('');
  const [holidays, setHolidays] = useState<Date[]>([
    new Date(2026, 2, 15), // Example holiday
  ]);
  const [workingSaturdays, setWorkingSaturdays] = useState<Date[]>([]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const handleMarkHoliday = () => {
    if (!date) {
      toast.error('Please select a date');
      return;
    }

    if (date < today) {
      toast.error('Cannot modify past dates');
      return;
    }

    if (!holidayName) {
      toast.error('Please enter holiday name');
      return;
    }

    setHolidays([...holidays, date]);
    toast.success(`Holiday "${holidayName}" marked for ${format(date, 'PPP')}`);
    setHolidayName('');
    setHolidayDescription('');
  };

  const handleEnableSaturday = () => {
    if (!date) {
      toast.error('Please select a date');
      return;
    }

    if (date < today) {
      toast.error('Cannot modify past dates');
      return;
    }

    if (date.getDay() !== 6) {
      toast.error('Selected date is not a Saturday');
      return;
    }

    setWorkingSaturdays([...workingSaturdays, date]);
    toast.success(`Saturday ${format(date, 'PPP')} marked as working day`);
  };

  const modifiers = {
    holiday: holidays,
    workingSaturday: workingSaturdays,
    disabled: (date: Date) => date < today,
  };

  const modifiersStyles = {
    holiday: { backgroundColor: '#fee2e2', color: '#991b1b', border: '2px solid #991b1b' },
    workingSaturday: { backgroundColor: '#dcfce7', color: '#166534', border: '2px solid #166534' },
    disabled: { backgroundColor: '#f1f5f9', color: '#94a3b8', cursor: 'not-allowed' },
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
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-white border-2 border-slate-300"></div>
                  <span className="text-slate-600">Working Day</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4" style={{ backgroundColor: '#fee2e2', border: '2px solid #991b1b' }}></div>
                  <span className="text-slate-600">Holiday</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4" style={{ backgroundColor: '#dcfce7', border: '2px solid #166534' }}></div>
                  <span className="text-slate-600">Working Saturday</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="border border-slate-300"
                modifiers={modifiers}
                modifiersStyles={modifiersStyles}
              />
              {date && (
                <div className="mt-4 p-3 bg-slate-50 border border-slate-300">
                  <p className="text-sm text-slate-700">
                    Selected: <strong>{format(date, 'PPP')}</strong>
                  </p>
                  {date < today && (
                    <p className="text-sm text-red-700 mt-1">Past dates cannot be modified</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Holiday Form */}
          <div className="space-y-4">
            <Card className="border-2 border-slate-300">
              <CardHeader>
                <CardTitle className="text-slate-800">Mark Holiday</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="holidayName" className="text-slate-700">Holiday Name *</Label>
                  <Input
                    id="holidayName"
                    type="text"
                    value={holidayName}
                    onChange={(e) => setHolidayName(e.target.value)}
                    placeholder="e.g., Republic Day"
                    className="mt-1 border-slate-300"
                    disabled={!date || date < today}
                  />
                </div>

                <div>
                  <Label htmlFor="holidayDescription" className="text-slate-700">Holiday Description</Label>
                  <Textarea
                    id="holidayDescription"
                    value={holidayDescription}
                    onChange={(e) => setHolidayDescription(e.target.value)}
                    placeholder="e.g., National Holiday"
                    rows={3}
                    className="mt-1 border-slate-300"
                    disabled={!date || date < today}
                  />
                </div>

                <Button
                  onClick={handleMarkHoliday}
                  className="w-full bg-red-700 hover:bg-red-800 text-white"
                  disabled={!date || date < today}
                >
                  Mark as Holiday
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-slate-300">
              <CardHeader>
                <CardTitle className="text-slate-800">Enable Working Saturday</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 mb-4">
                  Use this to mark a Saturday as a working day. Only Saturdays can be enabled.
                </p>
                <Button
                  onClick={handleEnableSaturday}
                  className="w-full bg-green-700 hover:bg-green-800 text-white"
                  disabled={!date || date < today || date.getDay() !== 6}
                >
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
