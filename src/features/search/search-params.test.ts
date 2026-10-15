import { describe, expect, it } from 'vitest';

import {
  hasActiveFilters,
  isNewsapiCategoryCapped,
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
        categories: ['sports', 'science'],
        sources: ['nyt', 'guardian'],
      }),
    ).toEqual({
      q: 'climate',
      from: '2026-10-01',
      to: '2026-10-14',
      categories: ['science', 'sports'], // table order
      sources: ['guardian', 'nyt'], // registry order
    });
  });

  it('drops unknown categories one by one and still opens old single-category links', () => {
    expect(parse({ categories: ['weather', 'sports', 7] }).categories).toEqual(['sports']);
    expect(parse({ categories: 'sports' }).categories).toEqual([]);
    expect(parse({ category: 'science' }).categories).toEqual(['science']);
    expect(parse({ category: 'science', categories: ['sports'] }).categories).toEqual([
      'science',
      'sports',
    ]);
  });

  it('falls back field by field on bad input instead of failing', () => {
    expect(
      parse({
        q: 42,
        from: '2026-13-45',
        to: 'yesterday',
        categories: ['weather'],
        sources: ['bbc'],
      }),
    ).toEqual({
      q: '',
      from: undefined,
      to: undefined,
      categories: [],
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
      categories: undefined,
      category: undefined,
      sources: undefined,
    });
    expect(toSearchParams(parse({ sources: ['nyt'] })).sources).toEqual(['nyt']);
    // An old single-category link is rewritten to the list form.
    expect(toSearchParams(parse({ category: 'sports' }))).toMatchObject({
      categories: ['sports'],
      category: undefined,
    });
  });

  it('builds the provider query', () => {
    expect(
      toProviderQuery(parse({ q: '', categories: ['sports', 'business'], from: '2026-10-01' })),
    ).toEqual({
      q: undefined,
      from: '2026-10-01',
      to: undefined,
      categories: ['business', 'sports'],
    });
  });

  it('flags when NewsAPI will only use its first categories', () => {
    const four = ['business', 'science', 'sports', 'health'] as const;
    expect(isNewsapiCategoryCapped(parse({ categories: [...four] }))).toBe(true);
    expect(isNewsapiCategoryCapped(parse({ categories: four.slice(0, 3) }))).toBe(false);
    // Without NewsAPI there's nothing to cap.
    expect(isNewsapiCategoryCapped(parse({ categories: [...four], sources: ['nyt'] }))).toBe(false);
  });

  it('knows when filters beyond the keyword are active', () => {
    expect(hasActiveFilters(parse({ q: 'x' }))).toBe(false);
    expect(hasActiveFilters(parse({ categories: ['business'] }))).toBe(true);
    expect(hasActiveFilters(parse({ sources: ['nyt'] }))).toBe(true);
  });
});
