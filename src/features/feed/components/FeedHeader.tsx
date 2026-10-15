import { PAGE_DESCRIPTION_CLASS, PAGE_TITLE_CLASS } from '@/components/layout/page-styles';
import { cn } from '@/lib/utils';

type FeedHeaderProps = {
  /** "Thursday 15 October" */
  dateline: string;
  /** "32 stories from The Guardian and The New York Times" */
  summary: string;
};

export function FeedHeader({ dateline, summary }: FeedHeaderProps) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-semibold tracking-[0.08em] text-muted-foreground uppercase sm:text-[0.8125rem]">
        {dateline}
      </p>
      <h1 className={cn(PAGE_TITLE_CLASS, 'mt-1 sm:mt-1.5')}>Your feed</h1>
      <p className={cn(PAGE_DESCRIPTION_CLASS, 'hidden sm:block')}>{summary}</p>
    </div>
  );
}
