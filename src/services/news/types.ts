// Domain model. Milestone 5 adds Article, ProviderQuery, NewsProvider and the reader types
// (docs/architecture.md → Domain model).

export const PROVIDER_IDS = ['newsapi', 'guardian', 'nyt'] as const;
export type ProviderId = (typeof PROVIDER_IDS)[number];
