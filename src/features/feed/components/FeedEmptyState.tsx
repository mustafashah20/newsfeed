import type { ReactNode } from 'react';

import { EmptyState } from '@/features/articles';

type FeedEmptyStateProps = {
  onlyFollowed: boolean;
  followsAnyone: boolean;
  /** E.g. an "Edit preferences" link. */
  action: ReactNode;
};

export function FeedEmptyState({ onlyFollowed, followsAnyone, action }: FeedEmptyStateProps) {
  if (!onlyFollowed) {
    return (
      <EmptyState
        title="No articles for your preferences"
        description="Try more sources or fewer categories."
      >
        {action}
      </EmptyState>
    );
  }
  if (!followsAnyone) {
    return (
      <EmptyState
        title="You don’t follow anyone yet"
        description="Follow authors from any article, or add them in your preferences."
      >
        {action}
      </EmptyState>
    );
  }
  return (
    <EmptyState
      title="Nothing new from the authors you follow"
      description="Turn off “Only followed authors” to see everything, or follow more authors."
    >
      {action}
    </EmptyState>
  );
}
