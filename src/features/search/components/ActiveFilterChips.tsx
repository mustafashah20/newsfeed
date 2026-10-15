import { XIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { categoryLabel } from '@/services/news/categories';
import { providers } from '@/services/news/registry';
import { PROVIDER_IDS } from '@/services/news/types';

import { describeRange } from '../lib/date-presets';
import { CLEAR_ACTION, PILL, PILL_ACTIVE } from '../lib/filter-styles';
import type { SearchFilters } from '../search-params';

type ActiveFilterChipsProps = {
  filters: SearchFilters;
  onChange: (patch: Partial<SearchFilters>) => void;
  onClear: () => void;
  now?: Date;
};

type Chip = { key: string; label: string; patch: Partial<SearchFilters> };

function chipsFor(filters: SearchFilters, now?: Date): Chip[] {
  const chips: Chip[] = [];
  const range = describeRange({ from: filters.from, to: filters.to }, now);
  if (range) chips.push({ key: 'date', label: range, patch: { from: undefined, to: undefined } });
  // One chip per category, so each can be removed on its own.
  for (const category of filters.categories) {
    chips.push({
      key: `category-${category}`,
      label: categoryLabel(category),
      patch: { categories: filters.categories.filter((c) => c !== category) },
    });
  }
  if (filters.sources.length < PROVIDER_IDS.length) {
    chips.push({
      key: 'sources',
      label: filters.sources.map((id) => providers[id].label).join(', '),
      patch: { sources: [...PROVIDER_IDS] },
    });
  }
  return chips;
}

export function ActiveFilterChips({ filters, onChange, onClear, now }: ActiveFilterChipsProps) {
  const chips = chipsFor(filters, now);
  if (chips.length === 0) return null;

  return (
    <div className="flex min-w-0 flex-wrap items-center gap-2">
      <ul aria-label="Active filters" className="flex min-w-0 flex-wrap gap-2">
        {chips.map((chip) => (
          // A set filter: a dark pill (like the desktop pills); tapping it removes the filter.
          <li key={chip.key} className="min-w-0">
            <Button
              variant="outline"
              className={cn(PILL, PILL_ACTIVE, 'max-w-full pr-3 pl-4')}
              aria-label={`Remove filter: ${chip.label}`}
              onClick={() => {
                onChange(chip.patch);
              }}
            >
              <span className="min-w-0 truncate">{chip.label}</span>
              <XIcon aria-hidden="true" className="size-3.5" strokeWidth={2.4} />
            </Button>
          </li>
        ))}
      </ul>
      {chips.length > 1 && (
        <Button
          variant="ghost"
          className={cn(CLEAR_ACTION, 'hover:bg-transparent')}
          onClick={onClear}
        >
          Clear all
        </Button>
      )}
    </div>
  );
}
