import { describe, expect, it } from 'vitest';

import { buildNewsapiRequests, NEWSAPI_PAGE_SIZE } from './client';

const NOW = new Date(2026, 9, 14); // 2026-10-14, local

describe('buildNewsapiRequests', () => {
  it('uses /everything for a keyword, with dates and the 30-day clamp on from', () => {
    expect(
      buildNewsapiRequests(
        { q: 'climate', from: '2026-08-01', to: '2026-10-10', categories: [] },
        2,
        NOW,
      ),
    ).toEqual([
      {
        path: '/everything',
        category: null,
        pageSize: NEWSAPI_PAGE_SIZE,
        params: {
          q: 'climate',
          language: 'en',
          sortBy: 'publishedAt',
          from: '2026-09-14',
          to: '2026-10-10',
          page: 2,
          pageSize: NEWSAPI_PAGE_SIZE,
        },
      },
    ]);
  });

  it('keeps a from date that is already inside the window', () => {
    const [request] = buildNewsapiRequests(
      { q: 'climate', from: '2026-10-01', categories: [] },
      1,
      NOW,
    );

    expect(request?.params.from).toBe('2026-10-01');
  });

  it('uses /top-headlines when there is no keyword (/everything requires q)', () => {
    expect(buildNewsapiRequests({ from: '2026-10-01', categories: [] }, 1, NOW)).toEqual([
      {
        path: '/top-headlines',
        category: null,
        pageSize: NEWSAPI_PAGE_SIZE,
        params: { country: 'us', page: 1, pageSize: NEWSAPI_PAGE_SIZE },
      },
    ]);
  });

  it('makes one /top-headlines request per category, at most three, splitting the page size', () => {
    const requests = buildNewsapiRequests(
      { q: 'ai', categories: ['technology', 'business', 'science', 'health'] },
      1,
      NOW,
    );

    expect(requests.map((r) => [r.path, r.category, r.params.category, r.params.q])).toEqual([
      ['/top-headlines', 'technology', 'technology', 'ai'],
      ['/top-headlines', 'business', 'business', 'ai'],
      ['/top-headlines', 'science', 'science', 'ai'],
    ]);
    expect(requests.every((r) => r.pageSize === NEWSAPI_PAGE_SIZE / 3)).toBe(true);
    expect(requests.every((r) => r.params.from === undefined)).toBe(true);
  });
});
