import { XIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { categoryLabel } from '@/services/news/categories';
import { providers } from '@/services/news/registry';
import { PROVIDER_IDS } from '@/services/news/types';

import { describeRange } from '../lib/date-presets';
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
  if (filters.category) {
    chips.push({
      key: 'category',
      label: categoryLabel(filters.category),
      patch: { category: undefined },
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
          <li
            key={chip.key}
            className="flex min-w-0 items-center rounded-full border bg-secondary pl-3 text-sm text-secondary-foreground"
          >
            <span className="min-w-0 truncate">{chip.label}</span>
            <Button
              variant="ghost"
              size="icon"
              className="size-11 shrink-0 rounded-full"
              aria-label={`Remove filter: ${chip.label}`}
              onClick={() => {
                onChange(chip.patch);
              }}
            >
              <XIcon aria-hidden="true" />
            </Button>
          </li>
        ))}
      </ul>
      {chips.length > 1 && (
        <Button variant="link" className="h-11 px-2" onClick={onClear}>
          Clear all
        </Button>
      )}
    </div>
  );
}
