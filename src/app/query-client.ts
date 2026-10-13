import { QueryClient } from '@tanstack/react-query';

// The APIs' free quotas are tiny: cache generously and never refetch on focus.
export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60_000,
        gcTime: 30 * 60_000,
        refetchOnWindowFocus: false,
        // No retries until milestone 4 adds ApiError, so 4xx (bad key, 429) can be excluded.
        retry: false,
      },
    },
  });
}
