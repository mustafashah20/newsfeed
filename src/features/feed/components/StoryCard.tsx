import type { ComponentType } from 'react';

import { ArticleImage } from '@/features/articles';
import type { TitleLinkProps } from '@/features/articles';
import type { Article } from '@/services/news/types';

import { StoryMeta } from './StoryMeta';

type StoryCardProps = {
  article: Article;
  TitleLink: ComponentType<TitleLinkProps>;
};

/** The row of three: a thumbnail row below `lg`, a column card with a large image from `lg`. */
export function StoryCard({ article, TitleLink }: StoryCardProps) {
  return (
    <article className="relative flex h-full gap-3.5 rounded-md py-4 has-[a:focus-visible]:ring-3 has-[a:focus-visible]:ring-ring/50 lg:flex-col lg:gap-3 lg:py-0">
      <div className="flex min-w-0 flex-1 flex-col gap-1.5 lg:gap-3">
        <StoryMeta article={article} className="lg:mt-1" />
        <h3 className="font-heading text-[1.1875rem] leading-tight font-medium break-words lg:text-2xl">
          <TitleLink
            article={article}
            className="outline-none after:absolute after:inset-0 after:content-[''] hover:text-link"
          >
            {article.title}
          </TitleLink>
        </h3>
        {article.description && (
          <p className="hidden text-[0.9375rem] leading-[1.55] break-words text-foreground/80 lg:line-clamp-3">
            {article.description}
          </p>
        )}
        {article.author && (
          <p className="hidden truncate pt-1 text-sm text-foreground/80 lg:mt-auto lg:block">
            By {article.author}
          </p>
        )}
      </div>
      <ArticleImage
        src={article.imageUrl}
        className="aspect-square w-1/4 max-w-24 shrink-0 rounded-sm lg:order-first lg:aspect-16/10 lg:w-full lg:max-w-none lg:rounded-md"
      />
    </article>
  );
}
