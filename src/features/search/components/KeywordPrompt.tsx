import { InfoIcon } from 'lucide-react';

/** `/search` without a keyword shows the latest articles; this says so. */
export function KeywordPrompt() {
  return (
    <p className="flex items-start gap-2 rounded-lg bg-muted px-3 py-2 text-sm text-foreground">
      <InfoIcon aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      Showing the latest articles. Type a keyword above to search.
    </p>
  );
}
