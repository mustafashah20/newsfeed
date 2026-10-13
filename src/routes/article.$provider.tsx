import { createFileRoute } from '@tanstack/react-router';

import {
  ArticleReaderPage,
  parseReaderParams,
  readerSearchSchema,
  readerTitle,
} from '@/features/reader';
import { pageTitle } from '@/lib/page-title';

export const Route = createFileRoute('/article/$provider')({
  params: { parse: parseReaderParams },
  validateSearch: readerSearchSchema,
  loaderDeps: ({ search }) => ({ id: search.id }),
  // Only reads the cache (no fetching here); the page loads the article itself.
  loader: ({ context, params, deps }) => ({
    title: readerTitle(context.queryClient, params.provider, deps.id),
  }),
  head: ({ loaderData }) => ({ meta: [{ title: pageTitle(loaderData?.title ?? 'Article') }] }),
  component: ArticleReaderPage,
});
