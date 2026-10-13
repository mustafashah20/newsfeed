import { normalizeAuthor } from './text';

/** "Rachel Roubein, Daniel Wu" / "A and B" / "A & B" → individual, normalized names. */
export function splitAuthors(byline: string | null | undefined): string[] {
  if (!byline) return [];
  return byline
    .split(/\s*(?:,|&|\band\b)\s*/i)
    .map((name) => normalizeAuthor(name))
    .filter((name): name is string => name !== null);
}

/** Comparison key: names match case- and spacing-insensitively. */
export function authorKey(name: string) {
  return name.replace(/\s+/g, ' ').trim().toLowerCase();
}

/** Whether any author in the byline is one of `followed`. */
export function isByFollowedAuthor(byline: string | null, followed: readonly string[]) {
  if (!byline || followed.length === 0) return false;
  const keys = new Set(followed.map(authorKey));
  return splitAuthors(byline).some((name) => keys.has(authorKey(name)));
}
