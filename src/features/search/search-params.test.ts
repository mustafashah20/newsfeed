import { describe, expect, it } from 'vitest';

import {
  hasActiveFilters,
  searchParamsSchema,
  toProviderQuery,
  toSearchFilters,
  toSearchParams,
} from './search-params';

const parse = (input: unknown) => toSearchFilters(searchParamsSchema.parse(input));

describe('search params', () => {
  it('parses a full, valid URL', () => {
    expect(
      parse({
        q: ' climate ',
        from: '2026-10-01',
        to: '2026-10-14',
        category: 'science',
        sources: ['nyt', 'guardian'],
      }),
    ).toEqual({
      q: 'climate',
      from: '2026-10-01',
      to: '2026-10-14',
      category: 'science',
      sources: ['guardian', 'nyt'], // registry order
    });
  });

  it('falls back field by field on bad input instead of failing', () => {
    expect(
      parse({
        q: 42,
        from: '2026-13-45',
        to: 'yesterday',
        category: 'weather',
        sources: ['bbc'],
      }),
    ).toEqual({
      q: '',
      from: undefined,
      to: undefined,
      category: undefined,
      sources: ['newsapi', 'guardian', 'nyt'],
    });
  });

  it('treats a missing or empty source list as all sources', () => {
    expect(parse({}).sources).toEqual(['newsapi', 'guardian', 'nyt']);
    expect(parse({ sources: [] }).sources).toEqual(['newsapi', 'guardian', 'nyt']);
  });

  it('swaps a reversed date range', () => {
    expect(parse({ from: '2026-10-14', to: '2026-10-01' })).toMatchObject({
      from: '2026-10-01',
      to: '2026-10-14',
    });
  });

  it('leaves defaults out of the URL', () => {
    expect(toSearchParams(parse({ q: 'x' }))).toEqual({
      q: 'x',
      from: undefined,
      to: undefined,
      category: undefined,
      sources: undefined,
    });
    expect(toSearchParams(parse({ sources: ['nyt'] })).sources).toEqual(['nyt']);
  });

  it('builds the provider query', () => {
    expect(toProviderQuery(parse({ q: '', category: 'sports', from: '2026-10-01' }))).toEqual({
      q: undefined,
      from: '2026-10-01',
      to: undefined,
      categories: ['sports'],
    });
  });

  it('knows when filters beyond the keyword are active', () => {
    expect(hasActiveFilters(parse({ q: 'x' }))).toBe(false);
    expect(hasActiveFilters(parse({ category: 'business' }))).toBe(true);
    expect(hasActiveFilters(parse({ sources: ['nyt'] }))).toBe(true);
  });
});
