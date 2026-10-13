import type { Category } from './categories';

export const PROVIDER_IDS = ['newsapi', 'guardian', 'nyt'] as const;
export type ProviderId = (typeof PROVIDER_IDS)[number];

export type Article = {
  id: string; // `${providerId}:${externalId}`, stable and unique
  externalId: string; // provider-native id used in the reader URL (Guardian id, NYT _id, NewsAPI url)
  title: string;
  description: string | null;
  excerpt: string | null; // extra text beyond description (NewsAPI content minus "[+N chars]")
  url: string;
  imageUrl: string | null;
  publishedAt: string; // ISO 8601
  author: string | null; // normalized ("By " removed, trimmed)
  category: Category | null;
  provider: ProviderId;
  sourceName: string; // publication shown on the card ("BBC News", "The Guardian", …)
};

export type ProviderQuery = {
  q?: string;
  from?: string; // yyyy-MM-dd
  to?: string;
  categories: Category[]; // empty = all
};

export type ProviderPage = { articles: Article[]; hasMore: boolean };

export interface NewsProvider {
  readonly id: ProviderId;
  readonly label: string;
  fetchPage(query: ProviderQuery, page: number, signal: AbortSignal): Promise<ProviderPage>;
}

// Reader
export type ArticleBlock = { type: 'paragraph' | 'heading' | 'quote' | 'listItem'; text: string };

export type ArticleDetail = Article & {
  blocks: ArticleBlock[];
  isFullText: boolean; // true only when the source returned the complete body
};

// Optional capability (Interface Segregation): only providers that can fetch one article by id implement it.
export interface ArticleDetailSource {
  readonly providesFullText: boolean; // false (NYT): fetching only recovers the preview, so skip it when one is cached
  fetchArticle(externalId: string, signal: AbortSignal): Promise<ArticleDetail>;
}

export const supportsArticleDetail = (p: NewsProvider): p is NewsProvider & ArticleDetailSource =>
  'fetchArticle' in p;
