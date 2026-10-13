import { describe, expect, it } from 'vitest';

import { CATEGORIES, fromProviderCategory, toProviderCategory } from './categories';
import { PROVIDER_IDS } from './types';

describe('category mapping', () => {
  it('maps our categories to each provider’s names (docs/data-sources.md)', () => {
    expect(toProviderCategory('guardian', 'sports')).toBe('sport');
    expect(toProviderCategory('guardian', 'entertainment')).toBe('culture');
    expect(toProviderCategory('guardian', 'health')).toBe('society');
    expect(toProviderCategory('nyt', 'entertainment')).toBe('Arts');
    expect(toProviderCategory('newsapi', 'general')).toBe('general');
  });

  it('round-trips every category for every provider', () => {
    for (const provider of PROVIDER_IDS) {
      for (const category of CATEGORIES) {
        expect(fromProviderCategory(provider, toProviderCategory(provider, category))).toBe(
          category,
        );
      }
    }
  });

  it('matches case-insensitively and returns null for unmapped sections', () => {
    expect(fromProviderCategory('nyt', 'sports')).toBe('sports');
    expect(fromProviderCategory('nyt', 'U.S.')).toBeNull();
    expect(fromProviderCategory('guardian', 'film')).toBeNull();
    expect(fromProviderCategory('guardian', undefined)).toBeNull();
  });
});
