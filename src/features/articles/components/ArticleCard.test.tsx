import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { Article } from '@/services/news/types';

import { ArticleCard } from './ArticleCard';
import type { TitleLinkProps } from './ArticleCard';

const article: Article = {
  id: 'nyt:nyt://article/1',
  externalId: 'nyt://article/1',
  title: 'The Complicated Puzzle of the Formula 1 Schedule',
  description: 'It can take years to create, and then weather and wars can upend it.',
  excerpt: null,
  url: 'https://www.nytimes.com/2026/10/13/sports/f1-schedule.html',
  imageUrl: 'https://static01.nyt.com/images/f1.jpg',
  publishedAt: '2026-10-14T09:00:00.000Z',
  author: 'Phillip Horton',
  category: 'sports',
  provider: 'nyt',
  sourceName: 'The New York Times',
};

const NOW = new Date('2026-10-14T12:00:00.000Z');

function TestLink({ article: a, className, children }: TitleLinkProps) {
  return (
    <a href={`/article/${a.provider}?id=${a.externalId}`} className={className}>
      {children}
    </a>
  );
}

describe('ArticleCard', () => {
  it('shows the article’s source, category, age, title, description and author', () => {
    render(<ArticleCard article={article} TitleLink={TestLink} now={NOW} />);

    expect(screen.getByRole('link', { name: article.title })).toHaveAttribute(
      'href',
      '/article/nyt?id=nyt://article/1',
    );
    expect(screen.getByText('The New York Times')).toBeInTheDocument();
    expect(screen.getByText('Sports')).toBeInTheDocument();
    expect(screen.getByText('3 hours ago')).toHaveAttribute('datetime', article.publishedAt);
    expect(screen.getByText(article.description!)).toBeInTheDocument();
    expect(screen.getByText('By Phillip Horton')).toBeInTheDocument();
  });

  it('renders a placeholder when there is no image or it fails to load', () => {
    const { container, rerender } = render(
      <ArticleCard article={article} TitleLink={TestLink} now={NOW} />,
    );
    const img = container.querySelector('img');
    expect(img).toHaveAttribute('loading', 'lazy');

    // jsdom never loads images, so simulate the browser's error event.
    fireEvent.error(img!);
    expect(container.querySelector('img')).toBeNull();

    rerender(
      <ArticleCard
        key="no-image"
        article={{ ...article, imageUrl: null }}
        TitleLink={TestLink}
        now={NOW}
      />,
    );
    expect(container.querySelector('img')).toBeNull();
  });

  it('leaves out what the article doesn’t have and shows extra actions', () => {
    render(
      <ArticleCard
        article={{ ...article, description: null, author: null, category: null }}
        TitleLink={TestLink}
        now={NOW}
        actions={<button type="button">Follow</button>}
      />,
    );

    expect(screen.queryByText(/^By /)).toBeNull();
    expect(screen.queryByText('Sports')).toBeNull();
    expect(screen.getByRole('button', { name: 'Follow' })).toBeInTheDocument();
  });
});
