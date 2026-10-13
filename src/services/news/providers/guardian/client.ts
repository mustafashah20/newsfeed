import { toProviderCategory } from '../../categories';
import { createApiClient } from '../../http';
import type { ProviderQuery } from '../../types';

export const GUARDIAN_PAGE_SIZE = 12;

// Without show-fields the API returns no description, image or author.
const SEARCH_FIELDS = 'trailText,thumbnail,byline';
const ITEM_FIELDS = 'body,byline,thumbnail,trailText';

const client = createApiClient('guardian');

/** ProviderQuery + 1-based page → /search params. Empty values are dropped by the http client. */
export function buildGuardianSearchParams(query: ProviderQuery, page: number) {
  return {
    q: query.q,
    // Sections OR together with `|`.
    section: query.categories.map((c) => toProviderCategory('guardian', c)).join('|'),
    'from-date': query.from,
    'to-date': query.to,
    'order-by': 'newest',
    page,
    'page-size': GUARDIAN_PAGE_SIZE,
    'show-fields': SEARCH_FIELDS,
  };
}

export async function searchGuardian(query: ProviderQuery, page: number, signal: AbortSignal) {
  const { data } = await client.get<unknown>('/search', {
    params: buildGuardianSearchParams(query, page),
    signal,
  });
  return data;
}

/** Guardian ids contain slashes ("film/2026/oct/13/slug"): encode each segment, keep the slashes. */
export function guardianItemPath(id: string) {
  return `/${id.split('/').map(encodeURIComponent).join('/')}`;
}

export async function fetchGuardianItem(id: string, signal: AbortSignal) {
  const { data } = await client.get<unknown>(guardianItemPath(id), {
    // show-elements=image adds the larger hero image.
    params: { 'show-fields': ITEM_FIELDS, 'show-elements': 'image' },
    signal,
  });
  return data;
}
