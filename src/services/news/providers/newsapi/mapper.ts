import { toIsoDateTime } from '@/lib/date';
import { htmlToText, nonEmpty, normalizeAuthor } from '@/lib/text';
import { toHttpUrl } from '@/lib/url';

import type { Category } from '../../categories';
import type { Article } from '../../types';
import { newsapiArticleSchema } from './schema';

// Placeholders NewsAPI returns for articles a publisher has withdrawn.
const REMOVED_TITLE = '[Removed]';
const REMOVED_HOST = 'removed.com';

/** Drops the "[+3412 chars]" marker from `content`, keeping the "…" that shows it's cut. */
export function stripTruncationMarker(text: string | null): string | null {
  if (text === null) return null;
  return nonEmpty(text.replace(/\s*\[\+\d+ chars\]\s*$/, ''));
}

/** One raw article → Article (tagged with the category it was requested for), or null. */
export function toNewsapiArticle(raw: unknown, category: Category | null): Article | null {
  const parsed = newsapiArticleSchema.safeParse(raw);
  if (!parsed.success) return null;
  const item = parsed.data;

  const title = nonEmpty(item.title);
  const url = toHttpUrl(item.url);
  const publishedAt = toIsoDateTime(item.publishedAt);
  if (!title || !url || !publishedAt) return null;
  const host = new URL(url).hostname;
  if (title === REMOVED_TITLE || host === REMOVED_HOST) return null;

  const description = htmlToText(item.description);
  const excerpt = stripTruncationMarker(htmlToText(item.content));

  return {
    id: `newsapi:${url}`,
    externalId: url, // NewsAPI has no id field
    title,
    description,
    excerpt: excerpt !== description ? excerpt : null,
    url,
    imageUrl: toHttpUrl(item.urlToImage),
    publishedAt,
    author: normalizeAuthor(item.author),
    category,
    provider: 'newsapi',
    sourceName: nonEmpty(item.source?.name) ?? host.replace(/^www\./, ''),
  };
}
