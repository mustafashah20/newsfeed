import { createFileRoute } from '@tanstack/react-router';

import { ArticleReaderPage, parseReaderParams, readerSearchSchema } from '@/features/reader';
import { pageTitle } from '@/lib/page-title';

export const Route = createFileRoute('/article/$provider')({
  params: { parse: parseReaderParams },
  validateSearch: readerSearchSchema,
  head: () => ({ meta: [{ title: pageTitle('Article') }] }),
  component: ArticleReaderPage,
});
