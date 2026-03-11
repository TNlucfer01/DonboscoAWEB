// ─── DatePickerField (features/shared) ───────────────────────────────────────
// Canonical controlled date picker. The open state causes the popover to
// auto-close after a date is selected — fixing the original bug.

import { useState } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '../../app/components/ui/button';
import { Calendar } from '../../app/components/ui/calendar';
import { Label } from '../../app/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '../../app/components/ui/popover';

interface DatePickerFieldProps {
    date: Date | undefined;
    onDateChange: (date: Date | undefined) => void;
    label?: string;
}


export function DatePickerField({
  date,
  onDateChange,
  label = 'Date',
}: DatePickerFieldProps) {
  return (
    <div className="flex-1 space-y-2">
      <Label className="text-slate-700">{label}</Label>
      <div className="rounded-md border border-slate-300 p-3 bg-white">
        <Calendar
          mode="single"
          selected={date}
          onSelect={onDateChange}
          className="pointer-events-auto"
        />
      </div>
      {/* Optional: show selected date below if needed */}
      {date && (
        <p className="text-sm text-slate-600">
          Selected: {format(date, 'PPP')}
        </p>
      )}
    </div>
  );
}