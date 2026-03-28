import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "../../app/components/ui/utils"
import { Button } from "../../app/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../../app/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../app/components/ui/popover"
import { Label } from "../../app/components/ui/label"

export interface SearchableSelectProps {
    label?: string;
    options: { label: string; value: string }[];
    value: string;
    onValueChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
}

export function SearchableSelect({ label, options, value, onValueChange, placeholder = "Select...", disabled }: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <div className="space-y-2 flex flex-col w-full">
        {label && <Label className="text-sm font-semibold text-foreground ml-1">{label}</Label>}
        <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
            <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className="w-full justify-between h-11 rounded-xl bg-background border-border font-normal"
            >
            <span className="truncate">
                {value
                    ? options.find((option) => option.value === value)?.label || placeholder
                    : placeholder}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0 rounded-xl" align="start">
            <Command>
            <CommandInput placeholder={`Search...`} />
            <CommandList className="max-h-[300px]">
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup>
                {options.map((option) => (
                    <CommandItem
                        key={option.value}
                        value={option.label}
                        onSelect={() => {
                            onValueChange(option.value)
                            setOpen(false)
                        }}
                    >
                    <Check
                        className={cn(
                        "mr-2 h-4 w-4 shrink-0",
                        value === option.value ? "opacity-100" : "opacity-0"
                        )}
                    />
                    <span className="truncate">{option.label}</span>
                    </CommandItem>
                ))}
                </CommandGroup>
            </CommandList>
            </Command>
        </PopoverContent>
        </Popover>
    </div>
  )
}
