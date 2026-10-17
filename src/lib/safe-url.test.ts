import { describe, expect, it } from 'vitest';

import { toHttpUrl } from './safe-url';

describe('toHttpUrl', () => {
  it('accepts absolute http(s) URLs and resolves relative ones against a base', () => {
    expect(toHttpUrl('https://example.com/a')).toBe('https://example.com/a');
    expect(toHttpUrl('images/x.jpg', 'https://www.nytimes.com/')).toBe(
      'https://www.nytimes.com/images/x.jpg',
    );
  });

  it('rejects unsafe, relative-without-base and empty values', () => {
    expect(toHttpUrl('javascript:alert(1)')).toBeNull();
    expect(toHttpUrl('data:image/png;base64,AAAA')).toBeNull();
    expect(toHttpUrl('/relative')).toBeNull();
    expect(toHttpUrl('')).toBeNull();
    expect(toHttpUrl(null)).toBeNull();
  });
});
