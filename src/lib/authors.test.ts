import { describe, expect, it } from 'vitest';

import { authorKey, isByPreferredAuthor, splitAuthors, toAuthorName } from './authors';

describe('author helpers', () => {
  it('splits multi-author bylines into normalized names', () => {
    expect(splitAuthors('Rachel Roubein, Daniel Wu')).toEqual(['Rachel Roubein', 'Daniel Wu']);
    expect(splitAuthors('By Jane Doe and John Roe')).toEqual(['Jane Doe', 'John Roe']);
    expect(splitAuthors('Ann Lee & Bo Kim')).toEqual(['Ann Lee', 'Bo Kim']);
    expect(splitAuthors('Alexandra Anderson')).toEqual(['Alexandra Anderson']); // "and" inside a word
    expect(splitAuthors(null)).toEqual([]);
  });

  // Real Guardian live-blog bylines: the bracketed notes, and the "and" inside them, aren't names.
  it('ignores bracketed byline notes', () => {
    expect(splitAuthors('Jakub Krupa (now and earlier) and Martin Belam (earlier)')).toEqual([
      'Jakub Krupa',
      'Martin Belam',
    ]);
    expect(splitAuthors('Jakub Krupa (now) and Yohannes Lowe (earlier)')).toEqual([
      'Jakub Krupa',
      'Yohannes Lowe',
    ]);
    expect(
      isByPreferredAuthor('Jakub Krupa (now and earlier) and Martin Belam (earlier)', [
        'Martin Belam',
      ]),
    ).toBe(true);
  });

  it('turns a stored or typed name into just the person, repairing split notes', () => {
    expect(toAuthorName('Martin Belam (earlier)')).toBe('Martin Belam');
    expect(toAuthorName('By Jane Doe')).toBe('Jane Doe');
    // Pieces that older code split out of "Jakub Krupa (now and earlier)".
    expect(toAuthorName('Jakub Krupa (now')).toBe('Jakub Krupa');
    expect(toAuthorName('earlier)')).toBeNull();
    expect(toAuthorName('(now)')).toBeNull();
    expect(toAuthorName('  ')).toBeNull();
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
