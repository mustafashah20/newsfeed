import { describe, expect, it } from 'vitest';

import type { Article } from '@/services/news/types';

import { combineBatches, mergeBatch, normalizeUrl } from './merge';

function article(id: string, publishedAt: string, url = `https://example.com/${id}`): Article {
  return {
    id,
    externalId: id,
    title: id,
    description: null,
    excerpt: null,
    url,
    imageUrl: null,
    publishedAt,
    author: null,
    category: null,
    provider: 'guardian',
    sourceName: 'Example',
  };
}

describe('normalizeUrl', () => {
  it('treats www, trailing slashes, case of host, hashes and tracking params as the same URL', () => {
    expect(normalizeUrl('https://WWW.Example.com/a/b/?utm_source=x&id=2#top')).toBe(
      normalizeUrl('http://example.com/a/b?id=2'),
    );
  });

  it('keeps meaningful query params and path case', () => {
    expect(normalizeUrl('https://example.com/a?id=1')).not.toBe(
      normalizeUrl('https://example.com/a?id=2'),
    );
    expect(normalizeUrl('https://example.com/A')).not.toBe(normalizeUrl('https://example.com/a'));
  });
});

describe('mergeBatch', () => {
  it('sorts newest first', () => {
    const merged = mergeBatch([
      article('old', '2026-10-10T00:00:00.000Z'),
      article('new', '2026-10-13T00:00:00.000Z'),
      article('mid', '2026-10-12T00:00:00.000Z'),
    ]);

    expect(merged.map((a) => a.id)).toEqual(['new', 'mid', 'old']);
  });

  it('dedupes by normalized URL, keeping the first occurrence', () => {
    const merged = mergeBatch([
      article('first', '2026-10-10T00:00:00.000Z', 'https://example.com/story'),
      article('dupe', '2026-10-11T00:00:00.000Z', 'https://www.example.com/story/?utm_medium=rss'),
    ]);

    expect(merged.map((a) => a.id)).toEqual(['first']);
  });
});

describe('combineBatches', () => {
  it('appends batches in order without reshuffling earlier ones', () => {
    const combined = combineBatches([
      [article('a1', '2026-10-10T00:00:00.000Z'), article('a2', '2026-10-12T00:00:00.000Z')],
      // Newer than everything in batch 1, but still comes after it.
      [article('b1', '2026-10-14T00:00:00.000Z')],
    ]);

    expect(combined.map((a) => a.id)).toEqual(['a2', 'a1', 'b1']);
  });

  it('skips articles already shown in an earlier batch', () => {
    const combined = combineBatches([
      [article('a', '2026-10-10T00:00:00.000Z', 'https://example.com/x')],
      [
        article('again', '2026-10-09T00:00:00.000Z', 'https://example.com/x/'),
        article('b', '2026-10-09T00:00:00.000Z'),
      ],
    ]);

    expect(combined.map((a) => a.id)).toEqual(['a', 'b']);
  });
});

describe('followed authors first', () => {
  it('moves matching articles to the top of their batch, keeping newest-first within groups', () => {
    const followed = (a: Article) => a.id.startsWith('f');
    const combined = combineBatches(
      [
        [
          article('n1', '2026-10-13T00:00:00.000Z'),
          article('f1', '2026-10-10T00:00:00.000Z'),
          article('f2', '2026-10-12T00:00:00.000Z'),
        ],
        [article('n2', '2026-10-09T00:00:00.000Z'), article('f3', '2026-10-01T00:00:00.000Z')],
      ],
      followed,
    );

    // Batch 2's followed article tops batch 2 only; batch 1 stays first.
    expect(combined.map((a) => a.id)).toEqual(['f2', 'f1', 'n1', 'f3', 'n2']);
  });
});
