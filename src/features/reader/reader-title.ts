import type { QueryClient } from '@tanstack/react-query';

import { articleKeys } from '@/services/news/query-keys';
import type { ArticleDetail, ProviderId } from '@/services/news/types';

/** The page title from whatever the cache already has (fetched detail, else the card preview). */
export function readerTitle(queryClient: QueryClient, provider: ProviderId, id: string) {
  const cached =
    queryClient.getQueryData<ArticleDetail>(articleKeys.detail(provider, id)) ??
    queryClient.getQueryData<ArticleDetail>(articleKeys.preview(provider, id));
  return cached?.title;
}
