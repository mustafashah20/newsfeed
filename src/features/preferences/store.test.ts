import { describe, expect, it } from 'vitest';

import { PREFERENCES_STORAGE_KEY, usePreferences } from './store';

const state = () => usePreferences.getState();

async function rehydrateFrom(stored: unknown) {
  localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(stored));
  await usePreferences.persist.rehydrate();
}

describe('preferences store', () => {
  it('starts with all sources, all categories and no authors', () => {
    expect(state()).toMatchObject({
      sources: ['newsapi', 'guardian', 'nyt'],
      categories: [],
      authors: [],
      feedHintDismissed: false,
    });
  });

  it('toggles sources in registry order and never removes the last one', () => {
    state().toggleSource('newsapi');
    state().toggleSource('nyt');
    expect(state().sources).toEqual(['guardian']);

    state().toggleSource('guardian');
    expect(state().sources).toEqual(['guardian']);

    state().toggleSource('newsapi');
    expect(state().sources).toEqual(['newsapi', 'guardian']);
  });

  it('stores categories in table order without duplicates', () => {
    state().setCategories(['sports', 'business', 'sports']);
    expect(state().categories).toEqual(['business', 'sports']);
  });

  it('adds authors normalized and case-insensitively unique', () => {
    expect(state().addAuthor('  by   Peter Bradshaw ')).toBe(true);
    expect(state().addAuthor('PETER BRADSHAW')).toBe(false);
    expect(state().addAuthor('   ')).toBe(false);
    expect(state().authors).toEqual(['Peter Bradshaw']);

    state().removeAuthor('peter bradshaw');
    expect(state().authors).toEqual([]);
  });

  it('saves an edited set in canonical order and never with no sources', () => {
    state().save({
      sources: ['nyt', 'newsapi'],
      categories: ['technology', 'business'],
      authors: ['Bo Kim'],
    });
    expect(state()).toMatchObject({
      sources: ['newsapi', 'nyt'],
      categories: ['business', 'technology'],
      authors: ['Bo Kim'],
    });

    state().save({ sources: [], categories: [], authors: [] });
    expect(state().sources).toEqual(['newsapi', 'nyt']);
  });

  it('resets to defaults but keeps the hint dismissed', () => {
    state().toggleSource('nyt');
    state().setCategories(['science']);
    state().addAuthor('Jane Doe');
    state().dismissFeedHint();

    state().reset();

    expect(state()).toMatchObject({
      sources: ['newsapi', 'guardian', 'nyt'],
      categories: [],
      authors: [],
      feedHintDismissed: true,
    });
  });

  it('persists to localStorage under a versioned key', () => {
    state().addAuthor('Jane Doe');

    const stored: unknown = JSON.parse(localStorage.getItem(PREFERENCES_STORAGE_KEY) ?? 'null');
    expect(stored).toMatchObject({ version: 1, state: { authors: ['Jane Doe'] } });
  });

  it('restores valid stored preferences', async () => {
    await rehydrateFrom({
      version: 1,
      state: {
        sources: ['nyt', 'guardian'],
        categories: ['science'],
        authors: ['Jane Doe'],
        feedHintDismissed: true,
      },
    });

    expect(state()).toMatchObject({
      sources: ['guardian', 'nyt'],
      categories: ['science'],
      authors: ['Jane Doe'],
      feedHintDismissed: true,
    });
  });

  it('ignores invalid stored fields one by one instead of crashing', async () => {
    await rehydrateFrom({
      version: 1,
      state: {
        sources: [],
        categories: ['weather'],
        authors: ['by jane doe', 'Jane Doe', '  ', 7],
        feedHintDismissed: 'yes',
      },
    });

    expect(state()).toMatchObject({
      sources: ['newsapi', 'guardian', 'nyt'],
      categories: [],
      authors: [],
      feedHintDismissed: false,
    });
  });

  it('cleans up valid but messy stored authors', async () => {
    await rehydrateFrom({ version: 1, state: { authors: ['by jane doe', 'Jane  Doe', 'Bo Kim'] } });

    expect(state().authors).toEqual(['jane doe', 'Bo Kim']);
  });
});
