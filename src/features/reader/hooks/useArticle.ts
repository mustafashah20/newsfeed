import { skipToken, useQuery } from '@tanstack/react-query';

import { ApiError } from '@/services/news/http';
import { articleKeys } from '@/services/news/query-keys';
import { providers } from '@/services/news/registry';
import { supportsArticleDetail } from '@/services/news/types';
import type { ArticleDetail, ProviderId } from '@/services/news/types';

// The full body changes rarely; don't spend quota re-fetching it while reading.
const DETAIL_STALE_TIME_MS = 30 * 60_000;

export type ArticleState =
  | { status: 'loading' }
  | { status: 'unavailable' }
  | { status: 'error'; error: unknown; retry: () => void }
  | {
      status: 'ready';
      article: ArticleDetail;
      /** The preview is showing while the full body loads. */
      isLoadingFullText: boolean;
      /** The full body failed, so the preview stays (with this error to show and retry). */
      fullTextError: unknown;
      retry: () => void;
    };

const isNotFound = (error: unknown) => error instanceof ApiError && error.code === 'not_found';

/**
 * One article for the reader (docs/architecture.md → Article reader). The card's preview is
 * seeded on click under `preview`; `detail` holds only what `fetchArticle` returned, so a
 * seeded preview never counts as fresh detail and blocks the full-text fetch.
 */
export function useArticle(provider: ProviderId, externalId: string): ArticleState {
  const source = providers[provider];
  const detailSource = supportsArticleDetail(source) ? source : null;

  // Cache only: written by ReaderLink, never fetched.
  const { data: preview } = useQuery<ArticleDetail>({
    queryKey: articleKeys.preview(provider, externalId),
    queryFn: skipToken,
  });

  // Full text (Guardian) always; a lookup (NYT) only when no preview is cached; else nothing.
  const canFetch =
    detailSource !== null &&
    externalId !== '' &&
    (detailSource.providesFullText || preview === undefined);

  const detail = useQuery({
    queryKey: articleKeys.detail(provider, externalId),
    queryFn: canFetch ? ({ signal }) => detailSource.fetchArticle(externalId, signal) : skipToken,
    placeholderData: preview,
    staleTime: DETAIL_STALE_TIME_MS,
  });

  const retry = () => {
    void detail.refetch();
  };

  if (!externalId) return { status: 'unavailable' };

  const article = detail.data ?? preview;
  if (article) {
    return {
      status: 'ready',
      article,
      isLoadingFullText: canFetch && detail.isPlaceholderData && detail.isFetching,
      fullTextError: detail.isError ? detail.error : null,
      retry,
    };
  }
  if (canFetch && detail.isPending) return { status: 'loading' };
  if (detail.isError && !isNotFound(detail.error)) {
    return { status: 'error', error: detail.error, retry };
  }
  // NewsAPI opened directly (no lookup by id), an unknown id, or an article that's gone.
  return { status: 'unavailable' };
}
