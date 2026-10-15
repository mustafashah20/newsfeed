import { screen, waitFor, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import guardianSearch from '@/test/fixtures/guardian/search.json';
import { server } from '@/test/msw/server';
import { renderApp } from '@/test/render';

// One real title per source, from the default MSW fixtures.
const GUARDIAN_TITLE = /Frank and Percy review/;
const NYT_TITLE = 'The Complicated Puzzle of the Formula 1 Schedule';
const NEWSAPI_TITLE = /Sixth person who had measles has died/;

const rateLimited = () =>
  http.get('*/api/nyt/articlesearch.json', () =>
    HttpResponse.json({ fault: { faultstring: 'Rate limit quota violation' } }, { status: 429 }),
  );

describe('feed', () => {
  it('shows articles from all three sources, linking to the in-app reader', async () => {
    renderApp('/');

    const guardianLink = await screen.findByRole('link', { name: GUARDIAN_TITLE });
    expect(screen.getByRole('link', { name: NYT_TITLE })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: NEWSAPI_TITLE })).toBeInTheDocument();
    expect(screen.getByText('Showing 10 stories')).toBeInTheDocument();

    const href = new URL(guardianLink.getAttribute('href') ?? '', 'http://x');
    expect(href.pathname).toBe('/article/guardian');
    expect(href.searchParams.get('id')).toBe(guardianSearch.response.results[0]!.id);
  });

  it('still shows the other sources when NYT is rate limited, and retries it', async () => {
    server.use(rateLimited());
    const { user } = renderApp('/');

    expect(await screen.findByRole('link', { name: GUARDIAN_TITLE })).toBeInTheDocument();
    const problems = await screen.findByRole('list', { name: 'Source problems' });
    expect(problems).toHaveTextContent('The New York Times rate limit reached');
    expect(screen.queryByRole('link', { name: NYT_TITLE })).toBeNull();

    server.resetHandlers(); // NYT recovers
    await user.click(within(problems).getByRole('button', { name: 'Retry' }));

    expect(await screen.findByRole('link', { name: NYT_TITLE })).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByRole('list', { name: 'Source problems' })).toBeNull();
    });
  });

  it('appends the next page on Show more stories without reshuffling', async () => {
    const requestedPages: string[] = [];
    server.use(
      http.get('*/api/guardian/search', ({ request }) => {
        const page = new URL(request.url).searchParams.get('page') ?? '';
        requestedPages.push(page);
        if (page !== '2') return HttpResponse.json(guardianSearch);
        const [first] = guardianSearch.response.results;
        return HttpResponse.json({
          response: {
            ...guardianSearch.response,
            currentPage: 2,
            results: [
              {
                ...first,
                id: 'world/2026/oct/01/older-story',
                webTitle: 'An older Guardian story',
                webUrl: 'https://www.theguardian.com/world/2026/oct/01/older-story',
                webPublicationDate: '2026-10-01T08:00:00Z',
              },
            ],
          },
        });
      }),
    );
    const { user } = renderApp('/');

    await screen.findByRole('link', { name: GUARDIAN_TITLE });
    const before = screen.getAllByRole('article').length;
    await user.click(screen.getByRole('button', { name: 'Show more stories' }));

    expect(
      await screen.findByRole('link', { name: 'An older Guardian story' }),
    ).toBeInTheDocument();
    expect(requestedPages).toContain('2');
    const cards = screen.getAllByRole('article');
    expect(cards.length).toBeGreaterThan(before);
    // Page 2 goes after everything from page 1, even though page 1 has older NewsAPI items.
    expect(cards.at(-1)).toHaveTextContent('An older Guardian story');
  });

  it('shows an error state with Retry when every source fails', async () => {
    server.use(
      rateLimited(),
      http.get('*/api/guardian/search', () => new HttpResponse(null, { status: 401 })),
      http.get('*/api/newsapi/top-headlines', () =>
        HttpResponse.json({ status: 'error', code: 'not_configured' }, { status: 503 }),
      ),
    );
    renderApp('/');

    expect(
      await screen.findByRole('heading', { name: 'Couldn’t load any articles' }),
    ).toBeInTheDocument();
    const problems = screen.getByRole('list', { name: 'Source problems' });
    expect(problems).toHaveTextContent("NewsAPI isn't configured");
    expect(problems).toHaveTextContent('The Guardian rejected the API key');
  });
});

describe('reader route', () => {
  // Was the milestone 6 placeholder; the real reader now opens the article (default fixture).
  it('opens for a known provider', async () => {
    renderApp('/article/guardian?id=film/2026/oct/13/x');
    expect(
      await screen.findByRole('heading', { level: 1, name: /Frank and Percy review/ }),
    ).toBeInTheDocument();
  });

  it('shows not found for an unknown provider', async () => {
    renderApp('/article/bbc?id=1');
    expect(await screen.findByRole('heading', { name: 'Page not found' })).toBeInTheDocument();
  });
});
