import { SlidersHorizontalIcon } from 'lucide-react';
import { useState } from 'react';
import type { MouseEvent } from 'react';

import { PAGE_STACK_CLASS } from '@/components/layout/page-styles';
import { Button } from '@/components/ui/button';
import { ReaderLink, SourceStatusBar, useAggregatedArticles } from '@/features/articles';
import { PreferencesDialog, useEditablePreferences } from '@/features/preferences';
import { formatDayHeading } from '@/lib/date';
import { categoryLabel } from '@/services/news/categories';
import { providers } from '@/services/news/registry';

import { useFeedParams } from '../hooks/useFeedParams';
import { useStoryReveal } from '../hooks/useStoryReveal';
import { filterStories, joinNames } from '../lib/stories';
import type { FeedChip } from './FeedChips';
import { FeedChips } from './FeedChips';
import { FeedEmptyState } from './FeedEmptyState';
import { FeedHeader } from './FeedHeader';
import { FeedHint } from './FeedHint';
import { FeedResults } from './FeedResults';

export function FeedPage() {
  const feed = useFeedParams();
  const editable = useEditablePreferences();
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [preferencesOpener, setPreferencesOpener] = useState<HTMLElement | null>(null);
  const results = useAggregatedArticles({
    query: feed.query,
    providers: feed.sources,
    authors: feed.authors,
  });
  const stories = filterStories(results.articles, feed.filter);
  const reveal = useStoryReveal({
    total: stories.length,
    hasMore: results.hasMore,
    onLoadMore: results.loadMore,
    resetKey: feed.filter ?? 'all',
  });

  const chips: FeedChip[] = [
    { value: undefined, label: 'All stories' },
    ...feed.chipCategories.map((c) => ({ value: c, label: categoryLabel(c) })),
  ];

  const sourceNames = joinNames(feed.sources.map((id) => providers[id].label));
  const loaded = results.articles.length;
  const summary =
    loaded > 0
      ? `${loaded} ${loaded === 1 ? 'story' : 'stories'} from ${sourceNames}`
      : `Stories from ${sourceNames}`;

  function openPreferences(event: MouseEvent<HTMLButtonElement>) {
    setPreferencesOpener(event.currentTarget);
    setPreferencesOpen(true);
  }

  return (
    <div className={PAGE_STACK_CLASS}>
      <FeedHeader dateline={formatDayHeading()} summary={summary} />
      {/* Preferences sits beside the chips: they show what the preferences pick. */}
      <div className="flex items-start gap-2 md:border-b md:pb-5">
        <FeedChips chips={chips} value={feed.filter} onChange={feed.setFilter} />
        <Button
          variant="outline"
          aria-haspopup="dialog"
          className="h-11 shrink-0 rounded-full border-input px-4"
          onClick={openPreferences}
        >
          <SlidersHorizontalIcon aria-hidden="true" />
          Preferences
        </Button>
      </div>

      {feed.showHint && (
        <FeedHint
          onDismiss={feed.dismissHint}
          action={
            <Button aria-haspopup="dialog" className="h-11 px-4" onClick={openPreferences}>
              Set preferences
            </Button>
          }
        />
      )}

      <SourceStatusBar sources={results.sources} onRetry={results.retry} />

      <div className="flex flex-col">
        <FeedResults
          results={results}
          stories={stories}
          reveal={reveal}
          TitleLink={ReaderLink}
          emptyState={
            <FeedEmptyState filter={feed.filter}>
              {feed.filter && (
                <Button
                  className="h-11 px-4"
                  onClick={() => {
                    feed.setFilter(undefined);
                  }}
                >
                  All stories
                </Button>
              )}
            </FeedEmptyState>
          }
        />
      </div>

      <PreferencesDialog
        open={preferencesOpen}
        onOpenChange={setPreferencesOpen}
        returnFocusTo={preferencesOpener}
        preferences={editable.preferences}
        onSave={editable.save}
      />
    </div>
  );
}
