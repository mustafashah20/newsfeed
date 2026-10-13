import { z } from 'zod';

// Raw NYT Article Search shapes (fixtures: src/test/fixtures/nyt/*.json).

const imageSchema = z.looseObject({ url: z.string() });

// Current responses: an object with default/thumbnail and absolute URLs. Older ones: an array
// of objects with relative URLs. Both are accepted (docs/data-sources.md → NYT).
const multimediaSchema = z
  .union([
    z.looseObject({ default: imageSchema.optional(), thumbnail: imageSchema.optional() }),
    z.array(z.looseObject({ url: z.string(), width: z.number().optional() })),
  ])
  .nullish();

export const nytDocSchema = z.looseObject({
  _id: z.string().min(1), // "nyt://article/<uuid>"
  web_url: z.string(),
  headline: z.looseObject({ main: z.string() }),
  abstract: z.string().nullish(),
  snippet: z.string().nullish(),
  lead_paragraph: z.string().nullish(), // absent from current responses; kept in case it returns
  byline: z.looseObject({ original: z.string().nullish() }).nullish(),
  multimedia: multimediaSchema,
  pub_date: z.string(),
  section_name: z.string().nullish(),
});
export type NytDoc = z.infer<typeof nytDocSchema>;

export const nytSearchSchema = z.looseObject({
  status: z.literal('OK'),
  response: z.looseObject({
    docs: z.array(z.unknown()),
    metadata: z.looseObject({ hits: z.number(), offset: z.number() }),
  }),
});
