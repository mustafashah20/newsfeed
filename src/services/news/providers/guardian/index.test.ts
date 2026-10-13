import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import guardianSearch from '@/test/fixtures/guardian/search.json';
import { server } from '@/test/msw/server';

import { guardianProvider } from './index';

const signal = () => new AbortController().signal;

describe('guardianProvider.fetchPage', () => {
  it('parses the real response and reports more pages', async () => {
    const page = await guardianProvider.fetchPage({ q: 'climate', categories: [] }, 1, signal());

    expect(page.articles).toHaveLength(3);
    expect(page.articles.every((a) => a.provider === 'guardian')).toBe(true);
    expect(page.hasMore).toBe(true);
  });

  it('stops paging on the last page and skips invalid items', async () => {
    server.use(
      http.get('*/api/guardian/search', () =>
        HttpResponse.json({
          response: {
            ...guardianSearch.response,
            currentPage: 2,
            pages: 2,
            results: [guardianSearch.response.results[0], { broken: true }],
          },
        }),
      ),
    );

    const page = await guardianProvider.fetchPage({ categories: [] }, 2, signal());

    expect(page.articles).toHaveLength(1);
    expect(page.hasMore).toBe(false);
  });

  it('fails the page when the response shape is wrong', async () => {
    server.use(http.get('*/api/guardian/search', () => HttpResponse.json({ unexpected: true })));

    await expect(guardianProvider.fetchPage({ categories: [] }, 1, signal())).rejects.toMatchObject(
      {
        code: 'invalid_response',
        provider: 'guardian',
      },
    );
  });
});
