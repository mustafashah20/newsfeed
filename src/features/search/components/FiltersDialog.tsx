import { SlidersHorizontalIcon, XIcon } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { PROVIDER_IDS } from '@/services/news/types';

import { PILL } from '../lib/filter-styles';
import type { SearchFilters } from '../search-params';
import { FiltersPanel } from './FiltersPanel';

type FiltersDialogProps = {
  filters: SearchFilters;
  activeCount: number;
  /** Called once with the edited filters when the user confirms. */
  onApply: (patch: Partial<SearchFilters>) => void;
  className?: string;
};

const CLEARED: Partial<SearchFilters> = {
  from: undefined,
  to: undefined,
  categories: [],
  sources: [...PROVIDER_IDS],
};

/**
 * Date, category and sources in a popup. Edits are a draft until "Show results", so trying
 * filters out costs no API calls; closing the popup discards them.
 */
export function FiltersDialog({ filters, activeCount, onApply, className }: FiltersDialogProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(filters);

  function handleOpenChange(next: boolean) {
    // Each opening starts from what's applied, not from a discarded draft.
    if (next) setDraft(filters);
    setOpen(next);
  }

  function handleApply() {
    onApply({
      from: draft.from,
      to: draft.to,
      categories: draft.categories,
      sources: draft.sources,
    });
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className={cn(PILL, 'gap-2 pr-4', className)}>
          <SlidersHorizontalIcon aria-hidden="true" />
          Filters
          {activeCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-semibold text-primary-foreground">
              <span className="sr-only">(</span>
              {activeCount}
              <span className="sr-only">)</span>
            </span>
          )}
        </Button>
      </DialogTrigger>
      {/* Own close button: the generated one is smaller than the 44 px touch target. */}
      <DialogContent
        showCloseButton={false}
        className="max-h-[85dvh] gap-6 overflow-y-auto p-5 sm:max-w-md"
      >
        <DialogHeader className="flex-row items-center justify-between gap-2">
          <DialogTitle className="font-heading text-xl font-medium">Filters</DialogTitle>
          <DialogClose asChild>
            <Button variant="ghost" size="icon" className="size-11" aria-label="Close filters">
              <XIcon aria-hidden="true" />
            </Button>
          </DialogClose>
        </DialogHeader>
        <DialogDescription className="sr-only">
          Narrow the results by date, category and source.
        </DialogDescription>
        <FiltersPanel
          filters={draft}
          onChange={(patch) => {
            setDraft({ ...draft, ...patch });
          }}
        />
        <DialogFooter className="gap-2 sm:justify-between">
          <Button
            variant="ghost"
            className="h-11 px-4"
            onClick={() => {
              setDraft({ ...draft, ...CLEARED });
            }}
          >
            Reset
          </Button>
          <Button className="h-11 px-6" onClick={handleApply}>
            Show results
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
