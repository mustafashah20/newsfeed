import { describe, expect, it } from 'vitest';

import guardianSearch from '@/test/fixtures/guardian/search.json';

import { toGuardianArticle } from './mapper';

const [review, liveblog] = guardianSearch.response.results;

describe('toGuardianArticle', () => {
  it('maps a real search result', () => {
    expect(toGuardianArticle(review)).toEqual({
      id: `guardian:${review!.id}`,
      externalId: review!.id,
      title: review!.webTitle,
      description: review!.fields.trailText,
      excerpt: null,
      url: review!.webUrl,
      imageUrl: review!.fields.thumbnail,
      publishedAt: '2026-10-13T20:05:34.000Z',
      author: 'Peter Bradshaw',
      category: null, // "film" isn't one of our sections
      provider: 'guardian',
      sourceName: 'The Guardian',
    });
  });

  it('keeps liveblogs and maps known sections to categories', () => {
    expect(toGuardianArticle(liveblog)?.title).toBe(liveblog!.webTitle);
    expect(toGuardianArticle({ ...review, sectionId: 'sport' })?.category).toBe('sports');
  });

  it('strips HTML from trailText', () => {
    const article = toGuardianArticle({
      ...review,
      fields: { ...review!.fields, trailText: '<p>Ministers <strong>reject</strong> plan</p>' },
    });

    expect(article?.description).toBe('Ministers reject plan');
  });

  it('drops items without a title, a valid URL or a date', () => {
    expect(toGuardianArticle({ ...review, webTitle: ' ' })).toBeNull();
    expect(toGuardianArticle({ ...review, webUrl: 'javascript:alert(1)' })).toBeNull();
    expect(toGuardianArticle({ ...review, webPublicationDate: 'soon' })).toBeNull();
    expect(toGuardianArticle({ nope: true })).toBeNull();
  });

  it('tolerates missing fields', () => {
    expect(toGuardianArticle({ ...review, fields: undefined })).toMatchObject({
      description: null,
      imageUrl: null,
      author: null,
    });
  });
});
