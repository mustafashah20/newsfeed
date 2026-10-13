// NewsAPI.org. Quirks: /everything needs q and has no category; /top-headlines has category
// (one per request) but no dates, so those are filtered client-side; free plan: 100 req/day,
// first 100 results only, ~24 h delay, 30-day window; "[Removed]" placeholder items; content is
// truncated with "[+N chars]"; no id field (the URL is the id); short pages happen.
import { isWithinDays } from '@/lib/date';
import { isPresent } from '@/lib/utils';

import { parseResponse } from '../../http';
import type { NewsProvider, ProviderPage } from '../../types';
import { buildNewsapiRequests, fetchNewsapi, NEWSAPI_MAX_RESULTS } from './client';
import { toNewsapiArticle } from './mapper';
import { newsapiResponseSchema } from './schema';

export const newsapiProvider: NewsProvider = {
  id: 'newsapi',
  label: 'NewsAPI',
  async fetchPage(query, page, signal) {
    const pages = await Promise.all(
      buildNewsapiRequests(query, page).map(async (request): Promise<ProviderPage> => {
        const data = parseResponse(
          newsapiResponseSchema,
          await fetchNewsapi(request, signal),
          'newsapi',
        );
        const articles = data.articles
          .map((raw) => toNewsapiArticle(raw, request.category))
          .filter(isPresent);
        return {
          articles:
            request.path === '/top-headlines'
              ? articles.filter((a) => isWithinDays(a.publishedAt, query.from, query.to))
              : articles,
          // From totalResults, never from a short page (they happen even when more exist).
          hasMore: page * request.pageSize < Math.min(data.totalResults, NEWSAPI_MAX_RESULTS),
        };
      }),
    );
    return {
      articles: pages.flatMap((p) => p.articles),
      hasMore: pages.some((p) => p.hasMore),
    };
  },
};
