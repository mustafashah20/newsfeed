import { z } from 'zod';

// Raw Guardian Content API shapes (fixtures: src/test/fixtures/guardian/*.json).
// Loose objects: unknown fields pass through; items are validated one by one in the mapper.

export const guardianItemSchema = z.looseObject({
  id: z.string().min(1), // e.g. "film/2026/oct/13/slug" (contains slashes)
  type: z.string().optional(), // "article", "liveblog", …
  sectionId: z.string().optional(),
  webTitle: z.string(),
  webUrl: z.string(),
  webPublicationDate: z.string(),
  fields: z
    .looseObject({
      trailText: z.string().optional(), // HTML
      byline: z.string().optional(),
      thumbnail: z.string().optional(),
    })
    .optional(),
});
export type GuardianItem = z.infer<typeof guardianItemSchema>;

export const guardianSearchSchema = z.looseObject({
  response: z.looseObject({
    status: z.literal('ok'),
    currentPage: z.number(),
    pages: z.number(),
    results: z.array(z.unknown()),
  }),
});
