// The Guardian Open Platform. Quirks: categories are "sections" (sport, culture, society…);
// show-fields is required for trailText/thumbnail/byline; trailText is HTML; ids contain
// slashes; results include liveblogs; attribution ("The Guardian" + webUrl) is required.
import { isPresent } from '@/lib/utils';

import { parseResponse } from '../../http';
import type { NewsProvider } from '../../types';
import { searchGuardian } from './client';
import { toGuardianArticle } from './mapper';
import { guardianSearchSchema } from './schema';

export const guardianProvider: NewsProvider = {
  id: 'guardian',
  label: 'The Guardian',
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
};
