import { ApiError } from '@/services/news/http';
import type { ApiErrorCode } from '@/services/news/http';

export type SourceErrorInfo = {
  message: string;
  /** False when trying again can't help (no key configured). */
  canRetry: boolean;
};

const MESSAGES: Record<ApiErrorCode, (source: string) => string> = {
  not_configured: (s) => `${s} isn't configured`,
  unauthorized: (s) => `${s} rejected the API key`,
  rate_limited: (s) => `${s} rate limit reached. Try again in a minute`,
  timeout: (s) => `${s} took too long to respond`,
  network: (s) => `Couldn't reach ${s}. Check your connection`,
  server: (s) => `${s} is having problems right now`,
  http: (s) => `${s} couldn't handle this request`,
  invalid_response: (s) => `${s} sent an unexpected response`,
};

/** A short, friendly message for a per-source failure. Never the raw API message. */
export function describeSourceError(error: unknown, source: string): SourceErrorInfo {
  if (!(error instanceof ApiError)) {
    return { message: `${source} couldn't be loaded`, canRetry: true };
  }
  return { message: MESSAGES[error.code](source), canRetry: error.code !== 'not_configured' };
}
