import { z } from 'zod';

// Raw NewsAPI shapes (fixtures: src/test/fixtures/newsapi/*.json). Any of author, description,
// urlToImage and content can be null on the same item; source.id is often null.

export const newsapiArticleSchema = z.looseObject({
  source: z.looseObject({ id: z.string().nullish(), name: z.string().nullish() }).nullish(),
  author: z.string().nullish(),
  title: z.string().nullish(),
  description: z.string().nullish(),
  url: z.string().nullish(),
  urlToImage: z.string().nullish(),
  publishedAt: z.string().nullish(),
  content: z.string().nullish(), // truncated, ends with "… [+N chars]"
});

export const newsapiResponseSchema = z.looseObject({
  status: z.literal('ok'),
  totalResults: z.number(),
  articles: z.array(z.unknown()),
});
