import { isCancel } from 'axios';
import { delay, http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { server } from '@/test/msw/server';

import { ApiError, createApiClient, isRetryableError } from './http';

const ENDPOINT = '*/api/guardian/search';
const client = createApiClient('guardian');

async function captureError(promise: Promise<unknown>) {
  try {
    await promise;
  } catch (error) {
    return error;
  }
  throw new Error('Expected the request to fail');
}

describe('createApiClient', () => {
  it('calls the provider’s same-origin proxy path and drops empty params', async () => {
    let requested: URL | undefined;
    server.use(
      http.get(ENDPOINT, ({ request }) => {
        requested = new URL(request.url);
        return HttpResponse.json({ ok: true });
      }),
    );

    await client.get('/search', {
      params: { q: 'climate change', page: 1, section: undefined, 'from-date': '', tag: null },
    });

    expect(requested?.origin).toBe(globalThis.location.origin);
    expect(requested?.pathname).toBe('/api/guardian/search');
    expect([...(requested?.searchParams ?? [])]).toEqual([
      ['q', 'climate change'],
      ['page', '1'],
    ]);
  });

  it('returns the parsed JSON body', async () => {
    server.use(http.get(ENDPOINT, () => HttpResponse.json({ response: { results: [] } })));

    const { data } = await client.get<unknown>('/search');

    expect(data).toEqual({ response: { results: [] } });
  });

  it.each([
    { status: 401, code: 'unauthorized', retryable: false },
    { status: 403, code: 'unauthorized', retryable: false },
    { status: 429, code: 'rate_limited', retryable: false },
    { status: 400, code: 'http', retryable: false },
    { status: 404, code: 'not_found', retryable: false },
    { status: 500, code: 'server', retryable: true },
  ])('maps HTTP $status to $code', async ({ status, code, retryable }) => {
    server.use(
      http.get(ENDPOINT, () => HttpResponse.json({ message: 'raw upstream text' }, { status })),
    );

    const error = await captureError(client.get('/search'));

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status, code, provider: 'guardian' });
    expect(isRetryableError(error)).toBe(retryable);
  });

  it('recognizes the proxy’s missing-key response and never retries it', async () => {
    server.use(
      http.get(ENDPOINT, () =>
        HttpResponse.json({ status: 'error', code: 'not_configured' }, { status: 503 }),
      ),
    );

    const error = await captureError(client.get('/search'));

    expect(error).toMatchObject({ status: 503, code: 'not_configured' });
    expect(isRetryableError(error)).toBe(false);
  });

  it('reports network failures as retryable', async () => {
    server.use(http.get(ENDPOINT, () => HttpResponse.error()));

    const error = await captureError(client.get('/search'));

    expect(error).toMatchObject({ status: 0, code: 'network' });
    expect(isRetryableError(error)).toBe(true);
  });

  it('times out slow responses', async () => {
    server.use(
      http.get(ENDPOINT, async () => {
        await delay(200);
        return HttpResponse.json({});
      }),
    );

    const error = await captureError(client.get('/search', { timeout: 20 }));

    expect(error).toMatchObject({ status: 0, code: 'timeout' });
    expect(isRetryableError(error)).toBe(true);
  });

  it('passes caller cancellation through instead of reporting an API error', async () => {
    server.use(
      http.get(ENDPOINT, async () => {
        await delay(200);
        return HttpResponse.json({});
      }),
    );
    const controller = new AbortController();

    const request = client.get('/search', { signal: controller.signal });
    controller.abort();
    const error = await captureError(request);

    expect(error).not.toBeInstanceOf(ApiError);
    expect(isCancel(error)).toBe(true);
  });

  it('rejects a 2xx response that is not JSON', async () => {
    server.use(http.get(ENDPOINT, () => HttpResponse.text('<html>oops</html>')));

    const error = await captureError(client.get('/search'));

    expect(error).toMatchObject({ status: 200, code: 'invalid_response' });
  });
});
