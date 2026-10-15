import { screen, waitFor, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { usePreferences } from '@/features/preferences';
import guardianSearch from '@/test/fixtures/guardian/search.json';
import { server } from '@/test/msw/server';
import { renderApp } from '@/test/render';

const REVIEW_TITLE = /Frank and Percy review/; // by Peter Bradshaw

describe('personalized feed', () => {
  it('fetches only preferred sources, with preferred categories', async () => {
    const requested: string[] = [];
    let section: string | null = null;
    server.use(
      http.get('*/api/:provider/*', ({ params, request }) => {
        requested.push(String(params.provider));
        section = new URL(request.url).searchParams.get('section');
        return HttpResponse.json(guardianSearch);
      }),
    );
    usePreferences.setState({ sources: ['guardian'], categories: ['science', 'sports'] });

    renderApp('/');

    expect(await screen.findByRole('link', { name: REVIEW_TITLE })).toBeInTheDocument();
    expect(new Set(requested)).toEqual(new Set(['guardian']));
    expect(section).toBe('science|sport');
  });

  it('puts preferred authors first, so their story leads', async () => {
    usePreferences.setState({ authors: ['Natalie Wolchover'] });
    renderApp('/');

    // NYT science piece: fifth newest in the default fixtures.
    const link = await screen.findByRole('link', { name: /Worlds More Habitable Than Earth/ });
    expect(screen.getAllByRole('article')[0]).toBe(link.closest('article'));
  });

  it('adds a chip per preferred category that filters the loaded stories', async () => {
    usePreferences.setState({ categories: ['science', 'sports'] });
    const { user, router } = renderApp('/');
    const chips = await screen.findByRole('group', { name: 'Filter stories' });
    expect(
      within(chips)
        .getAllByRole('button')
        .map((b) => b.textContent),
    ).toEqual(['All stories', 'Science', 'Sports']);

    await screen.findByRole('link', { name: /Worlds More Habitable Than Earth/ });
    await user.click(within(chips).getByRole('button', { name: 'Science' }));

    expect(router.state.location.search).toEqual({ filter: 'science' });
    await waitFor(() => {
      expect(screen.queryByRole('link', { name: REVIEW_TITLE })).toBeNull();
    });
    expect(
      screen.getByRole('link', { name: /Worlds More Habitable Than Earth/ }),
    ).toBeInTheDocument();
  });

  it('explains an empty category chip', async () => {
    // A shared link: the default feed has no Health stories in the fixtures.
    renderApp('/?filter=health');

    expect(
      await screen.findByRole('heading', { name: 'No Health stories yet' }),
    ).toBeInTheDocument();
    const chips = screen.getByRole('group', { name: 'Filter stories' });
    expect(within(chips).getByRole('button', { name: 'Health' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    // Preferences already sits beside the chips; the empty state doesn't repeat it.
    expect(screen.queryByRole('button', { name: 'Edit preferences' })).toBeNull();
  });

  it('treats an old ?filter=following link as All stories', async () => {
    renderApp('/?filter=following');

    const chips = await screen.findByRole('group', { name: 'Filter stories' });
    expect(within(chips).getByRole('button', { name: 'All stories' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(within(chips).queryByRole('button', { name: 'Following' })).toBeNull();
  });

  it('shows a first-visit hint that stays dismissed', async () => {
    const { user } = renderApp('/');

    const hint = await screen.findByRole('complementary', { name: 'Personalize your feed' });
    expect(within(hint).getByRole('button', { name: 'Set preferences' })).toHaveAttribute(
      'aria-haspopup',
      'dialog',
    );
    await user.click(within(hint).getByRole('button', { name: 'Dismiss' }));

    expect(screen.queryByRole('complementary', { name: 'Personalize your feed' })).toBeNull();
    expect(usePreferences.getState().feedHintDismissed).toBe(true);
  });

  it('hides the hint once the feed is personalized', async () => {
    usePreferences.setState({ categories: ['business'] });
    renderApp('/');

    await screen.findByRole('heading', { name: 'Your feed' });
    expect(screen.queryByRole('complementary', { name: 'Personalize your feed' })).toBeNull();
  });
});
