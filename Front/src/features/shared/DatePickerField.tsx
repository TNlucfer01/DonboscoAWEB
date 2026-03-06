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

export function DatePickerField({ date, onDateChange, label = 'Date' }: DatePickerFieldProps) {
    const [open, setOpen] = useState(false);

    const handleSelect = (selected: Date | undefined) => {
        onDateChange(selected);
        setOpen(false); // ← fix: close popover on selection
    };

    return (
        <div className="flex-1">
            <Label className="text-slate-700">{label}</Label>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full mt-1 justify-start text-left border-slate-300">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, 'PP') : <span>Pick a date</span>}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-white border-2 border-slate-300">
                    <Calendar mode="single" selected={date} onSelect={handleSelect} />
                </PopoverContent>
            </Popover>
        </div>
    );
}
