import { z } from 'zod';

import { CATEGORIES } from '@/services/news/categories';
import type { Category } from '@/services/news/categories';
import { NEWSAPI_MAX_CATEGORIES } from '@/services/news/providers/newsapi/client';
import { PROVIDER_IDS } from '@/services/news/types';
import type { ProviderId, ProviderQuery } from '@/services/news/types';

// Every field falls back instead of failing, so a hand-edited or stale URL still renders.
// Defaults (no dates, all categories, all sources) are left out of the URL entirely.
export const searchParamsSchema = z.object({
  q: z.string().trim().catch(''),
  from: z.iso.date().optional().catch(undefined),
  to: z.iso.date().optional().catch(undefined),
  // Unknown entries are dropped one by one, so one bad value doesn't lose the rest.
  categories: z
    .array(z.unknown())
    .transform((values) => CATEGORIES.filter((c) => values.includes(c)))
    .optional()
    .catch(undefined),
  /** Read only: single-category links from before multi-select still open. Never written. */
  category: z.enum(CATEGORIES).optional().catch(undefined),
  sources: z.array(z.enum(PROVIDER_IDS)).min(1).optional().catch(undefined),
});

export type SearchParams = z.infer<typeof searchParamsSchema>;

/** The filters with defaults applied: what the page and the hooks work with. */
export type SearchFilters = {
  q: string;
  from?: string;
  to?: string;
  /** Empty = all categories. In table order. */
  categories: Category[];
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
    categories: CATEGORIES.filter((c) => params.categories?.includes(c) || params.category === c),
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
    categories:
      filters.categories.length > 0
        ? CATEGORIES.filter((c) => filters.categories.includes(c))
        : undefined,
    category: undefined,
    sources: allSources || filters.sources.length === 0 ? undefined : filters.sources,
  };
}

export function toProviderQuery(filters: SearchFilters): ProviderQuery {
  return {
    q: filters.q || undefined,
    from: filters.from,
    to: filters.to,
    categories: [...filters.categories],
  };
}

/**
 * NewsAPI takes one category per request, so its adapter asks for at most the first few; the
 * filters say so when more are picked.
 */
export function isNewsapiCategoryCapped(filters: Pick<SearchFilters, 'categories' | 'sources'>) {
  return filters.sources.includes('newsapi') && filters.categories.length > NEWSAPI_MAX_CATEGORIES;
}

export function hasActiveFilters(filters: SearchFilters) {
  return Boolean(
    filters.from ||
    filters.to ||
    filters.categories.length > 0 ||
    filters.sources.length < PROVIDER_IDS.length,
  );
}
