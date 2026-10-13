import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import item from '@/test/fixtures/guardian/item.json';
import { server } from '@/test/msw/server';

import { guardianItemPath } from './client';
import { guardianProvider } from './index';
import { toGuardianDetail } from './mapper';

const content = item.response.content;
const signal = () => new AbortController().signal;

describe('Guardian single item', () => {
  it('builds the item path, keeping the slashes of the id', () => {
    expect(guardianItemPath('film/2026/oct/13/frank & percy')).toBe(
      '/film/2026/oct/13/frank%20%26%20percy',
    );
  });

  it('maps the real item to a full-text article with the largest hero image', () => {
    const detail = toGuardianDetail(content);

    expect(detail).toMatchObject({
      id: `guardian:${content.id}`,
      title: content.webTitle,
      author: 'Peter Bradshaw',
      isFullText: true,
      imageUrl: content.elements[0]!.assets[0]!.typeData.secureFile, // the 1000px asset
    });
    expect(detail?.blocks).toHaveLength(6);
  });

  it('falls back to a preview when the body has no text (interactives, video)', () => {
    const detail = toGuardianDetail({
      ...content,
      fields: { ...content.fields, body: '<figure></figure>' },
    });

    expect(detail).toMatchObject({ isFullText: false });
    expect(detail?.blocks).toEqual([{ type: 'paragraph', text: content.fields.trailText }]);
  });

  it('fetches by id with the body and image fields', async () => {
    let requested: URL | undefined;
    server.use(
      http.get('*/api/guardian/film/*', ({ request }) => {
        requested = new URL(request.url);
        return HttpResponse.json(item);
      }),
    );

    const detail = await guardianProvider.fetchArticle(content.id, signal());

    expect(requested?.pathname).toBe(`/api/guardian/${content.id}`);
    expect(requested?.searchParams.get('show-fields')).toBe('body,byline,thumbnail,trailText');
    expect(requested?.searchParams.get('show-elements')).toBe('image');
    expect(detail.isFullText).toBe(true);
  });

  it('reports a missing article as not_found', async () => {
    server.use(http.get('*/api/guardian/*', () => new HttpResponse(null, { status: 404 })));

    await expect(guardianProvider.fetchArticle('gone/2026/x', signal())).rejects.toMatchObject({
      code: 'not_found',
    });
  });
});
