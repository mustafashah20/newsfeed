import type { ComponentType } from 'react';

import { ArticleImage } from '@/features/articles';
import type { TitleLinkProps } from '@/features/articles';
import type { Article } from '@/services/news/types';

import { StoryMeta } from './StoryMeta';

type LeadStoryProps = {
  article: Article;
  TitleLink: ComponentType<TitleLinkProps>;
};

export function LeadStory({ article, TitleLink }: LeadStoryProps) {
  return (
    <article className="relative flex flex-col gap-4 rounded-md border-b pb-5 has-[a:focus-visible]:ring-3 has-[a:focus-visible]:ring-ring/50 lg:flex-row lg:gap-9 lg:pb-10">
      <ArticleImage
        src={article.imageUrl}
        priority
        className="aspect-16/10 rounded-md lg:basis-3/5"
      />
      <div className="flex min-w-0 flex-col justify-center gap-2 sm:gap-4 lg:basis-2/5">
        <StoryMeta article={article} />
        <h2 className="font-heading text-[1.5625rem] leading-[1.18] font-medium tracking-tight break-words sm:text-4xl sm:leading-[1.1] lg:text-[2.75rem]">
          <TitleLink
            article={article}
            className="outline-none after:absolute after:inset-0 after:content-[''] hover:text-link"
          >
            {article.title}
          </TitleLink>
        </h2>
        {article.description && (
          <p className="hidden text-lg leading-[1.55] break-words text-foreground/80 sm:line-clamp-4">
            {article.description}
          </p>
        )}
        {article.author && (
          <p className="min-w-0 truncate text-sm text-foreground/80 sm:mt-1.5">
            By {article.author}
          </p>
        )}
      </div>
    </article>
  );
}
