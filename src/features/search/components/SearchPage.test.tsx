import { screen, waitFor, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { daysAgo } from '@/lib/day-range';
import guardianSearch from '@/test/fixtures/guardian/search.json';
import newsapiEverything from '@/test/fixtures/newsapi/everything.json';
import nytSearch from '@/test/fixtures/nyt/articlesearch.json';
import { server } from '@/test/msw/server';
import { renderApp } from '@/test/render';

const GUARDIAN_TITLE = /Frank and Percy review/;
const NYT_TITLE = 'The Complicated Puzzle of the Formula 1 Schedule';
const NEWSAPI_TITLE = newsapiEverything.articles[0]!.title;

const results = () => screen.getByRole('region', { name: 'Results' });

/** Opens the Filters popup and returns it. */
async function openFilters(user: ReturnType<typeof renderApp>['user']) {
  await user.click(screen.getByRole('button', { name: /^Filters/ }));
  return screen.findByRole('dialog', { name: 'Filters' });
}

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

    expect(
      await screen.findByText('The latest articles from your sources. Type a keyword to search.'),
    ).toBeInTheDocument();
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

  it('clears the keyword field without searching', async () => {
    const { user, router } = renderApp('/search?q=climate');

    const form = await screen.findByRole('search', { name: 'Search articles' });
    const input = within(form).getByRole('searchbox', { name: 'Keyword' });
    expect(input).toHaveValue('climate');
    await user.click(within(form).getByRole('button', { name: 'Clear search' }));

    expect(input).toHaveValue('');
    expect(input).toHaveFocus();
    expect(within(form).queryByRole('button', { name: 'Clear search' })).toBeNull();
    expect(router.state.location.search).toEqual({ q: 'climate' }); // nothing submitted
  });

  it('filters by several categories: URL, chips and every provider’s own param', async () => {
    const seen = captureRequests();
    const { user, router } = renderApp('/search?q=climate');
    await screen.findByRole('link', { name: GUARDIAN_TITLE });

    const dialog = await openFilters(user);
    const categories = within(dialog).getByRole('group', { name: 'Categories' });
    await user.click(within(categories).getByRole('checkbox', { name: 'Sports' }));
    await user.click(within(categories).getByRole('checkbox', { name: 'Science' }));
    await user.click(within(dialog).getByRole('button', { name: 'Show results' }));

    await waitFor(() => {
      expect(router.state.location.search).toMatchObject({ categories: ['science', 'sports'] });
    });
    await waitFor(() => {
      expect(seen.guardian!.at(-1)?.get('section')).toBe('science|sport');
    });
    expect(seen.nyt!.at(-1)?.get('fq')).toBe('section.name:("Science" "Sports")');
    // NewsAPI takes one category per request.
    const newsapiCategories = seen.newsapi!.map((p) => p.get('category'));
    expect(newsapiCategories).toEqual(expect.arrayContaining(['science', 'sports']));

    // One chip per category; removing one keeps the other.
    const chips = screen.getByRole('list', { name: 'Active filters' });
    await user.click(within(chips).getByRole('button', { name: 'Remove filter: Science' }));
    await waitFor(() => {
      expect(router.state.location.search).toMatchObject({ categories: ['sports'] });
    });
  });

  it('opens an old single-category link', async () => {
    renderApp('/search?q=climate&category=science');

    const chips = await screen.findByRole('list', { name: 'Active filters' });
    expect(chips).toHaveTextContent('Science');
  });

  it('filters by source, keeps at least one, and the chip restores all sources', async () => {
    const { user, router } = renderApp('/search?q=climate');
    await screen.findByRole('link', { name: NYT_TITLE });

    let dialog = await openFilters(user);
    await user.click(within(dialog).getByRole('checkbox', { name: 'The New York Times' }));
    await user.click(within(dialog).getByRole('button', { name: 'Show results' }));

    await waitFor(() => {
      expect(screen.queryByRole('link', { name: NYT_TITLE })).toBeNull();
    });
    expect(router.state.location.search).toMatchObject({ sources: ['newsapi', 'guardian'] });
    const chips = screen.getByRole('list', { name: 'Active filters' });
    expect(chips).toHaveTextContent('NewsAPI, The Guardian');

    dialog = await openFilters(user);
    await user.click(within(dialog).getByRole('checkbox', { name: 'NewsAPI' }));
    expect(within(dialog).getByRole('checkbox', { name: 'The Guardian' })).toBeDisabled();
    await user.click(within(dialog).getByRole('button', { name: 'Close filters' }));

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

    const dialog = await openFilters(user);
    await user.click(within(dialog).getByRole('combobox', { name: 'Date' }));
    await user.click(await screen.findByRole('option', { name: 'Past week' }));
    await user.click(within(dialog).getByRole('button', { name: 'Show results' }));

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

  it('keeps popup edits as a draft until Show results', async () => {
    const seen = captureRequests();
    const { user, router } = renderApp('/search?q=climate');
    await screen.findByRole('link', { name: GUARDIAN_TITLE });
    const requestsBefore = seen.guardian!.length;

    let dialog = await openFilters(user);
    // All three filters live in the popup.
    expect(within(dialog).getByRole('combobox', { name: 'Date' })).toBeInTheDocument();
    expect(within(dialog).getByRole('group', { name: 'Sources' })).toBeInTheDocument();
    await user.click(within(dialog).getByRole('checkbox', { name: 'Science' }));
    await user.click(within(dialog).getByRole('button', { name: 'Close filters' }));

    // Closing discards the draft: no URL change, no request.
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Filters' })).toBeNull();
    });
    expect(router.state.location.search).toEqual({ q: 'climate' });
    expect(seen.guardian).toHaveLength(requestsBefore);

    dialog = await openFilters(user);
    expect(within(dialog).getByRole('checkbox', { name: 'Science' })).not.toBeChecked();
  });
});

