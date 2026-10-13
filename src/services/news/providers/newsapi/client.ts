import { daysAgo, laterDay } from '@/lib/date';

import { toProviderCategory } from '../../categories';
import type { Category } from '../../categories';
import { createApiClient } from '../../http';
import type { ProviderQuery } from '../../types';

export const NEWSAPI_PAGE_SIZE = 12;
/** /top-headlines takes one category, so each costs a request; cap the fan-out. */
export const NEWSAPI_MAX_CATEGORIES = 3;
/** The free (Developer) plan serves only the first 100 results of any query. */
export const NEWSAPI_MAX_RESULTS = 100;
/** The free plan's /everything search window. */
export const NEWSAPI_WINDOW_DAYS = 30;

export type NewsapiRequest = {
  path: '/everything' | '/top-headlines';
  params: Record<string, string | number | undefined>;
  /** The category the results are tagged with (NewsAPI items carry none). */
  category: Category | null;
  pageSize: number;
};

const client = createApiClient('newsapi');

/**
 * ProviderQuery + 1-based page → the request(s) to make:
 * - categories → one /top-headlines per category (max 3, page size split); no date params there,
 *   so the caller filters dates client-side;
 * - keyword, no category → /everything (dates supported, `from` clamped to the 30-day window);
 * - neither → /top-headlines (/everything requires q).
 */
export function buildNewsapiRequests(
  query: ProviderQuery,
  page: number,
  now = new Date(),
): NewsapiRequest[] {
  const categories = query.categories.slice(0, NEWSAPI_MAX_CATEGORIES);

  if (categories.length > 0) {
    const pageSize = Math.ceil(NEWSAPI_PAGE_SIZE / categories.length);
    return categories.map((category) => ({
      path: '/top-headlines',
      category,
      pageSize,
      params: {
        country: 'us',
        category: toProviderCategory('newsapi', category),
        q: query.q,
        page,
        pageSize,
      },
    }));
  }

  if (query.q) {
    return [
      {
        path: '/everything',
        category: null,
        pageSize: NEWSAPI_PAGE_SIZE,
        params: {
          q: query.q,
          language: 'en',
          sortBy: 'publishedAt',
          from: query.from && laterDay(query.from, daysAgo(NEWSAPI_WINDOW_DAYS, now)),
          to: query.to,
          page,
          pageSize: NEWSAPI_PAGE_SIZE,
        },
      },
    ];
  }

  return [
    {
      path: '/top-headlines',
      category: null,
      pageSize: NEWSAPI_PAGE_SIZE,
      params: { country: 'us', page, pageSize: NEWSAPI_PAGE_SIZE },
    },
  ];
}

export async function fetchNewsapi(request: NewsapiRequest, signal: AbortSignal) {
  const { data } = await client.get<unknown>(request.path, { params: request.params, signal });
  return data;
}
