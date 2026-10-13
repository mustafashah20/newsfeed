import { describe, expect, it } from 'vitest';

import { ApiError } from '@/services/news/http';

import { describeSourceError } from './error-message';

const apiError = (code: ApiError['code'], status = 0) =>
  new ApiError({ status, code, provider: 'nyt', message: 'raw upstream text' });

describe('describeSourceError', () => {
  it('names the source and never leaks the raw message', () => {
    const info = describeSourceError(apiError('rate_limited', 429), 'The New York Times');

    expect(info).toEqual({
      message: 'The New York Times rate limit reached. Try again in a minute',
      canRetry: true,
    });
    expect(info.message).not.toContain('raw upstream text');
  });

  it('says a source without a key isn’t configured, and offers no retry', () => {
    expect(describeSourceError(apiError('not_configured', 503), 'NewsAPI')).toEqual({
      message: "NewsAPI isn't configured",
      canRetry: false,
    });
  });

  it('falls back to a generic message for unknown errors', () => {
    expect(describeSourceError(new Error('boom'), 'The Guardian')).toEqual({
      message: "The Guardian couldn't be loaded",
      canRetry: true,
    });
  });
});
