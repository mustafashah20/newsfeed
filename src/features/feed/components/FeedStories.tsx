import type { ComponentType } from 'react';
import { useId } from 'react';

import type { TitleLinkProps } from '@/features/articles';
import type { Article } from '@/services/news/types';

import { splitStories } from '../lib/stories';
import { CompactStory } from './CompactStory';
import { LeadStory } from './LeadStory';
import { StoryCard } from './StoryCard';

type FeedStoriesProps = {
  stories: readonly Article[];
  TitleLink: ComponentType<TitleLinkProps>;
};

/** One lead story, a row of three, then a compact list. */
export function FeedStories({ stories, TitleLink }: FeedStoriesProps) {
  const listHeadingId = useId();
  const { lead, row, list } = splitStories(stories);

  return (
    <div className="flex flex-col">
      {lead && <LeadStory article={lead} TitleLink={TitleLink} />}
      {row.length > 0 && (
        <ul className="grid divide-y border-b lg:grid-cols-3 lg:gap-8 lg:divide-y-0 lg:py-10">
          {row.map((article) => (
            <li key={article.id} className="min-w-0">
              <StoryCard article={article} TitleLink={TitleLink} />
            </li>
          ))}
        </ul>
      )}
      {list.length > 0 && (
        <section aria-labelledby={listHeadingId} className="pt-6 lg:pt-9">
          <h2
            id={listHeadingId}
            className="text-xs font-semibold tracking-[0.08em] text-muted-foreground uppercase sm:text-[0.8125rem]"
          >
            More in your feed
          </h2>
          {/* Two columns from lg: one full-width column makes lines too long to read. */}
          <ul className="grid lg:grid-cols-2 lg:gap-x-10">
            {list.map((article) => (
              <li key={article.id} className="min-w-0 border-b">
                <CompactStory article={article} TitleLink={TitleLink} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
