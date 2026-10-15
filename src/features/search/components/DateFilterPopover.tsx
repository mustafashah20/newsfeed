import { ChevronDownIcon } from 'lucide-react';
import { useState } from 'react';
import type { DateRange } from 'react-day-picker';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

import {
  DATE_PRESETS,
  describeRange,
  detectPreset,
  fromPickerRange,
  presetRange,
  toPickerRange,
} from '../lib/date-presets';
import type { DayRange } from '../lib/date-presets';
import { MENU_HEADING, MENU_OPTION, MENU_PANEL, PILL, PILL_ACTIVE } from '../lib/filter-styles';
import { RadioIndicator } from './RadioIndicator';

type DateFilterPopoverProps = {
  from?: string;
  to?: string;
  onChange: (range: DayRange) => void;
  now?: Date;
};

/**
 * The desktop date filter: quick ranges beside a calendar, in one popover. A quick range
 * applies at once; a calendar range applies with "Apply", so half-picked ranges cost no requests.
 */
export function DateFilterPopover({
  from,
  to,
  onChange,
  now = new Date(),
}: DateFilterPopoverProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<DateRange | undefined>();
  const preset = detectPreset({ from, to }, now);
  const label = describeRange({ from, to }, now) ?? 'Any time';

  function handleOpenChange(next: boolean) {
    // Start from the applied range each time the picker opens.
    if (next) setDraft(toPickerRange({ from, to }));
    setOpen(next);
  }

  function handleApply() {
    const range = fromPickerRange(draft);
    if (!range) return;
    onChange(range);
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          aria-label={`Date: ${label}`}
          className={cn(PILL, 'max-w-72', preset !== 'any' && PILL_ACTIVE)}
        >
          <span className="truncate">{label}</span>
          <ChevronDownIcon aria-hidden="true" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className={cn(MENU_PANEL, 'w-auto flex-row p-0')}>
        <div className="w-65 p-2">
          <p className={MENU_HEADING}>Published</p>
          <ul aria-label="Quick ranges" className="flex flex-col">
            {DATE_PRESETS.map((p) => (
              <li key={p.id}>
                <Button
                  variant="ghost"
                  aria-pressed={preset === p.id}
                  className={cn(MENU_OPTION, 'w-full justify-start font-normal')}
                  onClick={() => {
                    onChange(presetRange(p.id, now));
                    setOpen(false);
                  }}
                >
                  <RadioIndicator checked={preset === p.id} />
                  {p.label}
                </Button>
              </li>
            ))}
          </ul>
        </div>
        {/* A custom range: half-picked ranges cost nothing until "Apply". */}
        <div className="flex flex-col border-l border-border">
          <p className={cn(MENU_HEADING, 'px-5 pt-4 pb-0')}>Custom range</p>
          <Calendar
            mode="range"
            numberOfMonths={2}
            selected={draft}
            onSelect={setDraft}
            today={now}
            defaultMonth={draft?.from ?? now}
            disabled={{ after: now }}
          />
          <div className="flex justify-end gap-2 border-t border-border p-3">
            <Button
              variant="ghost"
              className="h-11 rounded-full px-4"
              onClick={() => {
                setOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button
              className="h-11 rounded-full px-5 font-semibold"
              disabled={!draft?.from}
              onClick={handleApply}
            >
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
