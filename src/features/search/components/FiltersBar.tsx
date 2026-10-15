import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { CLEAR_ACTION } from '../lib/filter-styles';
import type { SearchFilters } from '../search-params';
import { CategoryFilter } from './CategoryFilter';
import { DateFilterPopover } from './DateFilterPopover';
import { SourcesFilter } from './SourcesFilter';

type FiltersBarProps = {
  filters: SearchFilters;
  hasActiveFilters: boolean;
  onChange: (patch: Partial<SearchFilters>) => void;
  onClear: () => void;
  className?: string;
};

/**
 * Date, category and sources as pills that open their own panels, for screens with room for them
 * (the popup covers small screens). A set pill turns dark and shows its value, so there are no
 * separate chips. Category and sources apply with "Apply" (one search per change, not per tick);
 * a quick date range is a single choice and applies at once.
 */
export function FiltersBar({
  filters,
  hasActiveFilters,
  onChange,
  onClear,
  className,
}: FiltersBarProps) {
  return (
    <div
      role="group"
      aria-label="Filters"
      className={cn('flex flex-wrap items-center gap-2', className)}
    >
      <DateFilterPopover
        from={filters.from}
        to={filters.to}
        onChange={(range) => {
          onChange(range);
        }}
      />
      <CategoryFilter
        value={filters.categories}
        onChange={(categories) => {
          onChange({ categories });
        }}
        sources={filters.sources}
      />
      <SourcesFilter
        value={filters.sources}
        onChange={(sources) => {
          onChange({ sources });
        }}
      />
      {hasActiveFilters && (
        <Button
          variant="ghost"
          className={cn(CLEAR_ACTION, 'hover:bg-transparent')}
          onClick={onClear}
        >
          Clear filters
        </Button>
      )}
    </div>
  );
}
