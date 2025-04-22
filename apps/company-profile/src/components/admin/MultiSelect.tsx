import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@workspace/ui/components/command';
import { Popover, PopoverContent, PopoverTrigger } from '@workspace/ui/components/popover';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/lib/utils';

interface Option {
  value: number;
  label: string;
}

interface MultiSelectProps {
  options: Option[];
  selected: number[];
  onChange: (value: number[]) => void;
  placeholder?: string;
  className?: string;
}

export const MultiSelect = ({
  options,
  selected,
  onChange,
  placeholder = "Select options",
  className,
}: MultiSelectProps) => {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  // Find option labels for selected values
//   const selectedLabels = options
//     .filter(option => selected.includes(option.value))
//     .map(option => option.label);
  
  // Handle selection toggle
  const handleSelect = (value: number) => {
    const updatedSelection = selected.includes(value)
      ? selected.filter(i => i !== value)
      : [...selected, value];
    
    onChange(updatedSelection);
  };

  // Handle removing a selected item
  const handleRemove = (value: number, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selected.filter(i => i !== value));
  };

  // Handle clearing all selected items
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([]);
  };

  // Adjust popover width to match trigger width
  const [popoverWidth, setPopoverWidth] = useState<number>(0);

  useEffect(() => {
    if (buttonRef.current) {
      setPopoverWidth(buttonRef.current.offsetWidth);
    }
  }, [open]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          ref={buttonRef}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full border-input justify-between relative min-h-10",
            open && "border-primary-500 dark:border-primary-400 ring-1 ring-primary-500/20",
            className
          )}
          onClick={() => setOpen(prev => !prev)}
        >
          <div className="flex flex-wrap gap-1 mr-8 max-w-[calc(100%-2rem)]">
            {selected.length > 0 ? (
              selected.map(value => {
                const option = options.find(o => o.value === value);
                return option ? (
                  <Badge
                    key={value}
                    variant="secondary"
                    className="bg-accent dark:bg-sidebar-accent/20 text-primary-600 dark:text-primary-400 font-normal py-1 px-2 flex items-center gap-1"
                  >
                    {option.label}
                    <X
                      className="h-3 w-3 cursor-pointer hover:text-destructive"
                      onClick={(e) => handleRemove(value, e)}
                    />
                  </Badge>
                ) : null;
              })
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
          <div className="flex gap-1 absolute right-3 top-3">
            {selected.length > 0 && (
              <X
                className="h-4 w-4 opacity-50 hover:opacity-100 cursor-pointer"
                onClick={handleClear}
              />
            )}
            <ChevronsUpDown className="h-4 w-4 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="p-0" 
        style={{ width: `${popoverWidth}px` }}
        align="start"
      >
        <Command>
          <CommandInput placeholder="Search..." />
          <CommandEmpty>No items found.</CommandEmpty>
          <CommandGroup className="max-h-64 overflow-auto">
            {options.map((option) => (
              <CommandItem
                key={option.value}
                value={option.label}
                onSelect={() => handleSelect(option.value)}
              >
                <div className="flex items-center gap-2 w-full">
                  <div className={cn(
                    "flex-shrink-0 border rounded w-4 h-4 flex items-center justify-center",
                    selected.includes(option.value) 
                      ? "bg-primary-600 dark:bg-primary-500 border-primary-600 dark:border-primary-500" 
                      : "border-input"
                  )}>
                    {selected.includes(option.value) && (
                      <Check className="h-3 w-3 text-white" />
                    )}
                  </div>
                  <span>{option.label}</span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};