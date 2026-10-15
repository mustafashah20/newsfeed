import { describe, expect, it } from 'vitest';

import type { Category } from '@/services/news/categories';
import type { Article } from '@/services/news/types';

import { chipCategories, filterStories, joinNames, splitStories } from './stories';

function article(id: string, category: Category | null = null, author: string | null = null) {
  const value: Article = {
    id,
    externalId: id,
    title: id,
    description: null,
    excerpt: null,
    url: `https://example.com/${id}`,
    imageUrl: null,
    publishedAt: '2026-10-15T08:00:00Z',
    author,
    category,
    provider: 'guardian',
    sourceName: 'Example',
  };
  return value;
}

const ids = (articles: readonly Article[]) => articles.map((a) => a.id);

describe('filterStories', () => {
  const stories = [
    article('a', 'science', 'Ann'),
    article('b', 'sports', 'Bob'),
    article('c', null, 'Ann'),
  ];
  it('keeps everything for All stories', () => {
    expect(ids(filterStories(stories, undefined))).toEqual(['a', 'b', 'c']);
  });

  it('keeps one category, dropping stories without one', () => {
    expect(ids(filterStories(stories, 'sports'))).toEqual(['b']);
  });
});

describe('splitStories', () => {
  it('splits into a lead, a row of three and the rest', () => {
    const { lead, row, list } = splitStories(
      ['1', '2', '3', '4', '5', '6'].map((id) => article(id)),
    );
    expect(lead?.id).toBe('1');
    expect(ids(row)).toEqual(['2', '3', '4']);
    expect(ids(list)).toEqual(['5', '6']);
  });

  it('copes with fewer stories than the layout has room for', () => {
    expect(splitStories([])).toEqual({ lead: null, row: [], list: [] });
    const { row, list } = splitStories([article('1'), article('2')]);
    expect(ids(row)).toEqual(['2']);
    expect(list).toEqual([]);
  });
});

describe('chipCategories', () => {
  it('shows the preferred categories', () => {
    expect(chipCategories(['science', 'sports'], undefined)).toEqual(['science', 'sports']);
    expect(chipCategories(['science', 'sports'], 'science')).toEqual(['science', 'sports']);
  });

  it("adds a shared link's category that isn't preferred, so the active chip is visible", () => {
    expect(chipCategories(['science'], 'business')).toEqual(['science', 'business']);
    expect(chipCategories(['science'], 'science')).toEqual(['science']);
  });
});

describe('joinNames', () => {
  it('joins source names in plain English', () => {
    expect(joinNames(['NewsAPI'])).toBe('NewsAPI');
    expect(joinNames(['The Guardian', 'The New York Times'])).toBe(
      'The Guardian and The New York Times',
    );
    expect(joinNames(['A', 'B', 'C'])).toBe('A, B, and C');
  });
});
