import { Link } from '@tanstack/react-router';

import type { TitleLinkProps } from './ArticleCard';

/** Opens an article in the in-app reader; never the publisher's site. */
export function ReaderLink({ article, className, children }: TitleLinkProps) {
  return (
    <Link
      to="/article/$provider"
      params={{ provider: article.provider }}
      search={{ id: article.externalId }}
      className={className}
    >
      {children}
    </Link>
  );
}
