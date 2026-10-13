import { describe, expect, it } from 'vitest';

import nytSearch from '@/test/fixtures/nyt/articlesearch.json';

import { toNytArticle } from './mapper';

const [f1, science, usNews] = nytSearch.response.docs;

describe('toNytArticle', () => {
  it('maps a real doc', () => {
    expect(toNytArticle(f1)).toEqual({
      id: 'nyt:nyt://article/e14886a8-b46b-5893-932d-8e8bd535218f',
      externalId: 'nyt://article/e14886a8-b46b-5893-932d-8e8bd535218f',
      title: 'The Complicated Puzzle of the Formula 1 Schedule',
      description: f1!.abstract,
      excerpt: null, // no lead_paragraph in current responses
      url: 'https://www.nytimes.com/2026/10/13/sports/f1-schedule.html',
      imageUrl: f1!.multimedia.default.url,
      publishedAt: '2026-10-13T14:15:19.000Z',
      author: 'Phillip Horton',
      category: 'sports',
      provider: 'nyt',
      sourceName: 'The New York Times',
    });
  });

  it('maps sections to categories, leaving unmapped ones null', () => {
    expect(toNytArticle(science)?.category).toBe('science');
    expect(toNytArticle(usNews)?.category).toBeNull(); // "U.S."
  });

  it('supports the older multimedia array with relative URLs (largest image wins)', () => {
    const article = toNytArticle({
      ...f1,
      multimedia: [
        { url: 'images/small.jpg', width: 75 },
        { url: 'images/large.jpg', width: 600 },
      ],
    });

    expect(article?.imageUrl).toBe('https://www.nytimes.com/images/large.jpg');
  });

  it('uses lead_paragraph as the excerpt when present and different', () => {
    expect(toNytArticle({ ...f1, lead_paragraph: 'The season opens in March.' })?.excerpt).toBe(
      'The season opens in March.',
    );
    expect(toNytArticle({ ...f1, lead_paragraph: f1!.abstract })?.excerpt).toBeNull();
  });

  it('handles missing optional fields and drops unusable docs', () => {
    expect(toNytArticle({ ...f1, multimedia: null, byline: null, abstract: '' })).toMatchObject({
      imageUrl: null,
      author: null,
      description: f1!.snippet,
    });
    expect(toNytArticle({ ...f1, headline: { main: '' } })).toBeNull();
    expect(toNytArticle({ ...f1, pub_date: 'yesterday' })).toBeNull();
  });
});
