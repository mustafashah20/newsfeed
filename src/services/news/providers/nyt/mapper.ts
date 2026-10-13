import { toIsoDateTime } from '@/lib/date';
import { nonEmpty, normalizeAuthor } from '@/lib/text';
import { toHttpUrl } from '@/lib/url';

import { fromProviderCategory } from '../../categories';
import type { Article } from '../../types';
import { nytDocSchema } from './schema';
import type { NytDoc } from './schema';

export const NYT_SOURCE_NAME = 'The New York Times';

// Older multimedia arrays carry paths relative to the site.
const NYT_ORIGIN = 'https://www.nytimes.com/';

function imageUrlOf(multimedia: NytDoc['multimedia']): string | null {
  if (!multimedia) return null;
  if (Array.isArray(multimedia)) {
    const largest = multimedia.reduce<(typeof multimedia)[number] | undefined>(
      (best, item) => ((item.width ?? 0) > (best?.width ?? -1) ? item : best),
      undefined,
    );
    return toHttpUrl(largest?.url, NYT_ORIGIN);
  }
  return toHttpUrl(multimedia.default?.url ?? multimedia.thumbnail?.url, NYT_ORIGIN);
}

/** One raw doc → Article, or null if it lacks what a card needs. */
export function toNytArticle(raw: unknown): Article | null {
  const parsed = nytDocSchema.safeParse(raw);
  if (!parsed.success) return null;
  const doc = parsed.data;

  const title = nonEmpty(doc.headline.main);
  const url = toHttpUrl(doc.web_url);
  const publishedAt = toIsoDateTime(doc.pub_date);
  if (!title || !url || !publishedAt) return null;

  // snippet duplicates abstract in current responses; lead_paragraph is usually absent.
  const description = nonEmpty(doc.abstract) ?? nonEmpty(doc.snippet);
  const leadParagraph = nonEmpty(doc.lead_paragraph);

  return {
    id: `nyt:${doc._id}`,
    externalId: doc._id,
    title,
    description,
    excerpt: leadParagraph !== description ? leadParagraph : null,
    url,
    imageUrl: imageUrlOf(doc.multimedia),
    publishedAt,
    author: normalizeAuthor(doc.byline?.original),
    category: fromProviderCategory('nyt', doc.section_name),
    provider: 'nyt',
    sourceName: NYT_SOURCE_NAME,
  };
}
