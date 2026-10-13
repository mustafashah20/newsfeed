import { toIsoDateTime } from '@/lib/date';
import { htmlToText, nonEmpty, normalizeAuthor } from '@/lib/text';
import { toHttpUrl } from '@/lib/url';

import { fromProviderCategory } from '../../categories';
import { toPreviewDetail } from '../../preview';
import type { Article, ArticleDetail } from '../../types';
import { parseGuardianBody } from './body-parser';
import { guardianDetailSchema, guardianItemSchema } from './schema';
import type { GuardianDetail } from './schema';

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

/** The widest https asset of the main image element. */
function heroImageOf(elements: GuardianDetail['elements']): string | null {
  const main = elements?.find((e) => e.relation === 'main' && e.type === 'image');
  let best: { url: string; width: number } | null = null;
  for (const asset of main?.assets ?? []) {
    const url = toHttpUrl(asset.typeData?.secureFile ?? asset.file);
    const width = Number(asset.typeData?.width ?? 0);
    if (url && (!best || width > best.width)) best = { url, width };
  }
  return best?.url ?? null;
}

/** Single-item content → the reader's article: full body when it has text, else a preview. */
export function toGuardianDetail(raw: unknown): ArticleDetail | null {
  const article = toGuardianArticle(raw);
  const detail = guardianDetailSchema.safeParse(raw);
  if (!article || !detail.success) return null;

  const withHero = { ...article, imageUrl: heroImageOf(detail.data.elements) ?? article.imageUrl };
  const blocks = parseGuardianBody(detail.data.fields?.body);
  // Interactives and videos can have an empty body: show what the list gave us instead.
  if (blocks.length === 0) return toPreviewDetail(withHero);
  return { ...withHero, blocks, isFullText: true };
}
