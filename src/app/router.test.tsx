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

  it('marks the current page in the main navigation', async () => {
    renderApp('/preferences');

    const nav = await screen.findByRole('navigation', { name: 'Main' });
    expect(within(nav).getByRole('link', { name: 'Preferences' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(within(nav).getByRole('link', { name: 'Feed' })).not.toHaveAttribute('aria-current');
  });

  it('navigates from the mobile menu and closes it', async () => {
    const { user } = renderApp('/');

    await user.click(await screen.findByRole('button', { name: 'Open menu' }));
    const menu = await screen.findByRole('dialog', { name: 'Menu' });
    await user.click(within(menu).getByRole('link', { name: 'Preferences' }));

    expect(await screen.findByRole('heading', { name: 'Preferences' })).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Menu' })).not.toBeInTheDocument();
    });
  });

  it('shows the not-found page for unknown URLs', async () => {
    const { user } = renderApp('/does-not-exist');

    expect(await screen.findByRole('heading', { name: 'Page not found' })).toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: 'Go to your feed' }));

    expect(await screen.findByRole('heading', { name: 'Your feed' })).toBeInTheDocument();
  });
});
