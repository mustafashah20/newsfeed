import { getRouteApi, Link, useCanGoBack, useRouter } from '@tanstack/react-router';
import { ArrowLeftIcon } from 'lucide-react';

import { PAGE_STACK_CLASS } from '@/components/layout/page-styles';
import { Button } from '@/components/ui/button';
import { describeSourceError } from '@/features/articles';
import { cn } from '@/lib/utils';
import { providers } from '@/services/news/registry';

import { useArticle } from '../hooks/useArticle';
import { READER_GRID, READER_MAIN } from '../layout';
import { ArticleBody } from './ArticleBody';
import { PreviewNotice } from './PreviewNotice';
import { ReaderAttribution } from './ReaderAttribution';
import { ReaderError } from './ReaderError';
import { ReaderHeader } from './ReaderHeader';
import { ReaderSkeleton } from './ReaderSkeleton';
import { ReaderUnavailable } from './ReaderUnavailable';

const route = getRouteApi('/article/$provider');

export function ArticleReaderPage() {
  const { provider } = route.useParams();
  const { id } = route.useSearch();
  const state = useArticle(provider, id);
  const router = useRouter();
  const canGoBack = useCanGoBack();
  const providerLabel = providers[provider].label;

  // Back keeps the list's scroll position (router scroll restoration); a fresh tab goes home.
  // -ml-3 lines the arrow up with the page edge instead of the button's padding.
  const back = canGoBack ? (
    <Button
      variant="ghost"
      className="-ml-3 h-11 self-start px-3"
      onClick={() => {
        router.history.back();
      }}
    >
      <ArrowLeftIcon aria-hidden="true" />
      Back
    </Button>
  ) : (
    <Button asChild variant="ghost" className="-ml-3 h-11 self-start px-3">
      <Link to="/">
        <ArrowLeftIcon aria-hidden="true" />
        Your feed
      </Link>
    </Button>
  );

  if (state.status === 'loading') return <ReaderSkeleton />;
  if (state.status === 'unavailable') {
    return (
      <ReaderUnavailable
        action={
          <Button asChild className="h-11 px-4">
            <Link to="/">Back to your feed</Link>
          </Button>
        }
      />
    );
  }
  if (state.status === 'error') {
    const info = describeSourceError(state.error, providerLabel);
    return <ReaderError message={info.message} onRetry={info.canRetry ? state.retry : undefined} />;
  }

  const { article, isLoadingFullText, fullTextError } = state;

  return (
    // Same page width and edges as the feed and search (AppShell's container); the body keeps
    // to the main column so lines stay a readable length.
    <article className={PAGE_STACK_CLASS}>
      {back}
      <ReaderHeader article={article} />
      <div className={READER_GRID}>
        <div className={cn(READER_MAIN, 'flex min-w-0 flex-col gap-6')}>
          <ArticleBody blocks={article.blocks} />
          {isLoadingFullText && <ReaderSkeleton bodyOnly />}
          {Boolean(fullTextError) && (
            <div role="alert" className="flex flex-wrap items-center gap-2 text-sm">
              <span>{describeSourceError(fullTextError, providerLabel).message}.</span>
              <Button variant="outline" className="h-11 px-4" onClick={state.retry}>
                Retry
              </Button>
            </div>
          )}
          {!article.isFullText && !isLoadingFullText && (
            <PreviewNotice providerLabel={providerLabel} />
          )}
          <ReaderAttribution sourceName={article.sourceName} url={article.url} />
        </div>
      </div>
    </article>
  );
}
