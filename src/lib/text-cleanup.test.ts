import { describe, expect, it } from 'vitest';

import { collapseWhitespace, htmlToText, nonEmpty } from './text-cleanup';

describe('text cleanup', () => {
  it('collapses whitespace and returns null for blank text', () => {
    expect(collapseWhitespace('  a \n\t b c ')).toBe('a b c');
    expect(nonEmpty('   ')).toBeNull();
    expect(nonEmpty(undefined)).toBeNull();
  });

  it('turns HTML into plain text without leaking markup', () => {
    expect(
      htmlToText('<p>Rates <strong>rise</strong> &amp; <a href="#">markets</a> fall</p>'),
    ).toBe('Rates rise & markets fall');
    expect(htmlToText('<img src=x onerror="alert(1)"><script>alert(1)</script>Safe')).toBe('Safe');
    expect(htmlToText('')).toBeNull();
  });
});
