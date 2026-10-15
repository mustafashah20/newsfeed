import { useId } from 'react';

import { CategoryPicker } from '@/components/common/CategoryPicker';
import {
  NEWSAPI_MAX_CATEGORIES,
  NEWSAPI_WINDOW_DAYS,
} from '@/services/news/providers/newsapi/client';

import { isNewsapiCategoryCapped } from '../search-params';
import type { SearchFilters } from '../search-params';
import { DateRangeFilter } from './DateRangeFilter';
import { SourceMultiSelect } from './SourceMultiSelect';

type FiltersPanelProps = {
  filters: SearchFilters;
  onChange: (patch: Partial<SearchFilters>) => void;
};

// Rendered twice (sidebar and mobile Sheet), so ids come from useId.
export function FiltersPanel({ filters, onChange }: FiltersPanelProps) {
  const id = useId();
  const dateId = `${id}-date`;
  const newsapiCapped = isNewsapiCategoryCapped(filters);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label htmlFor={dateId} className="text-sm font-medium">
          Date
        </label>
        <DateRangeFilter
          id={dateId}
          from={filters.from}
          to={filters.to}
          onChange={(range) => {
            onChange(range);
          }}
        />
        {filters.sources.includes('newsapi') && (
          <p className="text-xs text-muted-foreground">
            NewsAPI only covers the past {NEWSAPI_WINDOW_DAYS} days.
          </p>
        )}
      </div>

      <fieldset className="flex flex-col">
        <legend className="mb-1 text-sm font-medium">Categories</legend>
        <p className="mb-1 text-xs text-muted-foreground">
          Leave all unchecked for every category.
        </p>
        <CategoryPicker
          value={filters.categories}
          onChange={(categories) => {
            onChange({ categories });
          }}
        />
        {newsapiCapped && (
          <p className="mt-1 text-xs text-muted-foreground">
            NewsAPI uses your first {NEWSAPI_MAX_CATEGORIES} categories.
          </p>
        )}
      </fieldset>

      <SourceMultiSelect
        idPrefix={`${id}-source`}
        value={filters.sources}
        onChange={(sources) => {
          onChange({ sources });
        }}
      />
    </div>
  );
}
