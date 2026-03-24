// ─── SelectField ─────────────────────────────────────────────────────────────
// A labeled, reusable select dropdown. Pass options from constants.ts.
// BUG-017: SelectContent uses bg-popover (CSS variable) instead of hardcoded #f7f3ea

import { Label } from '../../app/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../app/components/ui/select';
import { SelectOption } from './constants';

interface SelectFieldProps {
    id?: string;
    label: string;
    placeholder?: string;
    value: string;
    options: SelectOption[];
    onValueChange: (value: string) => void;
    className?: string;
    disabled?: boolean;
}

export function SelectField({
    id,
    label,
    placeholder = `Select ${label.toLowerCase()}`,
    value,
    options,
    onValueChange,
    className,
    disabled,
}: SelectFieldProps) {
    return (
        <div className={className}>
            <Label htmlFor={id} className="text-foreground opacity-90">
                {label}
            </Label>
            <Select value={value} onValueChange={onValueChange} disabled={disabled}>
                <SelectTrigger id={id} className="mt-1 border-border">
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                {/* BUG-017 fix: use bg-popover CSS-variable-backed class, not hardcoded hex */}
                <SelectContent className="bg-popover border-2 border-border">
                    {options.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
