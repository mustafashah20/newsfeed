import { useQueryClient } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';

import { toPreviewDetail } from '@/services/news/preview';
import { articleKeys } from '@/services/news/query-keys';

import type { TitleLinkProps } from './ArticleCard';

/**
 * Opens an article in the in-app reader; never the publisher's site. Seeds the reader's
 * preview so it renders instantly (and is all NewsAPI/NYT have without a lookup).
 */
export function ReaderLink({ article, className, children }: TitleLinkProps) {
  const queryClient = useQueryClient();

  function handleClick() {
    queryClient.setQueryData(
      articleKeys.preview(article.provider, article.externalId),
      toPreviewDetail(article),
    );
  }

  return (
    <Link
      to="/article/$provider"
      params={{ provider: article.provider }}
      search={{ id: article.externalId }}
      onClick={handleClick}
      className={className}
    >
      {children}
    </Link>
  );
}
