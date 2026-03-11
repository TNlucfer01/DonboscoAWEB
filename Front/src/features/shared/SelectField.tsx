// ─── SelectField ─────────────────────────────────────────────────────────────
// A labeled, reusable select dropdown. Pass options from constants.ts.
// Eliminates boilerplate repeated across 6+ components.

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
            <Label htmlFor={id} className="text-slate-700">
                {label}
            </Label>
            <Select value={value} onValueChange={onValueChange} disabled={disabled}>
                <SelectTrigger id={id} className="mt-1 border-slate-300">
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent className="bg-white border-2 border-slate-300">
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
