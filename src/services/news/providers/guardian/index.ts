// The Guardian Open Platform. Quirks: categories are "sections" (sport, culture, society…);
// show-fields is required for trailText/thumbnail/byline; trailText is HTML; ids contain
// slashes; results include liveblogs; attribution ("The Guardian" + webUrl) is required.
// The only source with full text: GET /{id}?show-fields=body (response.content, not results).
import { isPresent } from '@/lib/type-guards';

import { ApiError, parseResponse } from '../../http';
import type { ArticleDetailSource, NewsProvider } from '../../types';
import { fetchGuardianItem, searchGuardian } from './client';
import { toGuardianArticle, toGuardianDetail } from './mapper';
import { guardianItemResponseSchema, guardianSearchSchema } from './schema';

export const guardianProvider: NewsProvider & ArticleDetailSource = {
  id: 'guardian',
  label: 'The Guardian',
  providesFullText: true,

  async fetchPage(query, page, signal) {
    const { response } = parseResponse(
      guardianSearchSchema,
      await searchGuardian(query, page, signal),
      'guardian',
    );
    return {
      articles: response.results.map(toGuardianArticle).filter(isPresent),
      hasMore: response.currentPage < response.pages,
    };
  },

  async fetchArticle(externalId, signal) {
    const { response } = parseResponse(
      guardianItemResponseSchema,
      await fetchGuardianItem(externalId, signal),
      'guardian',
    );
    const detail = toGuardianDetail(response.content);
    if (!detail) {
      throw new ApiError({
        status: 200,
        code: 'invalid_response',
        provider: 'guardian',
        message: 'Item lacks what the reader needs',
      });
    }
    return detail;
  },
};
