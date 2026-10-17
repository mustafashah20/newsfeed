/** Collapses runs of whitespace (incl. newlines, nbsp) to single spaces and trims. */
export function collapseWhitespace(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

/** Trimmed text, or null when nothing is left. */
export function nonEmpty(value: string | null | undefined): string | null {
  if (value == null) return null;
  const text = collapseWhitespace(value);
  return text === '' ? null : text;
}

/**
 * Plain text from an HTML snippet (Guardian trailText, some NewsAPI descriptions). DOMParser
 * documents are inert: scripts don't run and images don't load. The result is text, never HTML.
 */
export function htmlToText(html: string | null | undefined): string | null {
  if (html == null || html === '') return null;
  if (!/[<&]/.test(html)) return nonEmpty(html);
  const doc = new DOMParser().parseFromString(html, 'text/html');
  // Their contents are code, not prose.
  doc.body.querySelectorAll('script, style, noscript, template').forEach((el) => {
    el.remove();
  });
  return nonEmpty(doc.body.textContent);
}
