import { collapseWhitespace } from '@/lib/text-cleanup';

import type { ArticleBlock } from '../../types';

// Guardian `fields.body` is full article HTML. It never reaches React as HTML: it is parsed
// into typed text blocks that the reader renders as plain elements.

const EMITTED: Partial<Record<string, ArticleBlock['type']>> = {
  P: 'paragraph',
  H2: 'heading',
  H3: 'heading',
  BLOCKQUOTE: 'quote',
  LI: 'listItem',
};

// Containers whose children matter: lists, and liveblog posts (div.block > div.block-elements).
const DESCENDED = new Set(['DIV', 'SECTION', 'UL', 'OL']);

// Liveblog post timestamps ("6.22pm BST", "Updated at 9.52am BST").
const SKIPPED_SELECTOR = 'p.block-time';

const textOf = (el: Element) => collapseWhitespace(el.textContent);

function blockText(el: Element): string {
  if (el.tagName !== 'BLOCKQUOTE') return textOf(el);
  // A quote of several paragraphs stays one block, its paragraphs a blank line apart.
  const paragraphs = [...el.querySelectorAll('p')].map(textOf).filter(Boolean);
  return paragraphs.length > 0 ? paragraphs.join('\n\n') : textOf(el);
}

function walk(parent: Element, blocks: ArticleBlock[]) {
  for (const el of parent.children) {
    if (el.matches(SKIPPED_SELECTOR)) continue;
    const type = EMITTED[el.tagName];
    if (type) {
      // Emitted elements aren't descended into: `li > p` stays one list item.
      const text = blockText(el);
      if (text) blocks.push({ type, text });
    } else if (DESCENDED.has(el.tagName)) {
      walk(el, blocks);
    }
    // Everything else is dropped with its subtree: figure (images, embeds), aside (rich
    // links), iframe, script, style, gu-atom and other custom elements.
  }
}

export function parseGuardianBody(html: string | null | undefined): ArticleBlock[] {
  if (!html) return [];
  const doc = new DOMParser().parseFromString(html, 'text/html');
  // Inline scripts/styles inside a kept element must not leak into its text.
  doc.body.querySelectorAll('script, style, noscript, template').forEach((el) => {
    el.remove();
  });
  const blocks: ArticleBlock[] = [];
  walk(doc.body, blocks);
  return blocks;
}
