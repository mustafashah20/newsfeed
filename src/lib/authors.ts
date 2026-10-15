import { normalizeAuthor } from './text';

// Guardian live blogs credit with notes in brackets: "Jakub Krupa (now and earlier) and Martin
// Belam (earlier)". The notes aren't part of anyone's name, and their own "and" must not split.
const BYLINE_NOTE = /\([^)]*\)/g;

/**
 * One person's name, as preferred authors store it: "Martin Belam (earlier)" → "Martin Belam".
 * Pieces of a note split apart by older code ("Jakub Krupa (now", "earlier)") are repaired or,
 * when nothing of a name is left, dropped (null).
 */
export function toAuthorName(value: string | null | undefined): string | null {
  const name = normalizeAuthor(value);
  if (name === null) return null;
  const withoutNotes = name.replace(BYLINE_NOTE, ' ');
  // The tail of a split note ("earlier)") holds no name.
  if (withoutNotes.includes(')')) return null;
  // The head of one ("Jakub Krupa (now") does: keep what comes before the bracket.
  return normalizeAuthor(withoutNotes.split('(')[0]);
}

/** "Rachel Roubein, Daniel Wu" / "A and B" / "A & B" → individual names, without notes. */
export function splitAuthors(byline: string | null | undefined): string[] {
  if (!byline) return [];
  return byline
    .replace(BYLINE_NOTE, ' ')
    .split(/\s*(?:,|&|\band\b)\s*/i)
    .map((name) => toAuthorName(name))
    .filter((name): name is string => name !== null);
}

/** Comparison key: names match case- and spacing-insensitively. */
export function authorKey(name: string) {
  return name.replace(/\s+/g, ' ').trim().toLowerCase();
}

/** Whether any author in the byline is one of `preferred`. */
export function isByPreferredAuthor(byline: string | null, preferred: readonly string[]) {
  if (!byline || preferred.length === 0) return false;
  const keys = new Set(preferred.map(authorKey));
  return splitAuthors(byline).some((name) => keys.has(authorKey(name)));
}
