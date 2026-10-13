import { InfoIcon } from 'lucide-react';

type PreviewNoticeProps = {
  /** The API that limits the text ("The New York Times", "NewsAPI"). */
  providerLabel: string;
};

// A note, not a call to action: the app never sends readers to the publisher.
export function PreviewNotice({ providerLabel }: PreviewNoticeProps) {
  return (
    <p className="flex max-w-prose items-start gap-2 rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
      <InfoIcon aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      {providerLabel} only shares a preview of this article.
    </p>
  );
}
