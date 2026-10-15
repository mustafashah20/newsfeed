import type { Article } from '@/services/news/types';

// Query params that only track where a click came from; the same article with different
// values is still the same article.
const TRACKING_PARAM = /^(utm_|fbclid$|gclid$|mc_|cmpid$|smid$|ref$)/i;

/** A comparison key for "same article": host without www, path without trailing slash, no tracking. */
export function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const params = [...parsed.searchParams].filter(([key]) => !TRACKING_PARAM.test(key));
    const query = new URLSearchParams(params.sort(([a], [b]) => a.localeCompare(b))).toString();
    const host = parsed.hostname.toLowerCase().replace(/^www\./, '');
    const path = parsed.pathname.replace(/\/+$/, '');
    return `${host}${path}${query ? `?${query}` : ''}`;
  } catch {
    return url;
  }
}

const newestFirst = (a: Article, b: Article) => b.publishedAt.localeCompare(a.publishedAt);

export type ArticlePredicate = (article: Article) => boolean;

/**
 * One batch (page n of every provider): dedupe by URL (first provider wins), newest first.
 * Articles matching `isPriority` (e.g. by a preferred author) move to the top of the batch.
 */
export function mergeBatch(articles: readonly Article[], isPriority?: ArticlePredicate): Article[] {
  const seen = new Set<string>();
  const unique = articles.filter((article) => {
    const key = normalizeUrl(article.url);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  unique.sort(newestFirst);
  if (!isPriority) return unique;
  // Stable: each group keeps its newest-first order.
  return [...unique.filter(isPriority), ...unique.filter((a) => !isPriority(a))];
}

/**
 * Batches in page order, each merged on its own and appended, so "Load more" never reshuffles
 * what's already shown. An article already shown in an earlier batch is skipped.
 */
export function combineBatches(
  batches: readonly (readonly Article[])[],
  isPriority?: ArticlePredicate,
): Article[] {
  const seen = new Set<string>();
  const result: Article[] = [];
  for (const batch of batches) {
    for (const article of mergeBatch(batch, isPriority)) {
      const key = normalizeUrl(article.url);
      if (seen.has(key)) continue;
      seen.add(key);
      result.push(article);
    }
  }
  return result;
}
