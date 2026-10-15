import { CalendarIcon } from 'lucide-react';
import { useState } from 'react';
import type { DateRange } from 'react-day-picker';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import {
  DATE_PRESETS,
  describeRange,
  detectPreset,
  fromPickerRange,
  presetRange,
  toPickerRange,
} from '../lib/date-presets';
import type { DayRange } from '../lib/date-presets';

const CUSTOM = 'custom';

type DateRangeFilterProps = {
  id: string;
  from?: string;
  to?: string;
  onChange: (range: DayRange) => void;
  now?: Date;
};

export function DateRangeFilter({
  id,
  from,
  to,
  onChange,
  now = new Date(),
}: DateRangeFilterProps) {
  const preset = detectPreset({ from, to }, now);
  // "Custom range" can be chosen before any dates are picked.
  const [wantsCustom, setWantsCustom] = useState(false);
  const isCustom = preset === CUSTOM || wantsCustom;
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<DateRange | undefined>();

  function handlePresetChange(value: string) {
    // Custom shows the "Pick dates" button. Opening the calendar here would race the Select
    // returning focus to its trigger, which closes the popover again.
    if (value === CUSTOM) {
      setWantsCustom(true);
      return;
    }
    const match = DATE_PRESETS.find((p) => p.id === value);
    if (!match) return;
    setWantsCustom(false);
    onChange(presetRange(match.id, now));
  }

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
    <div className="flex flex-col gap-2">
      <Select value={isCustom ? CUSTOM : preset} onValueChange={handlePresetChange}>
        <SelectTrigger id={id} className="w-full text-base data-[size=default]:h-11">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {DATE_PRESETS.map((p) => (
            <SelectItem key={p.id} value={p.id}>
              {p.label}
            </SelectItem>
          ))}
          <SelectItem value={CUSTOM}>Custom range…</SelectItem>
        </SelectContent>
      </Select>

      {isCustom && (
        <Popover open={open} onOpenChange={handleOpenChange}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="h-11 w-full justify-start font-normal">
              <CalendarIcon aria-hidden="true" />
              <span className="truncate">
                {preset === CUSTOM ? describeRange({ from, to }, now) : 'Pick dates'}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-auto p-0">
            <Calendar
              mode="range"
              selected={draft}
              onSelect={setDraft}
              today={now}
              defaultMonth={draft?.from ?? now}
              disabled={{ after: now }}
            />
            <div className="flex justify-end gap-2 border-t p-3">
              <Button
                variant="ghost"
                className="h-11 px-4"
                onClick={() => {
                  setOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button className="h-11 px-4" disabled={!draft?.from} onClick={handleApply}>
                Apply
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
