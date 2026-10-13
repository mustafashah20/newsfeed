import { describe, expect, it } from 'vitest';

import { toPreviewDetail } from './preview';
import type { Article } from './types';

const base: Article = {
  id: 'newsapi:https://example.com/a',
  externalId: 'https://example.com/a',
  title: 'Title',
  description: 'Ukrainian President Volodymyr Zelenskyy said Russia struck energy sites.',
  excerpt: null,
  url: 'https://example.com/a',
  imageUrl: null,
  publishedAt: '2026-10-12T18:29:00.000Z',
  author: null,
  category: null,
  provider: 'newsapi',
  sourceName: 'Associated Press',
};

describe('toPreviewDetail', () => {
  it('turns description and excerpt into paragraphs, marked as a preview', () => {
    const detail = toPreviewDetail({ ...base, excerpt: 'KYIV, Ukraine (AP) — The strikes hit…' });

    expect(detail.isFullText).toBe(false);
    expect(detail.blocks).toEqual([
      { type: 'paragraph', text: base.description },
      { type: 'paragraph', text: 'KYIV, Ukraine (AP) — The strikes hit…' },
    ]);
    expect(detail).toMatchObject({ id: base.id, title: base.title });
  });

  it('shows text once when the excerpt repeats the description', () => {
    const excerpt = `${base.description!} More details followed as officials…`;

    expect(toPreviewDetail({ ...base, excerpt }).blocks).toEqual([
      { type: 'paragraph', text: excerpt },
    ]);
    expect(toPreviewDetail({ ...base, excerpt: 'Ukrainian President Volodymyr…' }).blocks).toEqual([
      { type: 'paragraph', text: base.description },
    ]);
  });

  it('copes with missing text', () => {
    expect(toPreviewDetail({ ...base, description: null }).blocks).toEqual([]);
  });
});
