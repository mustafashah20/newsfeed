import { PAGE_STACK_CLASS } from '@/components/layout/page-styles';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

import { READER_GRID, READER_MAIN, READER_SIDE } from '../layout';

type ReaderSkeletonProps = {
  /** Only the body lines, under an already-shown header (full text loading). */
  bodyOnly?: boolean;
};

const bodyLines = (
  <div className="flex max-w-prose flex-col gap-3">
    <Skeleton className="h-5 w-full" />
    <Skeleton className="h-5 w-full" />
    <Skeleton className="h-5 w-11/12" />
    <Skeleton className="h-5 w-full" />
    <Skeleton className="h-5 w-2/3" />
  </div>
);

// Mirrors the reader layout (same grid and spacing) so nothing jumps when the article arrives.
export function ReaderSkeleton({ bodyOnly = false }: ReaderSkeletonProps) {
  if (bodyOnly) {
    return (
      <div role="status" aria-busy="true">
        <span className="sr-only">Loading the full article…</span>
        {bodyLines}
      </div>
    );
  }

  return (
    <div role="status" aria-busy="true" className={PAGE_STACK_CLASS}>
      <span className="sr-only">Loading article…</span>
      <Skeleton className="h-11 w-24" />
      <div className={cn(READER_GRID, 'lg:items-center')}>
        <Skeleton className={cn(READER_MAIN, 'aspect-16/10 w-full rounded-md')} />
        <div className={cn(READER_SIDE, 'flex flex-col gap-3')}>
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
      <div className={READER_GRID}>
        <div className={READER_MAIN}>{bodyLines}</div>
      </div>
    </div>
  );
}
