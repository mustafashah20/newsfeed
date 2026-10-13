import { createFileRoute } from '@tanstack/react-router';

import { FeedPage, feedParamsSchema } from '@/features/feed';
import { pageTitle } from '@/lib/page-title';

export const Route = createFileRoute('/')({
  validateSearch: feedParamsSchema,
  head: () => ({ meta: [{ title: pageTitle('Your feed') }] }),
  component: FeedPage,
});
