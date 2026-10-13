import { createFileRoute } from '@tanstack/react-router';

import { FeedPage } from '@/features/feed';
import { pageTitle } from '@/lib/page-title';

export const Route = createFileRoute('/')({
  head: () => ({ meta: [{ title: pageTitle('Your feed') }] }),
  component: FeedPage,
});
