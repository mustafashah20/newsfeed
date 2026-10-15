import { getRouteApi } from '@tanstack/react-router';

import { PROVIDER_IDS } from '@/services/news/types';

import { toSearchFilters, toSearchParams } from '../search-params';
import type { SearchFilters } from '../search-params';

const route = getRouteApi('/search');

/** Search filters read from and written to the URL, the only place they live. */
export function useSearchFilters() {
  const filters = toSearchFilters(route.useSearch());
  const navigate = route.useNavigate();

  function updateFilters(patch: Partial<SearchFilters>) {
    void navigate({ search: toSearchParams({ ...filters, ...patch }) });
  }

  /** Resets date, categories and sources; keeps the keyword. */
  function clearFilters() {
    updateFilters({
      from: undefined,
      to: undefined,
      categories: [],
      sources: [...PROVIDER_IDS],
    });
  }

  return { filters, updateFilters, clearFilters };
}
