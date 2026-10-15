import { z } from 'zod';

import { CATEGORIES } from '@/services/news/categories';

// `/?filter=sports` narrows the feed to one category chip. Shareable, so it lives in the URL;
// no filter means "All stories".
export const feedParamsSchema = z.object({
  filter: z.enum(CATEGORIES).optional().catch(undefined),
});

export type FeedParams = z.infer<typeof feedParamsSchema>;
export type FeedFilter = NonNullable<FeedParams['filter']>;
