import axios, { AxiosError, CanceledError } from 'axios';
import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { z } from 'zod';

import type { ProviderId } from './types';

// The single HTTP service. Adapters get a per-provider axios client from createApiClient and
// never call fetch/axios directly; the interceptors below own errors, timeouts and params.

export type ApiErrorCode =
  | 'not_configured' // the proxy has no key for this provider
  | 'unauthorized' // 401/403: bad or disabled key
  | 'rate_limited' // 429
  | 'timeout'
  | 'network'
  | 'server' // 5xx
  | 'http' // other non-2xx
  | 'invalid_response'; // 2xx that isn't JSON

/** Body code the dev proxy and nginx send (with 503) when a provider's key is blank. */
export const NOT_CONFIGURED_CODE = 'not_configured';

export const REQUEST_TIMEOUT_MS = 10_000;

// Only transient failures are worth another request against the tiny quotas.
const RETRYABLE_CODES: ReadonlySet<ApiErrorCode> = new Set(['network', 'timeout', 'server']);

type ApiErrorInit = {
  status: number; // 0 when no response arrived (network, timeout)
  code: ApiErrorCode;
  provider: ProviderId;
  message: string;
  cause?: unknown;
};

// `message` is for developers and never contains the URL; the UI maps `code` to friendly text.
export class ApiError extends Error {
  override readonly name = 'ApiError';
  readonly status: number;
  readonly code: ApiErrorCode;
  readonly provider: ProviderId;

  constructor({ status, code, provider, message, cause }: ApiErrorInit) {
    super(message, { cause });
    this.status = status;
    this.code = code;
    this.provider = provider;
  }
}

export function isRetryableError(error: unknown) {
  return error instanceof ApiError && RETRYABLE_CODES.has(error.code);
}

/** An axios client for one provider's same-origin proxy path (`/api/<provider>`). */
export function createApiClient(provider: ProviderId): AxiosInstance {
  const client = axios.create({
    // Absolute so it also resolves outside a browser page (jsdom tests); the proxy adds the key.
    baseURL: new URL(`/api/${provider}`, globalThis.location.origin).href,
    timeout: REQUEST_TIMEOUT_MS,
    adapter: 'fetch',
    responseType: 'json',
    headers: { Accept: 'application/json' },
  });

  client.interceptors.request.use(dropEmptyParams);
  client.interceptors.response.use(
    (response) => rejectNonJson(response, provider),
    (error: unknown) => Promise.reject(toApiError(error, provider)),
  );

  return client;
}

// Lets param builders pass optional filters straight through.
function dropEmptyParams(config: InternalAxiosRequestConfig) {
  const params: unknown = config.params;
  if (params && typeof params === 'object') {
    config.params = Object.fromEntries(
      Object.entries(params).filter(
        ([, value]) => value !== undefined && value !== null && value !== '',
      ),
    );
  }
  return config;
}

// axios parses JSON leniently: a body that isn't JSON arrives as a raw string.
function rejectNonJson(response: AxiosResponse<unknown>, provider: ProviderId) {
  if (typeof response.data !== 'string') return response;
  throw new ApiError({
    status: response.status,
    code: 'invalid_response',
    provider,
    message: 'Response was not valid JSON',
  });
}

function toApiError(error: unknown, provider: ProviderId): Error {
  // Cancelled by the caller (Query dropped the request): not an API failure.
  // CanceledError extends AxiosError, so this check comes first.
  if (error instanceof CanceledError || error instanceof ApiError) return error;
  if (!(error instanceof AxiosError)) {
    return error instanceof Error ? error : new Error('Request failed', { cause: error });
  }

  const { response } = error;
  if (!response) {
    const timedOut = error.code === AxiosError.ETIMEDOUT || error.code === AxiosError.ECONNABORTED;
    return new ApiError({
      status: 0,
      code: timedOut ? 'timeout' : 'network',
      provider,
      message: timedOut
        ? `Request timed out after ${error.config?.timeout ?? REQUEST_TIMEOUT_MS} ms`
        : 'Network request failed',
      cause: error,
    });
  }
  return new ApiError({
    status: response.status,
    code: codeForFailure(response.status, response.data),
    provider,
    message: `Request failed with HTTP ${response.status}`,
    cause: error,
  });
}

const errorBodySchema = z.looseObject({ code: z.string().optional() });

// Providers shape error bodies differently, but the HTTP status is consistent across all three.
function codeForFailure(status: number, body: unknown): ApiErrorCode {
  if (errorBodySchema.safeParse(body).data?.code === NOT_CONFIGURED_CODE) return 'not_configured';
  if (status === 401 || status === 403) return 'unauthorized';
  if (status === 429) return 'rate_limited';
  if (status >= 500) return 'server';
  return 'http';
}
