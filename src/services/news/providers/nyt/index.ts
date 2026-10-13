// NYT Article Search. Quirks: 5 requests/min (no retries on 429, long cache); page is 0-based
// and capped at 100; fixed 10 docs per page; hits caps at 10000; categories filter via
// fq=section.name:(…); no lead_paragraph in current responses; byline starts with "By ".
import { isPresent } from '@/lib/utils';

import { parseResponse } from '../../http';
import type { NewsProvider } from '../../types';
import { NYT_MAX_PAGE_INDEX, NYT_PAGE_SIZE, searchNyt } from './client';
import { toNytArticle } from './mapper';
import { nytSearchSchema } from './schema';

const MAX_REACHABLE_RESULTS = (NYT_MAX_PAGE_INDEX + 1) * NYT_PAGE_SIZE;

export const nytProvider: NewsProvider = {
  id: 'nyt',
  label: 'The New York Times',
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
};
