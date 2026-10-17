import { screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderApp } from '@/test/render';

// Keyboard-only use of the main flows (no clicks).
describe('keyboard', () => {
  it('starts with a skip link to the main content', async () => {
    const { user } = renderApp('/');
    await screen.findByRole('heading', { name: 'Your feed' });

    await user.tab();

    const skip = screen.getByRole('link', { name: 'Skip to content' });
    expect(skip).toHaveFocus();
    expect(skip).toHaveAttribute('href', '#main');
    expect(screen.getByRole('main')).toHaveAttribute('id', 'main');
    expect(screen.getByRole('main')).toHaveAttribute('tabindex', '-1'); // focusable target
  });

  it('opens an article from its card with Enter', async () => {
    const { user } = renderApp('/');
    const title = await screen.findByRole('link', { name: /Frank and Percy review/ });

    title.focus();
    await user.keyboard('{Enter}');
    expect(
      await screen.findByRole('heading', { level: 1, name: /Frank and Percy review/ }),
    ).toBeInTheDocument();
  });

  it('opens Preferences and the Search tab with Enter', async () => {
    const { user, router } = renderApp('/');

    const preferences = await screen.findByRole('button', { name: 'Preferences' });
    preferences.focus();
    await user.keyboard('{Enter}');
    expect(await screen.findByRole('dialog', { name: 'Preferences' })).toBeInTheDocument();
    // Escape closes the popup and hands focus back to the button that opened it.
    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(preferences).toHaveFocus();
    });

    const tabs = screen.getByRole('navigation', { name: 'Tabs' });
    within(tabs).getByRole('link', { name: 'Search' }).focus();
    await user.keyboard('{Enter}');
    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/search');
    });
  });

  it('opens the search page from the header search button with Enter', async () => {
    const { user, router } = renderApp('/');

    (
      await within(await screen.findByRole('banner')).findByRole('link', { name: 'Search' })
    ).focus();
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/search');
    });
  });

  it('picks a category filter with the keyboard', async () => {
    const { user, router } = renderApp('/search?q=climate');
    const trigger = await screen.findByRole('button', { name: /^Filters/ });

    trigger.focus();
    await user.keyboard('{Enter}');
    const dialog = await screen.findByRole('dialog', { name: 'Filters' });
    // Categories are checkboxes: Space ticks the focused one.
    const business = within(dialog).getByRole('checkbox', { name: 'Business' });
    business.focus();
    await user.keyboard(' ');
    expect(business).toBeChecked();
    expect(business).toHaveFocus();

    within(dialog).getByRole('button', { name: 'Show results' }).focus();
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(router.state.location.search).toMatchObject({ categories: ['business'] });
    });
    // Focus goes back to the button that opened the popup.
    await waitFor(() => {
      expect(trigger).toHaveFocus();
    });
  });
});
