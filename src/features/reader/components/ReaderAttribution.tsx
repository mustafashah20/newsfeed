type ReaderAttributionProps = {
  sourceName: string;
  url: string;
};

/**
 * "Source: {source} · Original article". The Guardian's terms require attribution; we apply
 * it to every source. The app's only link out, deliberately small, not a call to action.
 */
export function ReaderAttribution({ sourceName, url }: ReaderAttributionProps) {
  return (
    <footer className="border-t pt-4 text-sm text-muted-foreground">
      Source: {sourceName} ·{' '}
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        // Explicit label: a hidden " (opens…)" span loses its leading space in the computed name.
        aria-label="Original article (opens in a new tab)"
        className="underline underline-offset-4 hover:text-foreground"
      >
        Original article
      </a>
    </footer>
  );
}
