import { describe, expect, it } from 'vitest';

import topHeadlines from '@/test/fixtures/newsapi/top-headlines.json';

import { stripTruncationMarker, toNewsapiArticle } from './mapper';

const [washingtonPost, , foxNews, allNulls] = topHeadlines.articles;

describe('toNewsapiArticle', () => {
  it('maps a real article, using the URL as its id', () => {
    const article = toNewsapiArticle(washingtonPost, null);

    expect(article).toMatchObject({
      id: `newsapi:${washingtonPost!.url}`,
      externalId: washingtonPost!.url,
      title: washingtonPost!.title,
      description: washingtonPost!.description,
      url: washingtonPost!.url,
      imageUrl: washingtonPost!.urlToImage,
      publishedAt: '2026-10-12T18:31:18.000Z',
      author: 'Rachel Roubein, Daniel Wu',
      category: null,
      provider: 'newsapi',
      sourceName: 'The Washington Post',
    });
    expect(article?.excerpt).not.toMatch(/\[\+\d+ chars\]/);
    expect(article?.excerpt?.endsWith('…')).toBe(true);
  });

  it('tags the category the request was made for', () => {
    expect(toNewsapiArticle(foxNews, 'entertainment')?.category).toBe('entertainment');
  });

  it('keeps a real item whose author, description, image and content are all null', () => {
    expect(toNewsapiArticle(allNulls, null)).toMatchObject({
      author: 'WSJ',
      description: null,
      excerpt: null,
      imageUrl: null,
      sourceName: 'The Wall Street Journal',
    });
    expect(toNewsapiArticle({ ...foxNews, author: null }, null)?.author).toBeNull();
  });

  it('drops "[Removed]" placeholders and unusable items', () => {
    expect(toNewsapiArticle({ ...washingtonPost, title: '[Removed]' }, null)).toBeNull();
    expect(toNewsapiArticle({ ...washingtonPost, url: 'https://removed.com' }, null)).toBeNull();
    expect(toNewsapiArticle({ ...washingtonPost, url: null }, null)).toBeNull();
    expect(toNewsapiArticle({ ...washingtonPost, publishedAt: null }, null)).toBeNull();
  });

  it('falls back to the hostname when the source has no name, and strips HTML', () => {
    const article = toNewsapiArticle(
      {
        ...washingtonPost,
        source: { id: null, name: null },
        description: '<ul><li>Point one</li></ul>',
      },
      null,
    );

    expect(article?.sourceName).toBe('washingtonpost.com');
    expect(article?.description).toBe('Point one');
  });
});

describe('stripTruncationMarker', () => {
  it('removes the "[+N chars]" marker and keeps the ellipsis', () => {
    expect(stripTruncationMarker('A woman who had been d… [+22 chars]')).toBe(
      'A woman who had been d…',
    );
    expect(stripTruncationMarker('No marker here')).toBe('No marker here');
    expect(stripTruncationMarker(null)).toBeNull();
  });
});
