import type { ReactNode } from 'react';

import { EmptyState } from '@/features/articles';
import { categoryLabel } from '@/services/news/categories';

import type { FeedFilter } from '../feed-params';

type FeedEmptyStateProps = {
  filter: FeedFilter | undefined;
  /** E.g. "All stories". Preferences is already beside the chips, so not repeated here. */
  children?: ReactNode;
};

export function FeedEmptyState({ filter, children }: FeedEmptyStateProps) {
  if (!filter) {
    return (
      <EmptyState
        title="No articles for your preferences"
        description="Try more sources or fewer categories."
      >
        {children}
      </EmptyState>
    );
  }
  const label = categoryLabel(filter);
  return (
    <EmptyState
      title={`No ${label} stories yet`}
      description={`None of the stories loaded so far are in ${label}.`}
    >
      {children}
    </EmptyState>
  );
}
