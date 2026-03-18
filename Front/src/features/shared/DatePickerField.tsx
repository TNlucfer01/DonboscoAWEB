import { useState, useEffect } from 'react';
import { format, getDaysInMonth, setMonth, setYear, setDate as setDay, isAfter, startOfDay } from 'date-fns';
import { Label } from '../../app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../app/components/ui/select';

interface DatePickerFieldProps {
    date: Date | undefined;
    onDateChange: (date: Date | undefined) => void;
    label?: string;
    maxDate?: Date;
}

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

export function DatePickerField({
  date,
  onDateChange,
  label = 'Date',
  maxDate = new Date(),
}: DatePickerFieldProps) {
  // Use today as fallback if date is undefined for dropdown defaults
  const current = date || new Date();
  
  const [selectedDay, setSelectedDay] = useState(current.getDate().toString());
  const [selectedMonth, setSelectedMonth] = useState(current.getMonth().toString());
  const [selectedYear, setSelectedYear] = useState(current.getFullYear().toString());

  // Sync internal state with external date prop
  useEffect(() => {
    if (date) {
      setSelectedDay(date.getDate().toString());
      setSelectedMonth(date.getMonth().toString());
      setSelectedYear(date.getFullYear().toString());
    }
  }, [date]);

  // Generate Year options (last 2 years + current)
  const years = Array.from({ length: 3 }, (_, i) => (new Date().getFullYear() - 2 + i).toString());

  // Generate Month options
  const months = MONTHS.map((name, i) => ({ value: i.toString(), label: name }));

  // Generate Day options based on selected Month/Year
  const daysInMonth = getDaysInMonth(new Date(parseInt(selectedYear), parseInt(selectedMonth)));
  const days = Array.from({ length: daysInMonth }, (_, i) => (i + 1).toString());

  const handleChange = (type: 'day' | 'month' | 'year', value: string) => {
    let d = parseInt(type === 'day' ? value : selectedDay);
    let m = parseInt(type === 'month' ? value : selectedMonth);
    let y = parseInt(type === 'year' ? value : selectedYear);

    // Adjust day if it exceeds the new month's capacity
    const newMaxDays = getDaysInMonth(new Date(y, m));
    if (d > newMaxDays) d = newMaxDays;

    const newDate = new Date(y, m, d);
    
    // Enforce maxDate
    if (maxDate && isAfter(startOfDay(newDate), startOfDay(maxDate))) {
      // If the selected date is after maxDate, snap to maxDate or current valid
      onDateChange(maxDate);
    } else {
      onDateChange(newDate);
    }
  };

  return (
    <div className="flex flex-col gap-2 flex-1 min-w-[280px]">
      <Label className="text-sm font-semibold text-foreground ml-1">{label}</Label>
      <div className="flex gap-2">
        {/* Day Select */}
        <div className="w-20">
          <Select value={selectedDay} onValueChange={(v) => handleChange('day', v)}>
            <SelectTrigger className="h-11 rounded-xl border-border bg-card">
              <SelectValue placeholder="Day" />
            </SelectTrigger>
            <SelectContent className="max-h-60 rounded-xl">
              {days.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Month Select */}
        <div className="flex-1">
          <Select value={selectedMonth} onValueChange={(v) => handleChange('month', v)}>
            <SelectTrigger className="h-11 rounded-xl border-border bg-card">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {months.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Year Select */}
        <div className="w-24">
          <Select value={selectedYear} onValueChange={(v) => handleChange('year', v)}>
            <SelectTrigger className="h-11 rounded-xl border-border bg-card">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}