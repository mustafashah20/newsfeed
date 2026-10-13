import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

type ArticleListSkeletonProps = {
  count?: number;
};

// Mirrors ArticleList/ArticleCard so the layout doesn't jump when articles arrive.
export function ArticleListSkeleton({ count = 6 }: ArticleListSkeletonProps) {
  return (
    <div role="status" aria-busy="true">
      <span className="sr-only">Loading articles…</span>
      <ul aria-hidden="true" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: count }, (_, i) => (
          <li key={i}>
            <Card className="gap-3 pt-0">
              <Skeleton className="aspect-video w-full rounded-none" />
              <CardHeader className="gap-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-4/5" />
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
