import { screen, waitFor, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { daysAgo } from '@/lib/date';
import guardianSearch from '@/test/fixtures/guardian/search.json';
import newsapiEverything from '@/test/fixtures/newsapi/everything.json';
import nytSearch from '@/test/fixtures/nyt/articlesearch.json';
import { server } from '@/test/msw/server';
import { renderApp } from '@/test/render';

const GUARDIAN_TITLE = /Frank and Percy review/;
const NYT_TITLE = 'The Complicated Puzzle of the Formula 1 Schedule';
const NEWSAPI_TITLE = newsapiEverything.articles[0]!.title;

const results = () => screen.getByRole('region', { name: 'Results' });
const filters = () => screen.getByRole('complementary', { name: 'Filters' });

/** Records the query string of every request to each provider. */
function captureRequests() {
  const seen: Record<string, URLSearchParams[]> = { newsapi: [], guardian: [], nyt: [] };
  server.use(
    http.get('*/api/newsapi/*', ({ request }) => {
      seen.newsapi!.push(new URL(request.url).searchParams);
      return HttpResponse.json(newsapiEverything);
    }),
    http.get('*/api/guardian/search', ({ request }) => {
      seen.guardian!.push(new URL(request.url).searchParams);
      return HttpResponse.json(guardianSearch);
    }),
    http.get('*/api/nyt/articlesearch.json', ({ request }) => {
      seen.nyt!.push(new URL(request.url).searchParams);
      return HttpResponse.json(nytSearch);
    }),
  );
  return seen;
}

describe('search page', () => {
  it('renders results from all three sources for a keyword', async () => {
    renderApp('/search?q=climate');

    expect(await screen.findByRole('link', { name: NEWSAPI_TITLE })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: GUARDIAN_TITLE })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: NYT_TITLE })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Results for “climate”' })).toBeInTheDocument();
    expect(screen.queryByText(/Type a keyword above/)).toBeNull();
  });

  it('still shows the other sources plus a warning when NYT returns 429', async () => {
    server.use(
      http.get('*/api/nyt/articlesearch.json', () => new HttpResponse(null, { status: 429 })),
    );
    renderApp('/search?q=climate');

    expect(await screen.findByRole('link', { name: NEWSAPI_TITLE })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: GUARDIAN_TITLE })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: NYT_TITLE })).toBeNull();
    expect(await screen.findByRole('list', { name: 'Source problems' })).toHaveTextContent(
      'The New York Times rate limit reached',
    );
  });

  it('without a keyword shows the latest articles and a prompt, never a blank page', async () => {
    renderApp('/search');

    expect(await screen.findByText(/Showing the latest articles/)).toBeInTheDocument();
    expect(
      await screen.findByRole('link', { name: /Sixth person who had measles has died/ }),
    ).toBeInTheDocument();
  });

  it('runs a search from the search bar on submit', async () => {
    const seen = captureRequests();
    const { user, router } = renderApp('/search');

    const form = await screen.findByRole('search', { name: 'Search articles' });
    await user.type(within(form).getByRole('searchbox', { name: 'Keyword' }), 'elections');
    expect(seen.guardian!.some((p) => p.get('q') === 'elections')).toBe(false); // not as-you-type
    await user.click(within(form).getByRole('button', { name: 'Search' }));

    await waitFor(() => {
      expect(router.state.location.search).toMatchObject({ q: 'elections' });
    });
    await waitFor(() => {
      expect(seen.guardian!.some((p) => p.get('q') === 'elections')).toBe(true);
    });
  });

  it('filters by category: URL, chip and every provider’s own param', async () => {
    const seen = captureRequests();
    const { user, router } = renderApp('/search?q=climate');
    await screen.findByRole('link', { name: GUARDIAN_TITLE });

    await user.click(within(filters()).getByRole('combobox', { name: 'Category' }));
    await user.click(await screen.findByRole('option', { name: 'Science' }));

    await waitFor(() => {
      expect(router.state.location.search).toMatchObject({ category: 'science' });
    });
    await waitFor(() => {
      expect(seen.guardian!.at(-1)?.get('section')).toBe('science');
    });
    expect(seen.nyt!.at(-1)?.get('fq')).toBe('section.name:("Science")');
    expect(seen.newsapi!.at(-1)?.get('category')).toBe('science');
    expect(screen.getByRole('list', { name: 'Active filters' })).toHaveTextContent('Science');
  });

  it('filters by source, keeps at least one, and the chip restores all sources', async () => {
    const { user, router } = renderApp('/search?q=climate');
    await screen.findByRole('link', { name: NYT_TITLE });

    await user.click(within(filters()).getByRole('checkbox', { name: 'The New York Times' }));

    await waitFor(() => {
      expect(screen.queryByRole('link', { name: NYT_TITLE })).toBeNull();
    });
    expect(router.state.location.search).toMatchObject({ sources: ['newsapi', 'guardian'] });
    const chips = screen.getByRole('list', { name: 'Active filters' });
    expect(chips).toHaveTextContent('NewsAPI, The Guardian');

    await user.click(within(filters()).getByRole('checkbox', { name: 'NewsAPI' }));
    expect(within(filters()).getByRole('checkbox', { name: 'The Guardian' })).toBeDisabled();

    await user.click(
      within(screen.getByRole('list', { name: 'Active filters' })).getByRole('button', {
        name: /Remove filter/,
      }),
    );
    expect(await screen.findByRole('link', { name: NYT_TITLE })).toBeInTheDocument();
    expect(router.state.location.search).not.toHaveProperty('sources');
  });

  it('applies a date preset and removes it from its chip', async () => {
    const { user, router } = renderApp('/search?q=climate');
    await screen.findByRole('link', { name: GUARDIAN_TITLE });

    await user.click(within(filters()).getByRole('combobox', { name: 'Date' }));
    await user.click(await screen.findByRole('option', { name: 'Past week' }));

    await waitFor(() => {
      expect(router.state.location.search).toMatchObject({ from: daysAgo(7) });
    });
    await user.click(screen.getByRole('button', { name: 'Remove filter: Past week' }));
    await waitFor(() => {
      expect(router.state.location.search).not.toHaveProperty('from');
    });
  });

  it('shows an empty state with Clear filters when nothing matches', async () => {
    server.use(
      http.get('*/api/newsapi/*', () =>
        HttpResponse.json({ status: 'ok', totalResults: 0, articles: [] }),
      ),
      http.get('*/api/guardian/search', () =>
        HttpResponse.json({
          response: { ...guardianSearch.response, pages: 0, total: 0, results: [] },
        }),
      ),
      http.get('*/api/nyt/articlesearch.json', () =>
        HttpResponse.json({
          ...nytSearch,
          response: { docs: [], metadata: { hits: 0, offset: 0 } },
        }),
      ),
    );
    const { user, router } = renderApp('/search?q=zzzz&category=sports');

    expect(await screen.findByRole('heading', { name: 'No articles match' })).toBeInTheDocument();
    await user.click(within(results()).getByRole('button', { name: 'Clear filters' }));

    await waitFor(() => {
      expect(router.state.location.search).not.toHaveProperty('category');
    });
    expect(router.state.location.search).toMatchObject({ q: 'zzzz' });
  });

  it('opens the filters in a sheet on small screens', async () => {
    const { user } = renderApp('/search?q=climate');

    await user.click(await screen.findByRole('button', { name: 'Filters' }));
    const sheet = await screen.findByRole('dialog', { name: 'Filters' });
    expect(within(sheet).getByRole('combobox', { name: 'Category' })).toBeInTheDocument();
    await user.click(within(sheet).getByRole('button', { name: 'Show results' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Filters' })).toBeNull();
    });
  });
});
