import { formatFullDate, timeAgo } from '@/lib/date-format';
import { cn } from '@/lib/utils';
import { categoryLabel } from '@/services/news/categories';
import type { Article } from '@/services/news/types';

type StoryMetaProps = {
  article: Article;
  /** The category is left out where space is tight (mobile thumbnails). */
  showCategory?: boolean;
  className?: string;
};

/** "The Guardian · Football · 10 minutes ago" */
export function StoryMeta({ article, showCategory = true, className }: StoryMetaProps) {
  return (
    <p className={cn('min-w-0 text-[0.8125rem] break-words text-muted-foreground', className)}>
      <span className="font-semibold text-foreground">{article.sourceName}</span>
      {showCategory && article.category && <> · {categoryLabel(article.category)}</>}
      {' · '}
      <time dateTime={article.publishedAt} title={formatFullDate(article.publishedAt)}>
        {timeAgo(article.publishedAt)}
      </time>
    </p>
  );
}
