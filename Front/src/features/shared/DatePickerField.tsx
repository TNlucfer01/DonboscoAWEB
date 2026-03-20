import { format, isAfter, startOfDay } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '../../app/components/ui/utils';
import { Button } from '../../app/components/ui/button';
import { Calendar } from '../../app/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../../app/components/ui/popover';
import { Label } from '../../app/components/ui/label';

interface DatePickerFieldProps {
    date: Date | undefined;
    onDateChange: (date: Date | undefined) => void;
    label?: string;
    maxDate?: Date;
}

export function DatePickerField({
  date,
  onDateChange,
  label = 'Date',
  maxDate = new Date(),
}: DatePickerFieldProps) {
  return (
    <div className="flex flex-col gap-2 w-full sm:min-w-[200px]">  {/* BUG-016: responsive width */}
      {/* BUG-014: Label style matches SelectField — gentle opacity instead of bold+uppercase */}
      <Label className="text-sm font-medium text-foreground opacity-90">{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "h-11 justify-start text-left font-bold rounded-xl border-border bg-card shadow-sm hover:bg-muted/50 transition-all active:scale-[0.98]",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-3 h-4 w-4 text-primary" />
            {date ? format(date, "PPP") : <span className="opacity-50 font-medium">Select calendar date...</span>}
          </Button>
        </PopoverTrigger>
        {/* BUG-015: max-w constraint prevents popover overflow on mobile */}
        <PopoverContent className="w-auto max-w-[calc(100vw-2rem)] p-0 rounded-2xl border-border shadow-2xl bg-card" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={onDateChange}
            disabled={(d) => (maxDate ? isAfter(startOfDay(d), startOfDay(maxDate)) : false)}
            initialFocus
            className="rounded-2xl p-4 bg-card"
            classNames={{
              day_today: "bg-primary/10 text-primary font-bold border-2 border-primary/20",
              day_selected: "bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg",
              day: "h-9 w-9 text-center p-0 font-bold aria-selected:opacity-100 hover:bg-muted/50 rounded-lg transition-colors",
              caption_label: "font-black text-secondary uppercase tracking-widest"
            }}
          />
          {maxDate && (
             <div className="p-3 border-t border-border/10 bg-muted/20">
                <p className="text-[10px] text-center text-muted-foreground font-medium uppercase tracking-tighter italic">
                  * Future dates beyond {format(maxDate, "MMM d")} are restricted
                </p>
             </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}