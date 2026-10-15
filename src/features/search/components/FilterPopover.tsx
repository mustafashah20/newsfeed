import { ChevronDownIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

import { CLEAR_ACTION, MENU_HEADING, MENU_PANEL, PILL, PILL_ACTIVE } from '../lib/filter-styles';

type FilterPopoverProps = {
  /** What the pill shows: the default label, or the applied value. */
  label: string;
  /** The pill's accessible name, e.g. "Categories: Science, Sports". */
  ariaLabel: string;
  /** A value is applied: the pill turns dark. */
  active: boolean;
  /** The panel's heading, e.g. "Category". */
  title: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Resets the draft to the default (nothing is applied until "Apply"). */
  onReset: () => void;
  onApply: () => void;
  /** Shown under the options, e.g. a provider limit. */
  note?: ReactNode;
  children: ReactNode;
};

/**
 * A filter pill opening a panel of options with Clear and Apply. Ticking only edits a draft;
 * Apply runs one search and closing discards the draft, so trying combinations costs no
 * requests (each search hits every source, and NYT allows 5 a minute).
 */
export function FilterPopover({
  label,
  ariaLabel,
  active,
  title,
  open,
  onOpenChange,
  onReset,
  onApply,
  note,
  children,
}: FilterPopoverProps) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          aria-label={ariaLabel}
          className={cn(PILL, active && PILL_ACTIVE)}
        >
          {label}
          <ChevronDownIcon aria-hidden="true" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" aria-label={title} className={cn(MENU_PANEL, 'p-0')}>
        <div className="max-h-[min(24rem,60dvh)] overflow-y-auto p-2">
          <p className={MENU_HEADING}>{title}</p>
          {children}
          {note && <p className="px-3 pt-2 pb-1 text-xs text-muted-foreground">{note}</p>}
        </div>
        <div className="flex items-center justify-between gap-2 border-t border-border p-2">
          <Button
            variant="ghost"
            className={cn(CLEAR_ACTION, 'hover:bg-transparent')}
            onClick={onReset}
          >
            Clear
          </Button>
          <Button className="h-11 rounded-full px-5 text-sm font-semibold" onClick={onApply}>
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
