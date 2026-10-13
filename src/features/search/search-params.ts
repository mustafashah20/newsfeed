import { z } from 'zod';

import { CATEGORIES } from '@/services/news/categories';
import type { Category } from '@/services/news/categories';
import { PROVIDER_IDS } from '@/services/news/types';
import type { ProviderId, ProviderQuery } from '@/services/news/types';

// Every field falls back instead of failing, so a hand-edited or stale URL still renders.
// Defaults (no dates, all categories, all sources) are left out of the URL entirely.
export const searchParamsSchema = z.object({
  q: z.string().trim().catch(''),
  from: z.iso.date().optional().catch(undefined),
  to: z.iso.date().optional().catch(undefined),
  category: z.enum(CATEGORIES).optional().catch(undefined),
  sources: z.array(z.enum(PROVIDER_IDS)).min(1).optional().catch(undefined),
});

export type SearchParams = z.infer<typeof searchParamsSchema>;

/** The filters with defaults applied: what the page and the hooks work with. */
export type SearchFilters = {
  q: string;
  from?: string;
  to?: string;
  category?: Category;
  sources: ProviderId[];
};

export function toSearchFilters(params: SearchParams): SearchFilters {
  // A reversed range is a typo, not an empty result.
  const [from, to] =
    params.from && params.to && params.from > params.to
      ? [params.to, params.from]
      : [params.from, params.to];
  return {
    q: params.q,
    from,
    to,
    category: params.category,
    sources: params.sources
      ? PROVIDER_IDS.filter((id) => params.sources?.includes(id))
      : [...PROVIDER_IDS],
  };
}

/** Back to URL form: drops defaults so shared links stay short. */
export function toSearchParams(filters: SearchFilters): SearchParams {
  const allSources = PROVIDER_IDS.every((id) => filters.sources.includes(id));
  return {
    q: filters.q,
    from: filters.from,
    to: filters.to,
    category: filters.category,
    sources: allSources || filters.sources.length === 0 ? undefined : filters.sources,
  };
}

export function toProviderQuery(filters: SearchFilters): ProviderQuery {
  return {
    q: filters.q || undefined,
    from: filters.from,
    to: filters.to,
    categories: filters.category ? [filters.category] : [],
  };
}

export function hasActiveFilters(filters: SearchFilters) {
  return Boolean(
    filters.from || filters.to || filters.category || filters.sources.length < PROVIDER_IDS.length,
  );
}
