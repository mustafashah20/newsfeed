import { SparklesIcon, XIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { Button } from '@/components/ui/button';

type FeedHintProps = {
  /** The call to action, e.g. a button that opens the preferences. */
  action: ReactNode;
  onDismiss: () => void;
};

/** First-visit hint: the feed starts generic until preferences are set. */
export function FeedHint({ action, onDismiss }: FeedHintProps) {
  return (
    <aside
      aria-label="Personalize your feed"
      className="flex flex-col gap-3 rounded-xl border bg-muted/50 p-4 sm:flex-row sm:items-center"
    >
      <SparklesIcon aria-hidden="true" className="size-5 shrink-0 text-muted-foreground" />
      <p className="min-w-0 flex-1 text-sm">
        <span className="font-medium">Make this feed yours.</span> Pick your sources and categories,
        and add authors to see their articles first.
      </p>
      <div className="flex shrink-0 items-center gap-2">
        {action}
        <Button
          variant="ghost"
          size="icon"
          className="size-11"
          aria-label="Dismiss"
          onClick={onDismiss}
        >
          <XIcon aria-hidden="true" />
        </Button>
      </div>
    </aside>
  );
}
