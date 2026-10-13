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

  it('follows an author from a card and puts their articles first', async () => {
    const { user } = renderApp('/');
    // NYT science piece by Natalie Wolchover: fifth newest in the default fixtures.
    const card = (
      await screen.findByRole('link', { name: /Worlds More Habitable Than Earth/ })
    ).closest('article')!;
    expect(screen.getAllByRole('article')[0]).not.toBe(card);

    await user.click(within(card).getByRole('button', { name: 'Follow Natalie Wolchover' }));

    expect(
      within(card).getByRole('button', { name: 'Following Natalie Wolchover' }),
    ).toHaveAttribute('aria-pressed', 'true');
    expect(usePreferences.getState().authors).toEqual(['Natalie Wolchover']);
    await waitFor(() => {
      expect(screen.getAllByRole('article')[0]).toHaveTextContent('Worlds More Habitable');
    });
  });

  it('follows each author of a multi-author byline', async () => {
    const { user } = renderApp('/');

    await user.click(
      await screen.findByRole('button', { name: 'Follow Rachel Roubein, Daniel Wu' }),
    );

    expect(usePreferences.getState().authors).toEqual(['Rachel Roubein', 'Daniel Wu']);
  });

  it('filters to followed authors with the switch, kept in the URL', async () => {
    const { user, router } = renderApp('/');
    const toggle = await screen.findByRole('switch', { name: 'Only followed authors' });
    expect(toggle).toBeDisabled(); // nobody followed yet

    usePreferences.getState().addAuthor('Peter Bradshaw');
    await waitFor(() => {
      expect(toggle).toBeEnabled();
    });
    await user.click(toggle);

    await waitFor(() => {
      expect(screen.getAllByRole('article')).toHaveLength(1);
    });
    expect(screen.getByRole('link', { name: REVIEW_TITLE })).toBeInTheDocument();
    expect(router.state.location.search).toEqual({ following: true });
  });

  it('explains an empty followed-only feed', async () => {
    usePreferences.setState({ authors: ['Nobody Here'] });
    renderApp('/?following=true');

    expect(
      await screen.findByRole('heading', { name: 'Nothing new from the authors you follow' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Edit preferences' })).toHaveAttribute(
      'href',
      '/preferences',
    );
  });

  it('shows a first-visit hint that stays dismissed', async () => {
    const { user } = renderApp('/');

    const hint = await screen.findByRole('complementary', { name: 'Personalize your feed' });
    expect(within(hint).getByRole('link', { name: 'Set preferences' })).toHaveAttribute(
      'href',
      '/preferences',
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
