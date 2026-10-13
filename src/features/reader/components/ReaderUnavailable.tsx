import { FileQuestionIcon } from 'lucide-react';
import type { ReactNode } from 'react';

type ReaderUnavailableProps = {
  /** E.g. a link back to the feed. */
  action: ReactNode;
};

export function ReaderUnavailable({ action }: ReaderUnavailableProps) {
  return (
    <div className="mx-auto flex max-w-prose flex-col items-center gap-3 rounded-xl border border-dashed px-4 py-12 text-center">
      <FileQuestionIcon aria-hidden="true" className="size-8 text-muted-foreground" />
      <h1 className="font-heading text-xl font-semibold">This article isn’t available</h1>
      <p className="text-muted-foreground">
        It may be an old or shared link. Some sources can only be read when you open the article
        from your feed or search.
      </p>
      {action}
    </div>
  );
}
