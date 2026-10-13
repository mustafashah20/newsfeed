import { guardianProvider } from './providers/guardian';
import { newsapiProvider } from './providers/newsapi';
import { nytProvider } from './providers/nyt';
import { PROVIDER_IDS } from './types';
import type { NewsProvider, ProviderId } from './types';

// Adding a source = a new providers/<id>/ folder, its id in PROVIDER_IDS, and one line here.
export const providers: Record<ProviderId, NewsProvider> = {
  newsapi: newsapiProvider,
  guardian: guardianProvider,
  nyt: nytProvider,
};

export const providerList: readonly NewsProvider[] = PROVIDER_IDS.map((id) => providers[id]);
