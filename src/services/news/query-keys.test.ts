import { describe, expect, it } from 'vitest';

import { articleKeys, normalizeQuery } from './query-keys';

describe('query keys', () => {
  it('gives equivalent filters the same key', () => {
    const a = articleKeys.page('nyt', { q: '  climate ', categories: ['science', 'business'] }, 1);
    const b = articleKeys.page(
      'nyt',
      { q: 'climate', from: '', categories: ['business', 'science', 'business'] },
      1,
    );

    expect(a).toEqual(b);
  });

  it('drops empty values', () => {
    expect(normalizeQuery({ q: '   ', from: undefined, to: '', categories: [] })).toEqual({
      categories: [],
    });
  });

  it('keeps provider, page, detail and preview keys distinct', () => {
    const query = { categories: [] };
    expect(articleKeys.page('nyt', query, 1)).not.toEqual(articleKeys.page('guardian', query, 1));
    expect(articleKeys.page('nyt', query, 1)).not.toEqual(articleKeys.page('nyt', query, 2));
    expect(articleKeys.detail('guardian', 'a/b')).not.toEqual(
      articleKeys.preview('guardian', 'a/b'),
    );
  });
});
