import { z } from 'zod';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { authorKey } from '@/lib/authors';
import { normalizeAuthor } from '@/lib/text';
import { CATEGORIES } from '@/services/news/categories';
import type { Category } from '@/services/news/categories';
import { PROVIDER_IDS } from '@/services/news/types';
import type { ProviderId } from '@/services/news/types';

import { addAuthor, inOrder, orderCategories, removeAuthor, toggleSource } from './lib/edit';

export type Preferences = {
  sources: ProviderId[]; // default: all three; never empty
  categories: Category[]; // default: [] = all
  authors: string[]; // normalized, case-insensitive unique
  feedHintDismissed: boolean; // the first-visit "personalize your feed" hint
};

type PreferencesActions = {
  toggleSource: (source: ProviderId) => void;
  setCategories: (categories: readonly Category[]) => void;
  /** Returns false when the name is empty or already in the list. */
  addAuthor: (name: string) => boolean;
  removeAuthor: (name: string) => void;
  /** Replaces sources, categories and authors at once (the preferences dialog's Save). */
  save: (edited: EditablePreferences) => void;
  dismissFeedHint: () => void;
  /** Back to defaults (keeps the hint dismissed: resetting isn't a first visit). */
  reset: () => void;
};

/** What the preferences dialog edits. */
export type EditablePreferences = Pick<Preferences, 'sources' | 'categories' | 'authors'>;

export type PreferencesState = Preferences & PreferencesActions;

const DEFAULTS: Preferences = {
  sources: [...PROVIDER_IDS],
  categories: [],
  authors: [],
  feedHintDismissed: false,
};

export const DEFAULT_EDITABLE: EditablePreferences = {
  sources: DEFAULTS.sources,
  categories: DEFAULTS.categories,
  authors: DEFAULTS.authors,
};

// localStorage is external data: validate it. Each field falls back on its own.
const persistedSchema = z.object({
  sources: z
    .array(z.enum(PROVIDER_IDS))
    .min(1)
    .transform((s) => inOrder(PROVIDER_IDS, s))
    .catch(DEFAULTS.sources),
  categories: z
    .array(z.enum(CATEGORIES))
    .transform((c) => inOrder(CATEGORIES, c))
    .catch(DEFAULTS.categories),
  authors: z.array(z.string()).catch(DEFAULTS.authors),
  feedHintDismissed: z.boolean().catch(DEFAULTS.feedHintDismissed),
});

export const PREFERENCES_STORAGE_KEY = 'news-prefs';

export const usePreferences = create<PreferencesState>()(
  persist(
    (set, get) => ({
      ...DEFAULTS,

      toggleSource: (source) => {
        set({ sources: toggleSource(get().sources, source) });
      },

      setCategories: (categories) => {
        set({ categories: orderCategories(categories) });
      },

      addAuthor: (name) => {
        const authors = addAuthor(get().authors, name);
        if (!authors) return false;
        set({ authors });
        return true;
      },

      removeAuthor: (name) => {
        set({ authors: removeAuthor(get().authors, name) });
      },

      save: ({ sources, categories, authors }) => {
        // At least one source must stay selected.
        if (sources.length === 0) return;
        set({
          sources: inOrder(PROVIDER_IDS, sources),
          categories: orderCategories(categories),
          authors: [...authors],
        });
      },

      dismissFeedHint: () => {
        set({ feedHintDismissed: true });
      },

      reset: () => {
        set({ ...DEFAULTS, feedHintDismissed: get().feedHintDismissed });
      },
    }),
    {
      name: PREFERENCES_STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: ({ sources, categories, authors, feedHintDismissed }): Preferences => ({
        sources,
        categories,
        authors,
        feedHintDismissed,
      }),
      // v1 is the first schema: nothing to migrate yet. Later versions transform here.
      migrate: (persisted) => persisted,
      merge: (persisted, current) => {
        const parsed = persistedSchema.safeParse(persisted ?? {});
        if (!parsed.success) return current;
        // Re-normalize authors and drop duplicates, whatever was stored.
        const authors: string[] = [];
        for (const raw of parsed.data.authors) {
          const author = normalizeAuthor(raw);
          if (author && !authors.some((a) => authorKey(a) === authorKey(author))) {
            authors.push(author);
          }
        }
        return { ...current, ...parsed.data, authors };
      },
    },
  ),
);
