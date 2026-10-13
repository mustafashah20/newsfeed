import { screen, waitFor, within } from '@testing-library/react';
import { delay, http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { toPreviewDetail } from '@/services/news/preview';
import { articleKeys } from '@/services/news/query-keys';
import { toNewsapiArticle } from '@/services/news/providers/newsapi/mapper';
import guardianItem from '@/test/fixtures/guardian/item.json';
import topHeadlines from '@/test/fixtures/newsapi/top-headlines.json';
import nytById from '@/test/fixtures/nyt/article-by-id.json';
import { server } from '@/test/msw/server';
import { renderApp } from '@/test/render';

const GUARDIAN = guardianItem.response.content;
const NYT_DOC = nytById.response.docs[0]!;
const NEWSAPI_RAW = topHeadlines.articles[1]!; // Associated Press, has description + content

const readerUrl = (provider: string, id: string) =>
  `/article/${provider}?id=${encodeURIComponent(id)}`;

/** The reader's links: only the attribution may leave the app. */
function expectOnlyAttributionLinksOut(originalUrl: string) {
  const article = screen.getByRole('article');
  const external = within(article)
    .getAllByRole('link')
    .filter((link) => link.getAttribute('target') === '_blank');
  expect(external).toHaveLength(1);
  expect(external[0]).toHaveAttribute('href', originalUrl);
  expect(external[0]).toHaveAttribute('rel', 'noopener noreferrer');
  expect(external[0]).toHaveAccessibleName('Original article (opens in a new tab)');
  expect(screen.queryByText(/continue reading/i)).toBeNull();
}

describe('article reader', () => {
  it('shows the Guardian’s full text, parsed into plain elements', async () => {
    renderApp(readerUrl('guardian', GUARDIAN.id));

    expect(
      await screen.findByRole('heading', { level: 1, name: GUARDIAN.webTitle }),
    ).toBeInTheDocument();
    expect(await screen.findByText(/^There is a tender sweetness/)).toBeInTheDocument();
    const article = screen.getByRole('article');
    expect(article.querySelector('iframe, figure, script')).toBeNull();
    expect(within(article).queryByText(/only shares a preview/)).toBeNull();
    expect(within(article).getByText('By Peter Bradshaw')).toBeInTheDocument();
    expect(within(article).getByRole('contentinfo')).toHaveTextContent(
      'Source: The Guardian · Original article',
    );
    expectOnlyAttributionLinksOut(GUARDIAN.webUrl);
    await waitFor(() => {
      expect(document.title).toBe('Article · Newsfeed'); // direct load: nothing cached to title it
    });
  });

  it('opens from a card instantly with the preview, then swaps in the full text', async () => {
    server.use(
      http.get('*/api/guardian/film/*', async () => {
        await delay(150);
        return HttpResponse.json(guardianItem);
      }),
    );
    const { user } = renderApp('/');

    await user.click(await screen.findByRole('link', { name: /Frank and Percy review/ }));

    // Seeded preview right away, while the body loads.
    expect(
      await screen.findByRole('heading', { level: 1, name: GUARDIAN.webTitle }),
    ).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Loading the full article…');
    expect(screen.queryByText(/only shares a preview/)).toBeNull();
    expect(await screen.findByText(/^There is a tender sweetness/)).toBeInTheDocument();
    await waitFor(() => {
      expect(document.title).toBe(`${GUARDIAN.webTitle} · Newsfeed`);
    });

    await user.click(screen.getByRole('button', { name: 'Back' }));
    expect(await screen.findByRole('heading', { name: 'Your feed' })).toBeInTheDocument();
  });

  it('keeps the preview and offers Retry when the Guardian body fails', async () => {
    // 401: not retried by the query client, so the error shows at once.
    server.use(http.get('*/api/guardian/film/*', () => new HttpResponse(null, { status: 401 })));
    const { user } = renderApp('/');

    await user.click(await screen.findByRole('link', { name: /Frank and Percy review/ }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('The Guardian rejected the API key');
    expect(screen.getByRole('heading', { level: 1, name: GUARDIAN.webTitle })).toBeInTheDocument();

    server.resetHandlers();
    await user.click(within(alert).getByRole('button', { name: 'Retry' }));
    expect(await screen.findByText(/^There is a tender sweetness/)).toBeInTheDocument();
  });

  it('shows an NYT preview from a card, with a notice and no lookup request', async () => {
    let lookups = 0;
    server.use(
      http.get('*/api/nyt/articlesearch.json', ({ request }) => {
        if (new URL(request.url).searchParams.get('fq')?.startsWith('_id:')) lookups++;
        return HttpResponse.json(nytById);
      }),
    );
    const { user } = renderApp('/');

    await user.click(await screen.findByRole('link', { name: NYT_DOC.headline.main }));

    expect(
      await screen.findByRole('heading', { level: 1, name: NYT_DOC.headline.main }),
    ).toBeInTheDocument();
    expect(screen.getByText(NYT_DOC.abstract)).toBeInTheDocument();
    expect(
      screen.getByText('The New York Times only shares a preview of this article.'),
    ).toBeInTheDocument();
    expectOnlyAttributionLinksOut(NYT_DOC.web_url);
    expect(lookups).toBe(0);
  });

  it('looks an NYT article up by id on a direct load (refresh, shared link)', async () => {
    let fq: string | null = null;
    server.use(
      http.get('*/api/nyt/articlesearch.json', ({ request }) => {
        fq = new URL(request.url).searchParams.get('fq');
        return HttpResponse.json(nytById);
      }),
    );
    renderApp(readerUrl('nyt', NYT_DOC._id));

    expect(
      await screen.findByRole('heading', { level: 1, name: NYT_DOC.headline.main }),
    ).toBeInTheDocument();
    expect(fq).toBe(`_id:"${NYT_DOC._id}"`);
    expect(screen.getByText(/only shares a preview/)).toBeInTheDocument();
  });

  it('shows a NewsAPI preview when opened from the app', async () => {
    const article = toNewsapiArticle(NEWSAPI_RAW, null)!;
    const { queryClient } = renderApp(readerUrl('newsapi', article.externalId), (client) => {
      client.setQueryData(
        articleKeys.preview('newsapi', article.externalId),
        toPreviewDetail(article),
      );
    });

    expect(
      await screen.findByRole('heading', { level: 1, name: article.title }),
    ).toBeInTheDocument();
    expect(screen.getByText(article.description!)).toBeInTheDocument();
    expect(screen.getByText('NewsAPI only shares a preview of this article.')).toBeInTheDocument();
    expectOnlyAttributionLinksOut(article.url);
    expect(
      queryClient.getQueryData(articleKeys.detail('newsapi', article.externalId)),
    ).toBeUndefined();
  });

  it('shows ReaderUnavailable for a NewsAPI article opened directly with nothing cached', async () => {
    renderApp(readerUrl('newsapi', 'https://example.com/story'));

    expect(
      await screen.findByRole('heading', { name: 'This article isn’t available' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to your feed' })).toHaveAttribute('href', '/');
  });

  it('shows ReaderUnavailable for an id the source can’t find', async () => {
    server.use(http.get('*/api/guardian/*', () => new HttpResponse(null, { status: 404 })));
    renderApp(readerUrl('guardian', 'gone/2026/oct/01/x'));

    expect(
      await screen.findByRole('heading', { name: 'This article isn’t available' }),
    ).toBeInTheDocument();
  });

  it('shows ReaderUnavailable when the link has no id', async () => {
    renderApp('/article/guardian');

    expect(
      await screen.findByRole('heading', { name: 'This article isn’t available' }),
    ).toBeInTheDocument();
  });

  it('follows the author from the reader', async () => {
    const { user } = renderApp(readerUrl('guardian', GUARDIAN.id));

    await user.click(await screen.findByRole('button', { name: 'Follow Peter Bradshaw' }));

    expect(screen.getByRole('button', { name: 'Following Peter Bradshaw' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });
});
