import type { Category } from '@/services/news/categories';
import type { Article } from '@/services/news/types';

import type { FeedFilter } from '../feed-params';

/** Stories on screen at first (lead + row of three + six in the list), and per "Show more". */
export const FIRST_REVEAL = 10;
export const REVEAL_STEP = 10;

/**
 * The loaded stories that match a chip. Filtering happens here rather than in the APIs:
 * refetching per chip would spend the small quota.
 */
export function filterStories(
  articles: readonly Article[],
  filter: FeedFilter | undefined,
): Article[] {
  if (!filter) return [...articles];
  return articles.filter((a) => a.category === filter);
}

/** The feed's layout: one lead story, a row of three, then a compact list. */
export function splitStories(articles: readonly Article[]) {
  const [lead, ...others] = articles;
  return { lead: lead ?? null, row: others.slice(0, 3), list: others.slice(3) };
}

/** Category chips: the preferred categories, plus one from a shared URL if it isn't among them. */
export function chipCategories(
  preferred: readonly Category[],
  filter: FeedFilter | undefined,
): Category[] {
  if (!filter || preferred.includes(filter)) return [...preferred];
  return [...preferred, filter];
}

/** "NewsAPI, The Guardian and The New York Times". */
export function joinNames(names: readonly string[]) {
  return new Intl.ListFormat('en', { type: 'conjunction' }).format(names);
}
