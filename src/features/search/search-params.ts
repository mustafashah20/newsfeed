import { z } from 'zod';

// Milestone 7 adds from/to/category/sources (docs/architecture.md → Search URL state).
export const searchParamsSchema = z.object({
  q: z.string().trim().catch(''),
});

export type SearchParams = z.infer<typeof searchParamsSchema>;
