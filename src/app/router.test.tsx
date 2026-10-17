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

  it('opens the search page from the header search button', async () => {
    const { user, router } = renderApp('/');

    await user.click(
      await within(await screen.findByRole('banner')).findByRole('link', { name: 'Search' }),
    );

    expect(await screen.findByRole('searchbox', { name: 'Keyword' })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/search');
  });

  it('titles the search page with the keyword', async () => {
    renderApp('/search?q=climate');

    expect(
      await screen.findByRole('heading', { name: 'Results for “climate”' }),
    ).toBeInTheDocument();
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
    expect(within(screen.getByRole('banner')).queryByRole('link', { name: 'Search' })).toBeNull();
  });

  it('keeps the header to the wordmark and search button, with Preferences on the feed', async () => {
    renderApp('/');

    const header = await screen.findByRole('banner');
    expect(within(header).getByRole('link', { name: 'Newsfeed' })).toHaveAttribute('href', '/');
    expect(within(header).getByRole('link', { name: 'Search' })).toBeInTheDocument();
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
