import { describe, expect, it } from 'vitest';

import { buildGuardianSearchParams, GUARDIAN_PAGE_SIZE } from './client';

describe('buildGuardianSearchParams', () => {
  it('maps keyword, dates, sections and paging to Guardian params', () => {
    expect(
      buildGuardianSearchParams(
        { q: 'climate', from: '2026-10-01', to: '2026-10-14', categories: ['sports', 'health'] },
        2,
      ),
    ).toEqual({
      q: 'climate',
      section: 'sport|society',
      'from-date': '2026-10-01',
      'to-date': '2026-10-14',
      'order-by': 'newest',
      page: 2,
      'page-size': GUARDIAN_PAGE_SIZE,
      'show-fields': 'trailText,thumbnail,byline',
    });
  });

  it('leaves optional filters empty for the http client to drop', () => {
    const params = buildGuardianSearchParams({ categories: [] }, 1);

    expect(params.q).toBeUndefined();
    expect(params.section).toBe('');
    expect(params['from-date']).toBeUndefined();
    expect(params['to-date']).toBeUndefined();
  });
});
