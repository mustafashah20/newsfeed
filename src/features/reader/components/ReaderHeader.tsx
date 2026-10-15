import { Badge } from '@/components/ui/badge';
import { ArticleImage } from '@/features/articles';
import { formatFullDate, timeAgo } from '@/lib/date';
import { cn } from '@/lib/utils';
import { categoryLabel } from '@/services/news/categories';
import type { Article } from '@/services/news/types';

import { READER_GRID, READER_MAIN, READER_SIDE } from '../layout';

type ReaderHeaderProps = {
  article: Article;
  now?: Date;
};

// Laid out like the feed's lead story (image 3/5, title beside it from lg), so opening a story
// reads as that story expanding rather than as a different, narrower page.
export function ReaderHeader({ article, now }: ReaderHeaderProps) {
  return (
    <header className={cn(READER_GRID, 'lg:items-center')}>
      <ArticleImage
        src={article.imageUrl}
        priority
        className={cn(READER_MAIN, 'aspect-16/10 rounded-md')}
      />
      <div className={cn(READER_SIDE, 'flex min-w-0 flex-col gap-3 sm:gap-4')}>
        <h1 className="font-heading text-[1.5625rem] leading-[1.18] font-medium tracking-tight break-words sm:text-4xl sm:leading-[1.1] lg:text-[2.75rem]">
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
    </header>
  );
}
