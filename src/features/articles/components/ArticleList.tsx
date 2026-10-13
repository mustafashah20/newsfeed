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
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {articles.map((article) => (
        <li key={article.id} className="min-w-0">
          <ArticleCard article={article} TitleLink={TitleLink} actions={renderActions?.(article)} />
        </li>
      ))}
    </ul>
  );
}
