import { Badge } from '@/components/ui/badge';
import { ArticleImage } from '@/features/articles';
import { formatFullDate, timeAgo } from '@/lib/date-format';
import { categoryLabel } from '@/services/news/categories';
import type { Article } from '@/services/news/types';

import { READER_HERO } from '../layout';

type ReaderHeaderProps = {
  article: Article;
  now?: Date;
};

// Title and byline, then the hero; the page puts all of it in the article column.
export function ReaderHeader({ article, now }: ReaderHeaderProps) {
  return (
    <header className="flex flex-col gap-6 md:gap-8">
      <div className="flex min-w-0 flex-col gap-3 sm:gap-4">
        <h1 className="font-heading text-[1.75rem] leading-[1.15] font-medium tracking-tight break-words sm:text-4xl sm:leading-[1.1] lg:text-[2.75rem]">
          {article.title}
        </h1>
        <p className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
          {article.author && <span className="min-w-0 break-words">By {article.author}</span>}
          {article.author && <span aria-hidden="true">·</span>}
          <time dateTime={article.publishedAt} title={formatFullDate(article.publishedAt)}>
            {timeAgo(article.publishedAt, now)}
          </time>
          <Badge variant="secondary" className="max-w-full truncate">
            {article.sourceName}
          </Badge>
          {article.category && <span>{categoryLabel(article.category)}</span>}
        </p>
      </div>
      <ArticleImage src={article.imageUrl} priority className={READER_HERO} />
    </header>
  );
}
