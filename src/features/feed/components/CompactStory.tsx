import type { ComponentType } from 'react';

import { ArticleImage } from '@/features/articles';
import type { TitleLinkProps } from '@/features/articles';
import type { Article } from '@/services/news/types';

import { StoryMeta } from './StoryMeta';

type CompactStoryProps = {
  article: Article;
  TitleLink: ComponentType<TitleLinkProps>;
};

/** "More in your feed": text with a thumbnail on the right. */
export function CompactStory({ article, TitleLink }: CompactStoryProps) {
  return (
    <article className="relative flex items-start gap-3.5 rounded-md py-4 has-[a:focus-visible]:ring-3 has-[a:focus-visible]:ring-ring/50 sm:gap-6 sm:py-5.5">
      <div className="flex min-w-0 flex-1 flex-col gap-1.5 sm:gap-2">
        <StoryMeta article={article} />
        <h3 className="font-heading text-[1.1875rem] leading-tight font-medium break-words sm:text-[1.375rem]">
          <TitleLink
            article={article}
            className="outline-none after:absolute after:inset-0 after:content-[''] hover:text-link"
          >
            {article.title}
          </TitleLink>
        </h3>
        {article.description && (
          <p className="hidden text-[0.9375rem] leading-normal break-words text-foreground/80 sm:line-clamp-2">
            {article.description}
          </p>
        )}
        {article.author && (
          <p className="hidden truncate text-sm text-muted-foreground sm:block">
            By {article.author}
          </p>
        )}
      </div>
      <ArticleImage
        src={article.imageUrl}
        className="aspect-square w-1/4 max-w-24 shrink-0 rounded-sm sm:aspect-4/3 sm:max-w-40"
      />
    </article>
  );
}
