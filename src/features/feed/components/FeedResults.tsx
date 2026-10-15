import type { ComponentType, ReactNode } from 'react';

import { ErrorState } from '@/features/articles';
import type { AggregatedArticles, TitleLinkProps } from '@/features/articles';
import type { Article } from '@/services/news/types';

import type { useStoryReveal } from '../hooks/useStoryReveal';
import { FeedSkeleton } from './FeedSkeleton';
import { FeedStories } from './FeedStories';
import { ShowMoreStories } from './ShowMoreStories';

type FeedResultsProps = {
  results: AggregatedArticles;
  /** The loaded stories that match the selected chip. */
  stories: readonly Article[];
  reveal: ReturnType<typeof useStoryReveal>;
  TitleLink: ComponentType<TitleLinkProps>;
  emptyState: ReactNode;
};

/** Every async state of the feed: skeleton, all-failed, empty, stories + Show more. */
export function FeedResults({ results, stories, reveal, TitleLink, emptyState }: FeedResultsProps) {
  if (results.isInitialLoading) return <FeedSkeleton />;
  if (results.hasFailedEverywhere) {
    return (
      <ErrorState
        onRetry={() => {
          results.retry();
        }}
      />
    );
  }

  const showMore = (
    <ShowMoreStories
      shown={reveal.shown}
      canShowMore={reveal.canShowMore}
      isLoading={results.isFetchingMore}
      onShowMore={reveal.showMore}
    />
  );

  // A chip can match nothing loaded yet while older pages may still hold matches.
  if (stories.length === 0) {
    return (
      <>
        {emptyState}
        {(results.hasMore || results.isFetchingMore) && showMore}
      </>
    );
  }

  return (
    <>
      <FeedStories stories={stories.slice(0, reveal.shown)} TitleLink={TitleLink} />
      {showMore}
    </>
  );
}
