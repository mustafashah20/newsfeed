import type { ComponentType, ReactNode } from 'react';

import type { Article } from '@/services/news/types';

import type { AggregatedArticles } from '../hooks/useAggregatedArticles';
import { ArticleList } from './ArticleList';
import type { TitleLinkProps } from './ArticleCard';
import { ArticleListSkeleton } from './ArticleListSkeleton';
import { ErrorState } from './ErrorState';
import { LoadMoreButton } from './LoadMoreButton';
import { SourceStatusBar } from './SourceStatusBar';

type ArticleResultsProps = {
  results: AggregatedArticles;
  TitleLink: ComponentType<TitleLinkProps>;
  /** Shown when every source answered but nothing matched (e.g. with "Clear filters"). */
  emptyState: ReactNode;
  renderActions?: (article: Article) => ReactNode;
};

/** Every async state of an article listing: skeleton, all-failed, empty, list + Load more. */
export function ArticleResults({
  results,
  TitleLink,
  emptyState,
  renderActions,
}: ArticleResultsProps) {
  return (
    <div className="flex flex-col gap-4">
      <SourceStatusBar sources={results.sources} onRetry={results.retry} />
      <ResultsBody
        results={results}
        TitleLink={TitleLink}
        emptyState={emptyState}
        renderActions={renderActions}
      />
    </div>
  );
}

function ResultsBody({ results, TitleLink, emptyState, renderActions }: ArticleResultsProps) {
  if (results.isInitialLoading) return <ArticleListSkeleton />;
  if (results.hasFailedEverywhere) {
    return (
      <ErrorState
        onRetry={() => {
          results.retry();
        }}
      />
    );
  }
  if (results.articles.length === 0) return emptyState;

  const count = results.articles.length;
  return (
    <>
      <p aria-live="polite" className="text-sm text-muted-foreground">
        Showing {count} {count === 1 ? 'article' : 'articles'}
      </p>
      <ArticleList
        articles={results.articles}
        TitleLink={TitleLink}
        renderActions={renderActions}
      />
      <LoadMoreButton
        hasMore={results.hasMore}
        isLoading={results.isFetchingMore}
        onLoadMore={results.loadMore}
      />
    </>
  );
}
