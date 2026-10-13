import type { ProviderId } from './types';

export const CATEGORIES = [
  'general',
  'business',
  'technology',
  'science',
  'health',
  'sports',
  'entertainment',
] as const;
export type Category = (typeof CATEGORIES)[number];

type CategoryEntry = { label: string } & Record<ProviderId, string>;

// The only place provider category names live (docs/data-sources.md → Canonical categories).
// newsapi: `category` param · guardian: `section` id · nyt: `section.name` value.
const CATEGORY_TABLE = {
  general: { label: 'General', newsapi: 'general', guardian: 'world', nyt: 'World' },
  business: { label: 'Business', newsapi: 'business', guardian: 'business', nyt: 'Business' },
  technology: {
    label: 'Technology',
    newsapi: 'technology',
    guardian: 'technology',
    nyt: 'Technology',
  },
  science: { label: 'Science', newsapi: 'science', guardian: 'science', nyt: 'Science' },
  health: { label: 'Health', newsapi: 'health', guardian: 'society', nyt: 'Health' },
  sports: { label: 'Sports', newsapi: 'sports', guardian: 'sport', nyt: 'Sports' },
  entertainment: {
    label: 'Entertainment',
    newsapi: 'entertainment',
    guardian: 'culture',
    nyt: 'Arts',
  },
} as const satisfies Record<Category, CategoryEntry>;

export function categoryLabel(category: Category) {
  return CATEGORY_TABLE[category].label;
}

/** Our category → the provider's name for it. */
export function toProviderCategory(provider: ProviderId, category: Category): string {
  return CATEGORY_TABLE[category][provider];
}

/** A provider's section/category name → our category, or null when it isn't one we map. */
export function fromProviderCategory(
  provider: ProviderId,
  value: string | null | undefined,
): Category | null {
  if (!value) return null;
  const needle = value.trim().toLowerCase();
  return CATEGORIES.find((c) => CATEGORY_TABLE[c][provider].toLowerCase() === needle) ?? null;
}
