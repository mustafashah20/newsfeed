import { notFound } from '@tanstack/react-router';
import { z } from 'zod';

import { PROVIDER_IDS } from '@/services/news/types';
import type { ProviderId } from '@/services/news/types';

const providerSchema = z.enum(PROVIDER_IDS);

/** `/article/$provider`: an unknown provider is a 404, not an error. */
export function parseReaderParams(params: { provider: string }): { provider: ProviderId } {
  const result = providerSchema.safeParse(params.provider);
  if (!result.success) throw notFound();
  return { provider: result.data };
}

// The id lives in the search string because Guardian ids contain slashes.
export const readerSearchSchema = z.object({
  id: z.string().trim().catch(''),
});
