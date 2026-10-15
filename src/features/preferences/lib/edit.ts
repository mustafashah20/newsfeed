import { authorKey } from '@/lib/authors';
import { normalizeAuthor } from '@/lib/text';
import { CATEGORIES } from '@/services/news/categories';
import type { Category } from '@/services/news/categories';
import { PROVIDER_IDS } from '@/services/news/types';
import type { ProviderId } from '@/services/news/types';

// Pure edits shared by the store and the preferences dialog's draft, so both follow one set of rules.

// Registry/table order, so equal selections always look (and cache) the same.
export const inOrder = <T extends string>(all: readonly T[], selected: readonly T[]) =>
  all.filter((item) => selected.includes(item));

/** Adds or removes a source; the last one can't be removed. */
export function toggleSource(sources: readonly ProviderId[], source: ProviderId): ProviderId[] {
  if (!sources.includes(source)) return inOrder(PROVIDER_IDS, [...sources, source]);
  if (sources.length === 1) return [...sources];
  return sources.filter((s) => s !== source);
}

export function orderCategories(categories: readonly Category[]): Category[] {
  return inOrder(CATEGORIES, categories);
}

/** The new list, or null when the name is empty or already in the list. */
export function addAuthor(authors: readonly string[], name: string): string[] | null {
  const author = normalizeAuthor(name);
  if (!author) return null;
  if (authors.some((a) => authorKey(a) === authorKey(author))) return null;
  return [...authors, author];
}

export function removeAuthor(authors: readonly string[], name: string): string[] {
  const key = authorKey(name);
  return authors.filter((a) => authorKey(a) !== key);
}
