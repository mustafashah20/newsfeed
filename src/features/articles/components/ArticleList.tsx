import type { ComponentType, ReactNode } from 'react';

import type { Article } from '@/services/news/types';

import { ArticleCard } from './ArticleCard';
import type { TitleLinkProps } from './ArticleCard';

type ArticleListProps = {
  articles: readonly Article[];
  TitleLink: ComponentType<TitleLinkProps>;
  renderActions?: (article: Article) => ReactNode;
};

export function ArticleList({ articles, TitleLink, renderActions }: ArticleListProps) {
  return (
    // Columns follow the space the list gets (full page on the feed, beside the sidebar on
    // search). A container query reads the nearest ancestor container, hence the wrapper.
    <div className="@container">
      <ul className="grid grid-cols-1 gap-4 @xl:grid-cols-2 @3xl:grid-cols-3">
        {articles.map((article) => (
          <li key={article.id} className="min-w-0">
            <ArticleCard
              article={article}
              TitleLink={TitleLink}
              actions={renderActions?.(article)}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
