
"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

type ComboboxOption = {
  value: string;
  label: string;
  keywords?: string[];
};

type ComboboxProps = {
  options: ComboboxOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  notFoundText?: string;
};

export function Combobox({
  options,
  value,
  onChange,
  placeholder = "Select an option...",
  notFoundText = "No option found.",
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [container, setContainer] = React.useState<HTMLElement | null>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    if (triggerRef.current) {
        let parent = triggerRef.current.parentElement;
        while(parent) {
            if (parent.hasAttribute('data-radix-dialog-content-wrapper') || parent.hasAttribute('data-radix-popper-content-wrapper')) {
                setContainer(parent);
                break;
            }
            parent = parent.parentElement;
        }
        if (!parent) {
            setContainer(document.body);
        }
    }
  }, [triggerRef]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          ref={triggerRef}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value
            ? options.find((option) => option.value === value)?.label
            : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[--radix-popover-trigger-width] p-0" 
        container={container}
        >
        <Command
            filter={(optionValue, search) => {
                const option = options.find(o => o.value === optionValue);
                if (!option) return 0;
                const searchLower = search.toLowerCase();
                
                if (option.label.toLowerCase().includes(searchLower)) {
                    return 1;
                }
                
                if (option.keywords?.some(kw => kw.toLowerCase().includes(searchLower))) {
                    return 1;
                }

                return 0;
            }}
        >
          <CommandInput placeholder={placeholder} />
          <CommandList>
            <CommandEmpty>{notFoundText}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={(currentValue) => {
                    onChange(currentValue === value ? "" : currentValue)
                    setOpen(false)
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onChange(option.value === value ? "" : option.value)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
