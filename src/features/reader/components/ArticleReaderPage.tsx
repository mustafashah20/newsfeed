import { getRouteApi, Link } from '@tanstack/react-router';

import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { providers } from '@/services/news/registry';

const route = getRouteApi('/article/$provider');

// Placeholder until milestone 9 builds the reader (docs/architecture.md → Article reader).
export function ArticleReaderPage() {
  const { provider } = route.useParams();

  return (
    <div className="flex flex-col items-start gap-6">
      <PageHeader
        title="Article reader"
        description={`Reading ${providers[provider].label} articles inside Newsfeed is coming soon.`}
      />
      <Button asChild variant="outline" className="h-11 px-4">
        <Link to="/">Back to your feed</Link>
      </Button>
    </div>
  );
}
