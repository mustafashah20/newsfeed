import { describe, expect, it } from 'vitest';

import { buildNytSearchParams, buildNytSectionFilter } from './client';

describe('buildNytSearchParams', () => {
  it('maps keyword, compact dates, sections and the 0-based page', () => {
    expect(
      buildNytSearchParams(
        {
          q: 'climate',
          from: '2026-10-01',
          to: '2026-10-14',
          categories: ['technology', 'entertainment'],
        },
        3,
      ),
    ).toEqual({
      q: 'climate',
      fq: 'section.name:("Technology" "Arts")',
      begin_date: '20261001',
      end_date: '20261014',
      sort: 'newest',
      page: 2,
    });
  });

  it('sends page 0 for the app’s first page and omits empty filters', () => {
    const params = buildNytSearchParams({ categories: [] }, 1);

    expect(params.page).toBe(0);
    expect(params.fq).toBeUndefined();
    expect(params.q).toBeUndefined();
    expect(params.begin_date).toBeUndefined();
  });

  it('uses the verified section.name filter syntax', () => {
    expect(buildNytSectionFilter({ categories: ['science'] })).toBe('section.name:("Science")');
  });
});
