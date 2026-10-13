import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import nytSearch from '@/test/fixtures/nyt/articlesearch.json';
import nytSections from '@/test/fixtures/nyt/articlesearch-sections.json';
import { server } from '@/test/msw/server';

import { nytProvider } from './index';

const ENDPOINT = '*/api/nyt/articlesearch.json';
const signal = () => new AbortController().signal;

function withMetadata(hits: number, offset: number) {
  return {
    ...nytSearch,
    response: { ...nytSearch.response, metadata: { ...nytSearch.response.metadata, hits, offset } },
  };
}

describe('nytProvider.fetchPage', () => {
  it('parses the real response', async () => {
    const page = await nytProvider.fetchPage({ q: 'climate', categories: [] }, 1, signal());

    expect(page.articles.map((a) => a.author)).toEqual([
      'Phillip Horton',
      'Natalie Wolchover',
      'David W. Chen',
    ]);
    expect(page.hasMore).toBe(true);
  });

  it('sends the section filter and maps the real filtered response', async () => {
    let fq: string | null = null;
    server.use(
      http.get(ENDPOINT, ({ request }) => {
        fq = new URL(request.url).searchParams.get('fq');
        return HttpResponse.json(nytSections);
      }),
    );

    const page = await nytProvider.fetchPage(
      { categories: ['technology', 'science'] },
      1,
      signal(),
    );

    expect(fq).toBe('section.name:("Technology" "Science")');
    expect(page.articles.map((a) => a.category)).toEqual(['technology', 'science']);
  });

  it('stops at the end of the hits', async () => {
    server.use(http.get(ENDPOINT, () => HttpResponse.json(withMetadata(13, 10))));

    const page = await nytProvider.fetchPage({ categories: [] }, 2, signal());

    expect(page.hasMore).toBe(false);
  });

  it('stops at the API’s last reachable page even when hits say more exist', async () => {
    server.use(http.get(ENDPOINT, () => HttpResponse.json(withMetadata(10000, 1007))));

    const page = await nytProvider.fetchPage({ categories: [] }, 101, signal());

    expect(page.hasMore).toBe(false);
  });
});
