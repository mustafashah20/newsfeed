import { z } from 'zod';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { authorKey } from '@/lib/authors';
import { normalizeAuthor } from '@/lib/text';
import { CATEGORIES } from '@/services/news/categories';
import type { Category } from '@/services/news/categories';
import { PROVIDER_IDS } from '@/services/news/types';
import type { ProviderId } from '@/services/news/types';

export type Preferences = {
  sources: ProviderId[]; // default: all three; never empty
  categories: Category[]; // default: [] = all
  authors: string[]; // normalized, case-insensitive unique
  feedHintDismissed: boolean; // the first-visit "personalize your feed" hint
};

type PreferencesActions = {
  toggleSource: (source: ProviderId) => void;
  setCategories: (categories: readonly Category[]) => void;
  /** Returns false when the name is empty or already followed. */
  addAuthor: (name: string) => boolean;
  removeAuthor: (name: string) => void;
  dismissFeedHint: () => void;
  /** Back to defaults (keeps the hint dismissed: resetting isn't a first visit). */
  reset: () => void;
};

export type PreferencesState = Preferences & PreferencesActions;

const DEFAULTS: Preferences = {
  sources: [...PROVIDER_IDS],
  categories: [],
  authors: [],
  feedHintDismissed: false,
};

// Registry/table order, so equal selections always look (and cache) the same.
const inOrder = <T extends string>(all: readonly T[], selected: readonly T[]) =>
  all.filter((item) => selected.includes(item));

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
        const { sources } = get();
        if (!sources.includes(source)) {
          set({ sources: inOrder(PROVIDER_IDS, [...sources, source]) });
          return;
        }
        // At least one source must stay selected.
        if (sources.length === 1) return;
        set({ sources: sources.filter((s) => s !== source) });
      },

      setCategories: (categories) => {
        set({ categories: inOrder(CATEGORIES, categories) });
      },

      addAuthor: (name) => {
        const author = normalizeAuthor(name);
        if (!author) return false;
        const { authors } = get();
        if (authors.some((a) => authorKey(a) === authorKey(author))) return false;
        set({ authors: [...authors, author] });
        return true;
      },

      removeAuthor: (name) => {
        const key = authorKey(name);
        set({ authors: get().authors.filter((a) => authorKey(a) !== key) });
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
