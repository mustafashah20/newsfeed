import { PageHeader } from '@/components/layout/PageHeader';
import { ArticleResults, EmptyState, ReaderLink, useAggregatedArticles } from '@/features/articles';
import { PROVIDER_IDS } from '@/services/news/types';
import type { ProviderQuery } from '@/services/news/types';

// Until milestone 8 adds preferences, the feed shows the latest from every source.
const LATEST: ProviderQuery = { categories: [] };

export function FeedPage() {
  const results = useAggregatedArticles({ query: LATEST, providers: PROVIDER_IDS });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Your feed"
        description="The latest articles from your preferred sources and categories."
      />
      <ArticleResults
        results={results}
        TitleLink={ReaderLink}
        emptyState={
          <EmptyState
            title="No articles right now"
            description="None of your sources have new articles. Check back soon."
          />
        }
      />
    </div>
  );
}
