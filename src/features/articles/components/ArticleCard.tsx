import type { ComponentType, ReactNode } from 'react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { formatFullDate, timeAgo } from '@/lib/date-format';
import { categoryLabel } from '@/services/news/categories';
import type { Article } from '@/services/news/types';

import { ArticleImage } from './ArticleImage';

export type TitleLinkProps = {
  article: Article;
  className?: string;
  children: ReactNode;
};

type ArticleCardProps = {
  article: Article;
  /** Renders the title as the link that opens the article (stretched over the whole card). */
  TitleLink: ComponentType<TitleLinkProps>;
  now?: Date;
};

export function ArticleCard({ article, TitleLink, now }: ArticleCardProps) {
  return (
    <article className="h-full">
      {/* The whole card shows focus, since the stretched title link covers it. */}
      <Card className="relative h-full gap-3 pt-0 has-[a:focus-visible]:ring-3 has-[a:focus-visible]:ring-ring/50">
        <ArticleImage src={article.imageUrl} />
        <CardHeader className="gap-2">
          <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
            <Badge variant="secondary" className="max-w-full truncate">
              {article.sourceName}
            </Badge>
            {article.category && <span>{categoryLabel(article.category)}</span>}
            <time dateTime={article.publishedAt} title={formatFullDate(article.publishedAt)}>
              {timeAgo(article.publishedAt, now)}
            </time>
          </div>
          <h3 className="line-clamp-2 font-heading text-base leading-snug font-semibold break-words">
            <TitleLink
              article={article}
              className="outline-none after:absolute after:inset-0 after:content-['']"
            >
              {article.title}
            </TitleLink>
          </h3>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col gap-3">
          {article.description && (
            <p className="line-clamp-3 break-words text-muted-foreground">{article.description}</p>
          )}
          {article.author && (
            <p className="mt-auto min-w-0 truncate text-xs text-muted-foreground">
              By {article.author}
            </p>
          )}
        </CardContent>
      </Card>
    </article>
  );
}
