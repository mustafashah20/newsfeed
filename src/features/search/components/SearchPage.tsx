import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { ArticleResults, EmptyState, ReaderLink, useAggregatedArticles } from '@/features/articles';
import { PROVIDER_IDS } from '@/services/news/types';

import { useSearchFilters } from '../hooks/useSearchFilters';
import { hasActiveFilters, toProviderQuery } from '../search-params';
import { ActiveFilterChips } from './ActiveFilterChips';
import { FiltersPanel } from './FiltersPanel';
import { FiltersSheet } from './FiltersSheet';
import { KeywordPrompt } from './KeywordPrompt';
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
    filters.category,
    filters.sources.length < PROVIDER_IDS.length,
  ].filter(Boolean).length;

  const panel = <FiltersPanel filters={filters} onChange={updateFilters} />;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={filters.q ? `Results for “${filters.q}”` : 'Search'}
        description="Search NewsAPI, The Guardian and The New York Times."
      />
      <SearchBar
        key={filters.q}
        defaultValue={filters.q}
        onSearch={(q) => {
          updateFilters({ q });
        }}
      />
      <div className="flex flex-wrap items-center gap-2">
        <FiltersSheet activeCount={activeCount} className="lg:hidden">
          {panel}
        </FiltersSheet>
        <ActiveFilterChips filters={filters} onChange={updateFilters} onClear={clearFilters} />
      </div>
      <div className="grid gap-6 lg:grid-cols-4">
        <aside aria-label="Filters" className="hidden lg:block">
          {panel}
        </aside>
        <section aria-label="Results" className="flex min-w-0 flex-col gap-4 lg:col-span-3">
          {!filters.q && <KeywordPrompt />}
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
    </div>
  );
}
