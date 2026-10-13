import { toIsoDateTime } from '@/lib/date';
import { htmlToText, nonEmpty, normalizeAuthor } from '@/lib/text';
import { toHttpUrl } from '@/lib/url';

import { fromProviderCategory } from '../../categories';
import type { Article } from '../../types';
import { guardianItemSchema } from './schema';

export const GUARDIAN_SOURCE_NAME = 'The Guardian';

/** One raw search result → Article, or null if it lacks what a card needs. */
export function toGuardianArticle(raw: unknown): Article | null {
  const parsed = guardianItemSchema.safeParse(raw);
  if (!parsed.success) return null;
  const item = parsed.data;

  const title = nonEmpty(item.webTitle);
  const url = toHttpUrl(item.webUrl);
  const publishedAt = toIsoDateTime(item.webPublicationDate);
  if (!title || !url || !publishedAt) return null;

  return {
    id: `guardian:${item.id}`,
    externalId: item.id,
    title,
    description: htmlToText(item.fields?.trailText),
    excerpt: null, // the list API has no longer text; the reader fetches the full body
    url,
    imageUrl: toHttpUrl(item.fields?.thumbnail),
    publishedAt,
    author: normalizeAuthor(item.fields?.byline),
    category: fromProviderCategory('guardian', item.sectionId),
    provider: 'guardian',
    sourceName: GUARDIAN_SOURCE_NAME,
  };
}
