import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderApp } from '@/test/render';

import { usePreferences } from '../store';

describe('preferences page', () => {
  it('toggles sources and keeps at least one on', async () => {
    const { user } = renderApp('/preferences');

    await user.click(await screen.findByRole('switch', { name: 'NewsAPI' }));
    await user.click(screen.getByRole('switch', { name: 'The New York Times' }));

    expect(usePreferences.getState().sources).toEqual(['guardian']);
    expect(screen.getByRole('switch', { name: 'The Guardian' })).toBeDisabled();
  });

  it('picks categories', async () => {
    const { user } = renderApp('/preferences');

    await user.click(await screen.findByRole('checkbox', { name: 'Technology' }));
    await user.click(screen.getByRole('checkbox', { name: 'Business' }));

    expect(usePreferences.getState().categories).toEqual(['business', 'technology']);
  });

  it('notes NewsAPI’s three-category limit', async () => {
    usePreferences.setState({ categories: ['business', 'science', 'sports', 'health'] });
    renderApp('/preferences');

    expect(await screen.findByText('NewsAPI uses your first 3 categories.')).toBeInTheDocument();
  });

  it('follows authors by name, rejecting duplicates and blanks, and unfollows', async () => {
    const { user } = renderApp('/preferences');
    const input = await screen.findByRole('textbox', { name: 'Author name' });
    const follow = screen.getByRole('button', { name: 'Follow' });

    await user.type(input, 'by Peter Bradshaw');
    await user.click(follow);
    expect(
      within(screen.getByRole('list', { name: 'Followed authors' })).getByText('Peter Bradshaw'),
    );
    expect(input).toHaveValue('');

    // user-event tracks typed text itself and misses the form's reset(); start it afresh.
    await user.clear(input);
    await user.type(input, 'peter bradshaw');
    await user.click(follow);
    expect(screen.getByRole('alert')).toHaveTextContent('You already follow peter bradshaw.');

    await user.clear(input);
    await user.click(follow);
    expect(screen.getByRole('alert')).toHaveTextContent('Enter an author’s name.');

    await user.click(screen.getByRole('button', { name: 'Unfollow Peter Bradshaw' }));
    expect(usePreferences.getState().authors).toEqual([]);
  });

  it('resets to defaults with a confirmation toast', async () => {
    usePreferences.setState({ sources: ['nyt'], categories: ['science'], authors: ['Jane Doe'] });
    const { user } = renderApp('/preferences');

    await user.click(await screen.findByRole('button', { name: 'Reset to defaults' }));

    expect(usePreferences.getState()).toMatchObject({
      sources: ['newsapi', 'guardian', 'nyt'],
      categories: [],
      authors: [],
    });
    expect(await screen.findByText('Preferences reset to defaults')).toBeInTheDocument();
  });
});