// From md the same filters are inline controls. jsdom applies no CSS, so the bar is present
// alongside the (closed) small-screen popup.
describe('search filters bar (desktop)', () => {
  const bar = () => screen.getByRole('group', { name: 'Filters' });

  it('applies a quick date range from the date picker', async () => {
    const { user, router } = renderApp('/search?q=climate');
    await screen.findByRole('link', { name: GUARDIAN_TITLE });

    await user.click(within(bar()).getByRole('button', { name: 'Date: Any time' }));
    const ranges = await screen.findByRole('list', { name: 'Quick ranges' });
    await user.click(within(ranges).getByRole('button', { name: 'Past week' }));

    await waitFor(() => {
      expect(router.state.location.search).toMatchObject({ from: daysAgo(7) });
    });
    expect(within(bar()).getByRole('button', { name: 'Date: Past week' })).toBeInTheDocument();
  });

  // Every search hits every source and NYT allows 5 requests a minute, so ticking options must
  // cost nothing: only Apply searches, once.
  it('searches only on Apply, once, however many categories are ticked', async () => {
    const seen = captureRequests();
    const { user, router } = renderApp('/search?q=climate');
    await screen.findByRole('link', { name: GUARDIAN_TITLE });
    const nytBefore = seen.nyt!.length;

    await user.click(within(bar()).getByRole('button', { name: 'Categories: All categories' }));
    const panel = await screen.findByRole('dialog', { name: 'Category' });
    for (const name of ['General', 'Business', 'Science', 'Sports']) {
      await user.click(within(panel).getByRole('checkbox', { name }));
    }
    expect(router.state.location.search).toEqual({ q: 'climate' });
    expect(seen.nyt).toHaveLength(nytBefore);

    await user.click(within(panel).getByRole('button', { name: 'Apply' }));
    await waitFor(() => {
      expect(router.state.location.search).toMatchObject({
        categories: ['general', 'business', 'science', 'sports'],
      });
    });
    await waitFor(() => {
      expect(seen.nyt).toHaveLength(nytBefore + 1);
    });
    // The pill shows the first pick and how many more.
    expect(
      within(bar()).getByRole('button', { name: 'Categories: General, Business, Science, Sports' }),
    ).toHaveTextContent('General +3');
  });

  it('discards ticks when closed without Apply, and skips a search when nothing changed', async () => {
    const seen = captureRequests();
    const { user, router } = renderApp('/search?q=climate');
    await screen.findByRole('link', { name: GUARDIAN_TITLE });
    const nytBefore = seen.nyt!.length;

    await user.click(within(bar()).getByRole('button', { name: 'Categories: All categories' }));
    let panel = await screen.findByRole('dialog', { name: 'Category' });
    await user.click(within(panel).getByRole('checkbox', { name: 'Science' }));
    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Category' })).toBeNull();
    });

    // Reopening starts from what's applied; Apply with no change runs no search.
    await user.click(within(bar()).getByRole('button', { name: 'Categories: All categories' }));
    panel = await screen.findByRole('dialog', { name: 'Category' });
    expect(within(panel).getByRole('checkbox', { name: 'Science' })).not.toBeChecked();
    await user.click(within(panel).getByRole('button', { name: 'Apply' }));
    expect(router.state.location.search).toEqual({ q: 'climate' });
    expect(seen.nyt).toHaveLength(nytBefore);
  });

  it('says NewsAPI only uses its first three categories', async () => {
    // The router writes arrays as JSON, as a shared link would carry them.
    const four = encodeURIComponent(JSON.stringify(['business', 'science', 'sports', 'health']));
    const { user } = renderApp(`/search?q=climate&categories=${four}`);
    await screen.findByRole('link', { name: GUARDIAN_TITLE });

    await user.click(within(bar()).getByRole('button', { name: /^Categories: Business/ }));
    expect(await screen.findByText('NewsAPI uses your first 3 categories.')).toBeInTheDocument();
  });

  it('applies sources with Apply, keeps one, and clears everything', async () => {
    const { user, router } = renderApp('/search?q=climate');
    await screen.findByRole('link', { name: NYT_TITLE });

    await user.click(within(bar()).getByRole('button', { name: 'Sources: All sources' }));
    const panel = await screen.findByRole('dialog', { name: 'Source' });
    await user.click(within(panel).getByRole('checkbox', { name: 'The New York Times' }));
    await user.click(within(panel).getByRole('checkbox', { name: 'NewsAPI' }));
    // The last source left can't be turned off.
    expect(within(panel).getByRole('checkbox', { name: 'The Guardian' })).toBeDisabled();
    await user.click(within(panel).getByRole('button', { name: 'Apply' }));

    await waitFor(() => {
      expect(screen.queryByRole('link', { name: NYT_TITLE })).toBeNull();
    });
    expect(router.state.location.search).toMatchObject({ sources: ['guardian'] });
    expect(within(bar()).getByRole('button', { name: 'Sources: The Guardian' })).toHaveTextContent(
      'The Guardian',
    );

    await user.click(within(bar()).getByRole('button', { name: 'Clear filters' }));
    expect(await screen.findByRole('link', { name: NYT_TITLE })).toBeInTheDocument();
    expect(router.state.location.search).toEqual({ q: 'climate' });
  });
});
