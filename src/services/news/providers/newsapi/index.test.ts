import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import technology from '@/test/fixtures/newsapi/top-headlines-technology.json';
import topHeadlines from '@/test/fixtures/newsapi/top-headlines.json';
import { server } from '@/test/msw/server';

import { NEWSAPI_PAGE_SIZE } from './client';
import { newsapiProvider } from './index';

const signal = () => new AbortController().signal;

describe('newsapiProvider.fetchPage', () => {
  it('parses the real /everything response for a keyword', async () => {
    const page = await newsapiProvider.fetchPage({ q: 'climate', categories: [] }, 1, signal());

    expect(page.articles.map((a) => a.sourceName)).toEqual([
      'CleanTechnica',
      'New York Post',
      'ScienceAlert',
    ]);
    expect(page.hasMore).toBe(true);
  });

  it('computes hasMore from totalResults, not from a short page', async () => {
    // Real response: 4 items for pageSize 5, totalResults 35.
    const page = await newsapiProvider.fetchPage({ categories: [] }, 1, signal());

    expect(page.articles).toHaveLength(4);
    expect(page.hasMore).toBe(true);
  });

  it('stops at the free plan’s 100-result cap', async () => {
    const lastPage = Math.ceil(100 / NEWSAPI_PAGE_SIZE);
    server.use(
      http.get('*/api/newsapi/top-headlines', () =>
        HttpResponse.json({ ...topHeadlines, totalResults: 5000 }),
      ),
    );

    const page = await newsapiProvider.fetchPage({ categories: [] }, lastPage, signal());

    expect(page.hasMore).toBe(false);
  });

  it('fans out per category, tags each article and filters dates client-side', async () => {
    const requested: string[] = [];
    server.use(
      http.get('*/api/newsapi/top-headlines', ({ request }) => {
        const category = new URL(request.url).searchParams.get('category') ?? '';
        requested.push(category);
        return HttpResponse.json(category === 'technology' ? technology : topHeadlines);
      }),
    );

    const page = await newsapiProvider.fetchPage(
      // Tech fixture items are from 2026-10-12; the general fixture's include older ones.
      { from: '2026-10-12', to: '2026-10-12', categories: ['technology', 'health'] },
      1,
      signal(),
    );

    expect(requested.sort()).toEqual(['health', 'technology']);
    const tech = page.articles.filter((a) => a.category === 'technology');
    expect(tech).toHaveLength(3);
    expect(page.articles.every((a) => a.publishedAt.startsWith('2026-10-12'))).toBe(true);
  });

  it('reports a malformed response as invalid_response', async () => {
    server.use(http.get('*/api/newsapi/everything', () => HttpResponse.json({ status: 'ok' })));

    await expect(
      newsapiProvider.fetchPage({ q: 'x', categories: [] }, 1, signal()),
    ).rejects.toMatchObject({ code: 'invalid_response', provider: 'newsapi' });
  });
});
