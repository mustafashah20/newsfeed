import { PageHeader } from '@/components/layout/PageHeader';
import { PAGE_STACK_CLASS } from '@/components/layout/page-styles';
import { Button } from '@/components/ui/button';
import { ArticleResults, EmptyState, ReaderLink, useAggregatedArticles } from '@/features/articles';
import { PROVIDER_IDS } from '@/services/news/types';

import { useSearchFilters } from '../hooks/useSearchFilters';
import { hasActiveFilters, toProviderQuery } from '../search-params';
import { ActiveFilterChips } from './ActiveFilterChips';
import { FiltersBar } from './FiltersBar';
import { FiltersDialog } from './FiltersDialog';
import { SearchBar } from './SearchBar';

export function SearchPage() {
  const { filters, updateFilters, clearFilters } = useSearchFilters();
  const results = useAggregatedArticles({
    query: toProviderQuery(filters),
    providers: filters.sources,
  });
  const filtersActive = hasActiveFilters(filters);
  const activeCount = [
    filters.from || filters.to,
    filters.categories.length > 0,
    filters.sources.length < PROVIDER_IDS.length,
  ].filter(Boolean).length;

  return (
    <div className={PAGE_STACK_CLASS}>
      <PageHeader
        title={filters.q ? `Results for “${filters.q}”` : 'Search'}
        description={
          // Without a keyword the page lists the latest articles; the subtitle says so.
          filters.q
            ? 'Search NewsAPI, The Guardian and The New York Times.'
            : 'The latest articles from your sources. Type a keyword to search.'
        }
      />
      {/* The keyword field, then the filters in a row 16px below it. */}
      <div className="flex flex-col gap-4">
        <SearchBar
          key={filters.q}
          defaultValue={filters.q}
          onSearch={(q) => {
            updateFilters({ q });
          }}
        />
        {/* From md there's room for the controls themselves. */}
        <FiltersBar
          filters={filters}
          hasActiveFilters={filtersActive}
          onChange={updateFilters}
          onClear={clearFilters}
          className="hidden md:flex"
        />
        {/* Small screens: a Filters popup plus removable chips. */}
        <div className="flex flex-wrap items-center gap-2 md:hidden">
          <FiltersDialog filters={filters} activeCount={activeCount} onApply={updateFilters} />
          <ActiveFilterChips filters={filters} onChange={updateFilters} onClear={clearFilters} />
        </div>
      </div>
      <section aria-label="Results" className="flex min-w-0 flex-col gap-4">
        <ArticleResults
          results={results}
          TitleLink={ReaderLink}
          emptyState={
            <EmptyState
              title="No articles match"
              description={
                filtersActive
                  ? 'Try a different keyword, or loosen the date, category or source filters.'
                  : 'Try a different keyword.'
              }
            >
              {filtersActive && (
                <Button variant="outline" className="h-11 px-4" onClick={clearFilters}>
                  Clear filters
                </Button>
              )}
            </EmptyState>
          }
        />
      </section>
    </div>
  );
}
