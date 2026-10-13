import { createFileRoute } from '@tanstack/react-router';

import { SearchPage, searchParamsSchema } from '@/features/search';
import { pageTitle } from '@/lib/page-title';

export const Route = createFileRoute('/search')({
  validateSearch: searchParamsSchema,
  head: ({ match }) => ({
    meta: [{ title: pageTitle(match.search.q ? `Search: ${match.search.q}` : 'Search') }],
  }),
  component: SearchPage,
});
