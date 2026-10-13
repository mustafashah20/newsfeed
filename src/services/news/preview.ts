import type { Article, ArticleBlock, ArticleDetail } from './types';

// Compares text loosely: NewsAPI's content often repeats the description, cut off with "…".
const comparable = (text: string) => text.replace(/[…\s]+$/, '').toLowerCase();

/** The reader's preview of a list article: description and excerpt as paragraphs. */
export function toPreviewDetail(article: Article): ArticleDetail {
  const { description, excerpt } = article;
  const texts: string[] = [];
  if (description && excerpt && comparable(excerpt).startsWith(comparable(description))) {
    texts.push(excerpt); // the excerpt already contains the description
  } else if (description && excerpt && comparable(description).startsWith(comparable(excerpt))) {
    texts.push(description);
  } else {
    if (description) texts.push(description);
    if (excerpt) texts.push(excerpt);
  }
  const blocks: ArticleBlock[] = texts.map((text) => ({ type: 'paragraph', text }));
  return { ...article, blocks, isFullText: false };
}
