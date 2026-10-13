import { useId } from 'react';

import { NEWSAPI_WINDOW_DAYS } from '@/services/news/providers/newsapi/client';

import type { SearchFilters } from '../search-params';
import { CategorySelect } from './CategorySelect';
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
  const categoryId = `${id}-category`;

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

      <div className="flex flex-col gap-2">
        <label htmlFor={categoryId} className="text-sm font-medium">
          Category
        </label>
        <CategorySelect
          id={categoryId}
          value={filters.category}
          onChange={(category) => {
            onChange({ category });
          }}
        />
      </div>

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
