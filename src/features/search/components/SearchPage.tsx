import { getRouteApi } from '@tanstack/react-router';

import { PageHeader } from '@/components/layout/PageHeader';

const route = getRouteApi('/search');

export function SearchPage() {
  const { q } = route.useSearch();

  return (
    <PageHeader
      title={q ? `Results for “${q}”` : 'Search'}
      description="Search NewsAPI, The Guardian and The New York Times."
    />
  );
}
