import { Link } from '@tanstack/react-router';
import { useId } from 'react';

import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ArticleResults, ReaderLink, useAggregatedArticles } from '@/features/articles';
import { FollowAuthorButton, useFollowedAuthors } from '@/features/preferences';
import type { Article } from '@/services/news/types';

import { useFeedParams } from '../hooks/useFeedParams';
import { FeedEmptyState } from './FeedEmptyState';
import { FeedHint } from './FeedHint';

export function FeedPage() {
  const feed = useFeedParams();
  const follow = useFollowedAuthors();
  const results = useAggregatedArticles({
    query: feed.query,
    providers: feed.sources,
    authors: feed.authors,
  });
  const switchId = useId();
  const followSwitchDisabled = feed.authors.length === 0 && !feed.onlyFollowed;

  const editPreferences = (
    <Button asChild variant="outline" className="h-11 px-4">
      <Link to="/preferences">Edit preferences</Link>
    </Button>
  );

  // Filtering by author happens here: no API filters by author consistently.
  const visible = feed.onlyFollowed
    ? { ...results, articles: results.articles.filter((a) => follow.isFollowing(a.author)) }
    : results;

  function renderActions(article: Article) {
    const { author } = article;
    if (!author) return null;
    return (
      <FollowAuthorButton
        author={author}
        isFollowing={follow.isFollowing(author)}
        onToggle={() => {
          follow.toggle(author);
        }}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Your feed"
        description="The latest articles from your preferred sources and categories."
      >
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <Switch
              id={switchId}
              checked={feed.onlyFollowed}
              disabled={followSwitchDisabled}
              aria-describedby={followSwitchDisabled ? `${switchId}-hint` : undefined}
              onCheckedChange={feed.setOnlyFollowed}
            />
            {/* The label is the touch target: full 44 px row. */}
            <label htmlFor={switchId} className="flex min-h-11 items-center text-sm">
              Only followed authors
            </label>
          </div>
          {followSwitchDisabled && (
            <p id={`${switchId}-hint`} className="text-xs text-muted-foreground">
              Follow an author to use this.
            </p>
          )}
        </div>
      </PageHeader>

      {feed.showHint && (
        <FeedHint
          onDismiss={feed.dismissHint}
          action={
            <Button asChild className="h-11 px-4">
              <Link to="/preferences">Set preferences</Link>
            </Button>
          }
        />
      )}

      <ArticleResults
        results={visible}
        TitleLink={ReaderLink}
        renderActions={renderActions}
        emptyState={
          <FeedEmptyState
            onlyFollowed={feed.onlyFollowed}
            followsAnyone={feed.authors.length > 0}
            action={editPreferences}
          />
        }
      />
    </div>
  );
}
