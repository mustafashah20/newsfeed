import { useQueries, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { isByPreferredAuthor } from '@/lib/bylines';
import { articleKeys, normalizeQuery } from '@/services/news/query-keys';
import { providers } from '@/services/news/registry';
import type { Article, ProviderId, ProviderPage, ProviderQuery } from '@/services/news/types';

import { combineBatches } from '../lib/merge';

export type SourceStatus =
  { status: 'loading' } | { status: 'success' } | { status: 'error'; error: unknown };

export type SourceState = { provider: ProviderId; label: string } & SourceStatus;

type AggregatedArticlesOptions = {
  query: ProviderQuery;
  providers: readonly ProviderId[];
  /** Preferred authors: their articles move to the top of each batch. */
  authors?: readonly string[];
};

// NYT allows 5 requests a minute: keep its pages fresh for longer than the app default.
const STALE_TIME_MS: Partial<Record<ProviderId, number>> = { nyt: 15 * 60_000 };

type PageRef = { provider: ProviderId; page: number };

/**
 * Articles from several providers, merged page by page. Each provider × page is its own query,
 * so sources cache and fail independently and toggling one never refetches the others.
 */
export function useAggregatedArticles({
  query,
  providers: selected,
  authors = [],
}: AggregatedArticlesOptions) {
  const queryClient = useQueryClient();

  // Paging restarts when the filters change: compare a key during render instead of syncing
  // state in an effect.
  const pagingKey = JSON.stringify([normalizeQuery(query), [...selected].sort()]);
  const [paging, setPaging] = useState({ key: pagingKey, count: 1 });
  const pageCount = paging.key === pagingKey ? paging.count : 1;

  // Page n+1 only for providers whose page n said there is more. When page n arrives, the
  // queries below re-render this hook and the next page joins the list.
  const pageRefs: PageRef[] = selected.flatMap((provider) => {
    const refs: PageRef[] = [{ provider, page: 1 }];
    for (let page = 2; page <= pageCount; page++) {
      const previous = queryClient.getQueryData<ProviderPage>(
        articleKeys.page(provider, query, page - 1),
      );
      if (!previous?.hasMore) break;
      refs.push({ provider, page });
    }
    return refs;
  });

  const results = useQueries({
    queries: pageRefs.map(({ provider, page }) => {
      const staleTime = STALE_TIME_MS[provider];
      return {
        queryKey: articleKeys.page(provider, query, page),
        queryFn: ({ signal }: { signal: AbortSignal }) =>
          providers[provider].fetchPage(query, page, signal),
        ...(staleTime !== undefined && { staleTime }),
      };
    }),
  });

  const entries = pageRefs.map((ref, i) => ({ ...ref, result: results[i] }));

  const batches: Article[][] = Array.from({ length: pageCount }, () => []);
  for (const { page, result } of entries) {
    if (result?.data) batches[page - 1]?.push(...result.data.articles);
  }
  const articles = combineBatches(batches, (a) => isByPreferredAuthor(a.author, authors));

  const sources: SourceState[] = selected.map((provider) => {
    const own = entries.filter((e) => e.provider === provider);
    const failed = own.find((e) => e.result?.isError);
    const base = { provider, label: providers[provider].label };
    if (failed) return { ...base, status: 'error', error: failed.result?.error };
    if (own.some((e) => e.result?.isPending)) return { ...base, status: 'loading' };
    return { ...base, status: 'success' };
  });

  const isFetchingMore = entries.some((e) => e.page > 1 && e.result?.isPending);
  const hasMore =
    !isFetchingMore &&
    selected.some((provider) => {
      const last = entries.filter((e) => e.provider === provider).at(-1);
      return last?.result?.data?.hasMore === true;
    });
  const isInitialLoading =
    articles.length === 0 && entries.some((e) => e.page === 1 && e.result?.isPending);
  const hasFailedEverywhere =
    articles.length === 0 && sources.length > 0 && sources.every((s) => s.status === 'error');

  function loadMore() {
    if (!hasMore) return;
    setPaging({ key: pagingKey, count: pageCount + 1 });
  }

  /** Refetches the failed pages of one provider, or of all providers. */
  function retry(provider?: ProviderId) {
    for (const entry of entries) {
      if (provider && entry.provider !== provider) continue;
      if (entry.result?.isError) void entry.result.refetch();
    }
  }

  return {
    articles,
    sources,
    isInitialLoading,
    isFetchingMore,
    hasMore,
    hasFailedEverywhere,
    loadMore,
    retry,
  };
}

export type AggregatedArticles = ReturnType<typeof useAggregatedArticles>;
