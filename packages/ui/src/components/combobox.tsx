import * as React from "react"
import { Check, ChevronsUpDown, Search } from "lucide-react"
import { Command as CommandPrimitive } from "cmdk"
import { Popover, PopoverContent, PopoverTrigger } from "@workspace/ui/components/popover"
import { cn } from "@workspace/ui/lib/utils"

// Basic components from your existing Combobox
const ComboboxRoot = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive>
>(({ className, ...props }, ref) => (
  <CommandPrimitive
    ref={ref}
    className={cn(
      "flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground",
      className
    )}
    {...props}
  />
))
ComboboxRoot.displayName = CommandPrimitive.displayName

const ComboboxInput = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Input>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
>(({ className, ...props }, ref) => (
  <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
    <CommandPrimitive.Input
      ref={ref}
      className={cn(
        "flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  </div>
))
ComboboxInput.displayName = CommandPrimitive.Input.displayName

const ComboboxEmpty = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Empty>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>((props, ref) => (
  <CommandPrimitive.Empty
    ref={ref}
    className="py-6 text-center text-sm"
    {...props}
  />
))
ComboboxEmpty.displayName = CommandPrimitive.Empty.displayName

const ComboboxGroup = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Group>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Group
    ref={ref}
    className={cn(
      "overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground",
      className
    )}
    {...props}
  />
))
ComboboxGroup.displayName = CommandPrimitive.Group.displayName

const ComboboxSeparator = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 h-px bg-border", className)}
    {...props}
  />
))
ComboboxSeparator.displayName = CommandPrimitive.Separator.displayName

const ComboboxItem = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <CommandPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <Check className="mr-2 h-4 w-4 opacity-0 aria-selected:opacity-100" />
    {children}
  </CommandPrimitive.Item>
))
ComboboxItem.displayName = CommandPrimitive.Item.displayName

const ComboboxList = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.List
    ref={ref}
    className={cn("max-h-[300px] overflow-y-auto overflow-x-hidden", className)}
    {...props}
  />
))
ComboboxList.displayName = CommandPrimitive.List.displayName

const ComboboxButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
  >
    {children}
    <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
  </button>
))
ComboboxButton.displayName = "ComboboxButton"

// New enhanced Combobox component that accepts options, value, onChange, etc.
interface ComboboxOption {
  value: string | number
  label: string
}

interface ComboboxProps {
  options: ComboboxOption[]
  value?: string | number | null
  onChange: (value: string | number) => void
  placeholder?: string
  searchPlaceholder?: string
  searchValue?: string
  onSearchChange?: (value: string) => void
  emptyMessage?: string
  className?: string
}

export function Combobox({
  options,
  value,
  onChange,
  placeholder = "Select an option...",
  searchPlaceholder = "Search...",
  searchValue = "",
  onSearchChange,
  emptyMessage = "No results found.",
  className
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const selectedOption = options.find(option => option.value === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <ComboboxButton className={className}>
          {selectedOption ? selectedOption.label : placeholder}
        </ComboboxButton>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <ComboboxRoot>
          <ComboboxInput 
            placeholder={searchPlaceholder} 
            value={searchValue}
            onValueChange={onSearchChange}
          />
          <ComboboxList>
            {options.length > 0 ? (
              options.map((option) => (
                <ComboboxItem
                  key={option.value}
                  value={String(option.value)}
                  onSelect={() => {
                    onChange(option.value)
                    setOpen(false)
                  }}
                >
                  {option.label}
                </ComboboxItem>
              ))
            ) : (
              <ComboboxEmpty>{emptyMessage}</ComboboxEmpty>
            )}
          </ComboboxList>
        </ComboboxRoot>
      </PopoverContent>
    </Popover>
  )
}

// Export everything
export {
  ComboboxRoot,
  ComboboxInput,
  ComboboxList,
  ComboboxItem,
  ComboboxGroup,
  ComboboxSeparator,
  ComboboxEmpty,
  ComboboxButton,
}