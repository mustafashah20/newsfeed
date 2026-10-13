import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import byId from '@/test/fixtures/nyt/article-by-id.json';
import { server } from '@/test/msw/server';

import { buildNytIdFilter } from './client';
import { nytProvider } from './index';

const ID = byId.response.docs[0]!._id;
const signal = () => new AbortController().signal;

describe('NYT lookup by id', () => {
  it('quotes the id in the verified _id filter', () => {
    expect(buildNytIdFilter(ID)).toBe(`_id:"${ID}"`);
    expect(buildNytIdFilter('a"b')).toBe('_id:"a\\"b"');
  });

  it('turns the real lookup response into a preview', async () => {
    let fq: string | null = null;
    server.use(
      http.get('*/api/nyt/articlesearch.json', ({ request }) => {
        fq = new URL(request.url).searchParams.get('fq');
        return HttpResponse.json(byId);
      }),
    );

    const detail = await nytProvider.fetchArticle(ID, signal());

    expect(fq).toBe(`_id:"${ID}"`);
    expect(detail).toMatchObject({
      externalId: ID,
      title: 'The Complicated Puzzle of the Formula 1 Schedule',
      isFullText: false,
    });
    expect(detail.blocks[0]?.text).toBe(byId.response.docs[0]!.abstract);
  });

  it('reports an id that matches nothing as not_found', async () => {
    server.use(
      http.get('*/api/nyt/articlesearch.json', () =>
        HttpResponse.json({ ...byId, response: { docs: [], metadata: { hits: 0, offset: 0 } } }),
      ),
    );

    await expect(nytProvider.fetchArticle('nyt://article/missing', signal())).rejects.toMatchObject(
      {
        code: 'not_found',
      },
    );
  });

  it('only needs a lookup when nothing is cached: it has no full text', () => {
    expect(nytProvider.providesFullText).toBe(false);
  });
});
