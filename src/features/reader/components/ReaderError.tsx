import { CloudOffIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';

type ReaderErrorProps = {
  message: string;
  onRetry?: () => void;
};

export function ReaderError({ message, onRetry }: ReaderErrorProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 rounded-xl border border-dashed px-4 py-12 text-center"
    >
      <CloudOffIcon aria-hidden="true" className="size-8 text-muted-foreground" />
      <h1 className="font-heading text-xl font-semibold">Couldn’t load this article</h1>
      <p className="max-w-prose text-muted-foreground">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} className="h-11 px-4">
          Retry
        </Button>
      )}
    </div>
  );
}
