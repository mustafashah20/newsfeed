import { z } from 'zod';

// `/?following=true` → only articles by followed authors. Shareable, so it lives in the URL.
export const feedParamsSchema = z.object({
  following: z.boolean().optional().catch(undefined),
});

export type FeedParams = z.infer<typeof feedParamsSchema>;
