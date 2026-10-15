import { Loader2Icon } from 'lucide-react';

import { Button } from '@/components/ui/button';

type ShowMoreStoriesProps = {
  shown: number;
  canShowMore: boolean;
  isLoading: boolean;
  onShowMore: () => void;
};

export function ShowMoreStories({
  shown,
  canShowMore,
  isLoading,
  onShowMore,
}: ShowMoreStoriesProps) {
  return (
    <div className="flex flex-col items-center gap-2.5 pt-8">
      {canShowMore || isLoading ? (
        <Button
          variant="outline"
          onClick={onShowMore}
          disabled={isLoading}
          aria-busy={isLoading}
          className="h-12 w-full rounded-full border-foreground px-7 text-[0.9375rem] font-semibold sm:w-auto"
        >
          {isLoading && <Loader2Icon aria-hidden="true" className="animate-spin" />}
          {isLoading ? 'Loading…' : 'Show more stories'}
        </Button>
      ) : (
        <p className="text-sm text-muted-foreground">You’re all caught up.</p>
      )}
      {/* Screen readers only: there's no meaningful visible total, because the feed loads
          page by page and "of N" would only count what's loaded so far. */}
      <p aria-live="polite" className="sr-only">
        Showing {shown} {shown === 1 ? 'story' : 'stories'}
      </p>
    </div>
  );
}
