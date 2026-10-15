import { describe, expect, it } from 'vitest';

import { authorKey, isByPreferredAuthor, splitAuthors } from './authors';

describe('author helpers', () => {
  it('splits multi-author bylines into normalized names', () => {
    expect(splitAuthors('Rachel Roubein, Daniel Wu')).toEqual(['Rachel Roubein', 'Daniel Wu']);
    expect(splitAuthors('By Jane Doe and John Roe')).toEqual(['Jane Doe', 'John Roe']);
    expect(splitAuthors('Ann Lee & Bo Kim')).toEqual(['Ann Lee', 'Bo Kim']);
    expect(splitAuthors('Alexandra Anderson')).toEqual(['Alexandra Anderson']); // "and" inside a word
    expect(splitAuthors(null)).toEqual([]);
  });

  it('compares names case- and spacing-insensitively', () => {
    expect(authorKey('  Jane   DOE ')).toBe(authorKey('jane doe'));
  });

  it('matches when any author in the byline is preferred', () => {
    expect(isByPreferredAuthor('Rachel Roubein, Daniel Wu', ['daniel wu'])).toBe(true);
    expect(isByPreferredAuthor('Peter Bradshaw', ['Peter'])).toBe(false);
    expect(isByPreferredAuthor(null, ['Peter Bradshaw'])).toBe(false);
    expect(isByPreferredAuthor('Peter Bradshaw', [])).toBe(false);
  });
});
