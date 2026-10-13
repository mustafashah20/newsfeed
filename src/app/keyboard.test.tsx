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

  it('opens an article from its card with Enter, and follows its author with Space', async () => {
    const { user } = renderApp('/');
    const title = await screen.findByRole('link', { name: /Frank and Percy review/ });
    const card = title.closest('article')!;

    // Tab order within a card: the title link, then the Follow button.
    title.focus();
    await user.tab();
    expect(within(card).getByRole('button', { name: 'Follow Peter Bradshaw' })).toHaveFocus();
    await user.keyboard(' ');
    expect(within(card).getByRole('button', { name: 'Following Peter Bradshaw' })).toHaveFocus();

    title.focus();
    await user.keyboard('{Enter}');
    expect(
      await screen.findByRole('heading', { level: 1, name: /Frank and Percy review/ }),
    ).toBeInTheDocument();
  });

  it('opens the mobile menu, keeps focus inside, and restores it on Escape', async () => {
    const { user } = renderApp('/');
    const trigger = await screen.findByRole('button', { name: 'Open menu' });

    trigger.focus();
    await user.keyboard('{Enter}');
    const menu = await screen.findByRole('dialog', { name: 'Menu' });
    await waitFor(() => {
      expect(menu).toContainElement(document.activeElement as HTMLElement);
    });

    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Menu' })).toBeNull();
    });
    expect(trigger).toHaveFocus();
  });

  it('submits a search from the header with Enter', async () => {
    const { user, router } = renderApp('/');
    const box = await screen.findByRole('searchbox', { name: 'Search news' });

    box.focus();
    await user.keyboard('climate{Enter}');

    await waitFor(() => {
      expect(router.state.location.search).toMatchObject({ q: 'climate' });
    });
  });

  it('picks a category filter with the keyboard', async () => {
    const { user, router } = renderApp('/search?q=climate');
    const filters = await screen.findByRole('complementary', { name: 'Filters' });
    const category = within(filters).getByRole('combobox', { name: 'Category' });

    category.focus();
    await user.keyboard('{Enter}');
    await screen.findByRole('listbox');
    // Opens on the current item (All categories): two down is General → Business.
    await user.keyboard('{ArrowDown}{ArrowDown}{Enter}');

    await waitFor(() => {
      expect(router.state.location.search).toMatchObject({ category: 'business' });
    });
    expect(category).toHaveFocus();
  });
});
