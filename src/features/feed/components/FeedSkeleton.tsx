import { Skeleton } from '@/components/ui/skeleton';

// Mirrors FeedStories (lead + row) so the layout doesn't jump when stories arrive.
export function FeedSkeleton() {
  return (
    <div role="status" aria-busy="true" className="flex flex-col">
      <span className="sr-only">Loading articles…</span>
      <div
        aria-hidden="true"
        className="flex flex-col gap-4 border-b pb-5 lg:flex-row lg:gap-9 lg:pb-10"
      >
        <Skeleton className="aspect-16/10 w-full rounded-md lg:basis-3/5" />
        <div className="flex flex-col justify-center gap-3 lg:basis-2/5">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-4/5" />
          <Skeleton className="h-4 w-1/3" />
        </div>
      </div>
      <ul
        aria-hidden="true"
        className="grid divide-y lg:grid-cols-3 lg:gap-8 lg:divide-y-0 lg:py-10"
      >
        {Array.from({ length: 3 }, (_, i) => (
          <li key={i} className="flex gap-3.5 py-4 lg:flex-col lg:py-0">
            <div className="flex flex-1 flex-col gap-2 lg:order-last">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-3/4" />
            </div>
            <Skeleton className="aspect-square w-1/4 max-w-24 shrink-0 rounded-sm lg:aspect-16/10 lg:w-full lg:max-w-none" />
          </li>
        ))}
      </ul>
    </div>
  );
}
