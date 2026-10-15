import { screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderApp } from '@/test/render';

describe('app shell and routing', () => {
  it('renders the feed at / with its page title', async () => {
    renderApp('/');

    expect(await screen.findByRole('heading', { name: 'Your feed' })).toBeInTheDocument();
    await waitFor(() => {
      expect(document.title).toBe('Your feed · Newsfeed');
    });
  });

  it('submits the header search to /search?q= and titles the page with the keyword', async () => {
    const { user, router } = renderApp('/');

    await user.type(await screen.findByRole('searchbox', { name: 'Search news' }), '  climate ');
    await user.click(screen.getByRole('button', { name: 'Search' }));

    expect(
      await screen.findByRole('heading', { name: 'Results for “climate”' }),
    ).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/search');
    expect(router.state.location.search).toEqual({ q: 'climate' });
    await waitFor(() => {
      expect(document.title).toBe('Search: climate · Newsfeed');
    });
  });

  it('falls back to an empty keyword when ?q is invalid', async () => {
    renderApp('/search?q=123');

    expect(await screen.findByRole('heading', { name: 'Search' })).toBeInTheDocument();
  });

  it('hides the header search on the search page, which has its own', async () => {
    renderApp('/search');

    expect(await screen.findByRole('searchbox', { name: 'Keyword' })).toBeInTheDocument();
    expect(screen.queryByRole('searchbox', { name: 'Search news' })).toBeNull();
  });

  it('keeps the header to the wordmark and search bar, with Preferences on the feed', async () => {
    renderApp('/');

    const header = await screen.findByRole('banner');
    expect(within(header).getByRole('link', { name: 'Newsfeed' })).toHaveAttribute('href', '/');
    expect(within(header).getByRole('searchbox', { name: 'Search news' })).toBeInTheDocument();
    // No nav links or Preferences in the header.
    expect(within(header).queryByRole('navigation')).toBeNull();
    expect(within(header).queryByRole('button', { name: 'Preferences' })).toBeNull();

    // Preferences sits beside the feed's chips, labelled, not just an icon.
    const main = screen.getByRole('main');
    expect(within(main).getByRole('button', { name: 'Preferences' })).toHaveAttribute(
      'aria-haspopup',
      'dialog',
    );
    const tabs = screen.getByRole('navigation', { name: 'Tabs' });
    expect(within(tabs).getByRole('link', { name: 'Feed' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('navigates from the bottom tab bar', async () => {
    const { user } = renderApp('/');

    const tabs = await screen.findByRole('navigation', { name: 'Tabs' });
    expect(within(tabs).getByRole('link', { name: 'Feed' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    await user.click(within(tabs).getByRole('link', { name: 'Search' }));

    expect(await screen.findByRole('heading', { name: 'Search' })).toBeInTheDocument();
    expect(within(tabs).getByRole('link', { name: 'Search' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('shows the not-found page for unknown URLs', async () => {
    const { user } = renderApp('/does-not-exist');

    expect(await screen.findByRole('heading', { name: 'Page not found' })).toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: 'Go to your feed' }));

    expect(await screen.findByRole('heading', { name: 'Your feed' })).toBeInTheDocument();
  });
});
