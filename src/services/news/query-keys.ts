import type { Category } from './categories';
import type { ProviderId, ProviderQuery } from './types';

type NormalizedQuery = {
  q?: string;
  from?: string;
  to?: string;
  categories: Category[];
};

/** Equivalent filters → identical key: trims q, drops empty values, sorts and dedupes categories. */
export function normalizeQuery(query: ProviderQuery): NormalizedQuery {
  const normalized: NormalizedQuery = { categories: [...new Set(query.categories)].sort() };
  const q = query.q?.trim();
  if (q) normalized.q = q;
  if (query.from) normalized.from = query.from;
  if (query.to) normalized.to = query.to;
  return normalized;
}

// The only source of article query keys.
export const articleKeys = {
  all: ['articles'] as const,
  page: (provider: ProviderId, query: ProviderQuery, page: number) =>
    [...articleKeys.all, provider, normalizeQuery(query), page] as const,
  detail: (provider: ProviderId, externalId: string) =>
    [...articleKeys.all, 'detail', provider, externalId] as const,
  preview: (provider: ProviderId, externalId: string) =>
    [...articleKeys.all, 'preview', provider, externalId] as const,
};
