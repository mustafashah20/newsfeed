import { QueryClient } from '@tanstack/react-query';

import { isRetryableError } from '@/services/news/http';

const MAX_RETRIES = 2;

// The APIs' free quotas are tiny: cache generously and never refetch on focus.
export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60_000,
        gcTime: 30 * 60_000,
        refetchOnWindowFocus: false,
        // Only network/timeout/5xx; never 4xx (bad key, 429) or a missing key.
        retry: (failureCount, error) => failureCount < MAX_RETRIES && isRetryableError(error),
      },
    },
  });
}
