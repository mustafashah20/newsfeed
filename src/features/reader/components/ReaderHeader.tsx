import type { ReactNode } from 'react';

import { Badge } from '@/components/ui/badge';
import { ArticleImage } from '@/features/articles';
import { formatFullDate, timeAgo } from '@/lib/date';
import { categoryLabel } from '@/services/news/categories';
import type { Article } from '@/services/news/types';

type ReaderHeaderProps = {
  article: Article;
  /** E.g. the Follow author button. */
  actions?: ReactNode;
  now?: Date;
};

export function ReaderHeader({ article, actions, now }: ReaderHeaderProps) {
  return (
    <header className="flex flex-col gap-4">
      <ArticleImage src={article.imageUrl} priority className="rounded-xl" />
      <h1 className="font-heading text-2xl leading-tight font-semibold tracking-tight break-words sm:text-4xl">
        {article.title}
      </h1>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
          {article.author && <span className="min-w-0 break-words">By {article.author}</span>}
          {article.author && <span aria-hidden="true">·</span>}
          <time dateTime={article.publishedAt} title={formatFullDate(article.publishedAt)}>
            {timeAgo(article.publishedAt, now)}
          </time>
          <Badge variant="secondary">{article.sourceName}</Badge>
          {article.category && <span>{categoryLabel(article.category)}</span>}
        </p>
        {actions}
      </div>
    </header>
  );
}
