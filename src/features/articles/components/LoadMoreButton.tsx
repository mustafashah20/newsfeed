import { Loader2Icon } from 'lucide-react';

import { Button } from '@/components/ui/button';

type LoadMoreButtonProps = {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
};

export function LoadMoreButton({ hasMore, isLoading, onLoadMore }: LoadMoreButtonProps) {
  if (!hasMore && !isLoading) {
    return <p className="text-center text-sm text-muted-foreground">You’re all caught up.</p>;
  }

  return (
    <div className="flex justify-center">
      <Button
        variant="outline"
        onClick={onLoadMore}
        disabled={isLoading}
        aria-busy={isLoading}
        className="h-11 w-full px-6 sm:w-auto"
      >
        {isLoading && <Loader2Icon aria-hidden="true" className="animate-spin" />}
        {isLoading ? 'Loading…' : 'Load more'}
      </Button>
    </div>
  );
}
