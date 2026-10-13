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

const imageAssetSchema = z.looseObject({
  file: z.string().optional(),
  typeData: z
    .looseObject({
      secureFile: z.string().optional(),
      width: z.union([z.string(), z.number()]).optional(), // "1000" in real responses
    })
    .optional(),
});

/** Single item (`GET /{id}`): wrapped in response.content, with the body and image elements. */
export const guardianItemResponseSchema = z.looseObject({
  response: z.looseObject({
    status: z.literal('ok'),
    content: z.unknown(),
  }),
});

export const guardianDetailSchema = z.looseObject({
  fields: z.looseObject({ body: z.string().optional() }).optional(),
  elements: z
    .array(
      z.looseObject({
        relation: z.string().optional(),
        type: z.string().optional(),
        assets: z.array(imageAssetSchema).optional(),
      }),
    )
    .optional(),
});
export type GuardianDetail = z.infer<typeof guardianDetailSchema>;
