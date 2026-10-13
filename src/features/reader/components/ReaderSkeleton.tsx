import { Skeleton } from '@/components/ui/skeleton';

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

// Mirrors the reader layout so nothing jumps when the article arrives.
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
    <div role="status" aria-busy="true" className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <span className="sr-only">Loading article…</span>
      <Skeleton className="aspect-video w-full rounded-xl" />
      <Skeleton className="h-9 w-full" />
      <Skeleton className="h-9 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      {bodyLines}
    </div>
  );
}
