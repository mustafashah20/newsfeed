import { screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderApp } from '@/test/render';

import { usePreferences } from '../store';

async function openPreferences() {
  const app = renderApp('/');
  const main = await screen.findByRole('main');
  await app.user.click(within(main).getByRole('button', { name: 'Preferences' }));
  const dialog = await screen.findByRole('dialog', { name: 'Preferences' });
  return { ...app, dialog };
}

describe('preferences dialog', () => {
  it('opens from the feed and closes with the close button', async () => {
    const { user, router, dialog } = await openPreferences();

    expect(router.state.location.pathname).toBe('/');
    await user.click(within(dialog).getByRole('button', { name: 'Close preferences' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Preferences' })).toBeNull();
    });
  });

  it('toggles sources, keeps at least one on, and saves them', async () => {
    const { user, dialog } = await openPreferences();

    await user.click(within(dialog).getByRole('switch', { name: 'NewsAPI' }));
    await user.click(within(dialog).getByRole('switch', { name: 'The New York Times' }));
    expect(within(dialog).getByRole('switch', { name: 'The Guardian' })).toBeDisabled();
    // A draft until saved: the feed behind the popup doesn't refetch yet.
    expect(usePreferences.getState().sources).toEqual(['newsapi', 'guardian', 'nyt']);

    await user.click(within(dialog).getByRole('button', { name: 'Save preferences' }));
    expect(usePreferences.getState().sources).toEqual(['guardian']);
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Preferences' })).toBeNull();
    });
  });

  it('picks categories in table order', async () => {
    const { user, dialog } = await openPreferences();

    await user.click(within(dialog).getByRole('checkbox', { name: 'Technology' }));
    await user.click(within(dialog).getByRole('checkbox', { name: 'Business' }));
    await user.click(within(dialog).getByRole('button', { name: 'Save preferences' }));

    expect(usePreferences.getState().categories).toEqual(['business', 'technology']);
  });

  it('discards the draft when closed without saving', async () => {
    const { user, dialog } = await openPreferences();

    await user.click(within(dialog).getByRole('checkbox', { name: 'Science' }));
    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Preferences' })).toBeNull();
    });
    expect(usePreferences.getState().categories).toEqual([]);

    const main = screen.getByRole('main');
    await user.click(within(main).getByRole('button', { name: 'Preferences' }));
    const reopened = await screen.findByRole('dialog', { name: 'Preferences' });
    expect(within(reopened).getByRole('checkbox', { name: 'Science' })).not.toBeChecked();
  });

  it('notes NewsAPI’s three-category limit', async () => {
    usePreferences.setState({ categories: ['business', 'science', 'sports', 'health'] });
    const { dialog } = await openPreferences();

    expect(within(dialog).getByText('NewsAPI uses your first 3 categories.')).toBeInTheDocument();
  });

  it('adds preferred authors by name, rejecting duplicates and blanks, and removes them', async () => {
    const { user, dialog } = await openPreferences();
    const input = within(dialog).getByRole('textbox', { name: 'Author name' });
    const add = within(dialog).getByRole('button', { name: 'Add' });

    await user.type(input, 'by Peter Bradshaw');
    await user.click(add);
    expect(
      within(within(dialog).getByRole('list', { name: 'Preferred authors' })).getByText(
        'Peter Bradshaw',
      ),
    );
    expect(input).toHaveValue('');

    // user-event tracks typed text itself and misses the form's reset(); start it afresh.
    await user.clear(input);
    await user.type(input, 'peter bradshaw');
    await user.click(add);
    expect(within(dialog).getByRole('alert')).toHaveTextContent(
      'peter bradshaw is already in your authors.',
    );

    await user.clear(input);
    await user.click(add);
    expect(within(dialog).getByRole('alert')).toHaveTextContent('Enter an author’s name.');

    await user.type(input, 'Jane Doe');
    await user.click(add);
    await user.click(within(dialog).getByRole('button', { name: 'Remove Peter Bradshaw' }));
    await user.click(within(dialog).getByRole('button', { name: 'Save preferences' }));
    expect(usePreferences.getState().authors).toEqual(['Jane Doe']);
  });

  it('resets the draft to defaults, applied on save', async () => {
    usePreferences.setState({ sources: ['nyt'], categories: ['science'], authors: ['Jane Doe'] });
    const { user, dialog } = await openPreferences();

    await user.click(within(dialog).getByRole('button', { name: 'Reset' }));
    expect(within(dialog).getByRole('switch', { name: 'NewsAPI' })).toBeChecked();
    expect(usePreferences.getState().sources).toEqual(['nyt']);

    await user.click(within(dialog).getByRole('button', { name: 'Save preferences' }));
    expect(usePreferences.getState()).toMatchObject({
      sources: ['newsapi', 'guardian', 'nyt'],
      categories: [],
      authors: [],
    });
  });
});
