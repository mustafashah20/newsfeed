// NYT Article Search. Quirks: 5 requests/min (no retries on 429, long cache); page is 0-based
// and capped at 100; fixed 10 docs per page; hits caps at 10000; categories filter via
// fq=section.name:(…); no lead_paragraph in current responses; byline starts with "By ".
// No full text: the reader gets the preview, looked up by _id only when nothing is cached.
import { isPresent } from '@/lib/type-guards';

import { ApiError, parseResponse } from '../../http';
import { toPreviewDetail } from '../../preview';
import type { ArticleDetailSource, NewsProvider } from '../../types';
import { fetchNytById, NYT_MAX_PAGE_INDEX, NYT_PAGE_SIZE, searchNyt } from './client';
import { toNytArticle } from './mapper';
import { nytSearchSchema } from './schema';

const MAX_REACHABLE_RESULTS = (NYT_MAX_PAGE_INDEX + 1) * NYT_PAGE_SIZE;

export const nytProvider: NewsProvider & ArticleDetailSource = {
  id: 'nyt',
  label: 'The New York Times',
  providesFullText: false,

  async fetchPage(query, page, signal) {
    const { response } = parseResponse(
      nytSearchSchema,
      await searchNyt(query, page, signal),
      'nyt',
    );
    const { hits, offset } = response.metadata;
    return {
      articles: response.docs.map(toNytArticle).filter(isPresent),
      hasMore: offset + response.docs.length < Math.min(hits, MAX_REACHABLE_RESULTS),
    };
  },

  async fetchArticle(externalId, signal) {
    const { response } = parseResponse(
      nytSearchSchema,
      await fetchNytById(externalId, signal),
      'nyt',
    );
    const article = response.docs.map(toNytArticle).find((a) => a?.externalId === externalId);
    if (!article) {
      throw new ApiError({
        status: 404,
        code: 'not_found',
        provider: 'nyt',
        message: 'No such article',
      });
    }
    return toPreviewDetail(article);
  },
};
