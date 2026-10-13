import { TriangleAlertIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import type { ProviderId } from '@/services/news/types';

import type { SourceState } from '../hooks/useAggregatedArticles';
import { describeSourceError } from '../lib/error-message';

type SourceStatusBarProps = {
  sources: readonly SourceState[];
  onRetry: (provider: ProviderId) => void;
};

/** One warning chip per failed source; the others keep showing their articles. */
export function SourceStatusBar({ sources, onRetry }: SourceStatusBarProps) {
  const failed = sources.flatMap((source) =>
    source.status === 'error'
      ? [{ provider: source.provider, ...describeSourceError(source.error, source.label) }]
      : [],
  );
  if (failed.length === 0) return null;

  return (
    <ul aria-label="Source problems" className="flex flex-wrap gap-2">
      {failed.map(({ provider, message, canRetry }) => (
        <li
          key={provider}
          role="alert"
          className="flex min-w-0 items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 py-1 pr-1 pl-3 text-sm"
        >
          <TriangleAlertIcon aria-hidden="true" className="size-4 shrink-0 text-destructive" />
          <span className="min-w-0 break-words">{message}</span>
          {canRetry && (
            <Button
              variant="ghost"
              className="h-11 shrink-0 px-3"
              onClick={() => {
                onRetry(provider);
              }}
            >
              Retry
            </Button>
          )}
        </li>
      ))}
    </ul>
  );
}
