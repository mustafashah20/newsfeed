import { CloudOffIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';

type ErrorStateProps = {
  onRetry: () => void;
};

/** Every selected source failed. Per-source details are in the status bar above. */
export function ErrorState({ onRetry }: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 rounded-xl border border-dashed px-4 py-12 text-center"
    >
      <CloudOffIcon aria-hidden="true" className="size-8 text-muted-foreground" />
      <h2 className="font-heading text-lg font-semibold">Couldn’t load any articles</h2>
      <p className="max-w-prose text-muted-foreground">
        None of the selected sources responded. Check the messages above, then try again.
      </p>
      <Button onClick={onRetry} className="h-11 px-4">
        Retry
      </Button>
    </div>
  );
}
