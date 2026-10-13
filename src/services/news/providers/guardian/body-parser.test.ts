import { describe, expect, it } from 'vitest';

import bodies from '@/test/fixtures/guardian/bodies.json';
import item from '@/test/fixtures/guardian/item.json';

import { parseGuardianBody } from './body-parser';

const types = (html: string) => parseGuardianBody(html).map((b) => b.type);
const texts = (html: string) => parseGuardianBody(html).map((b) => b.text);

function expectNoHtml(html: string) {
  for (const { text } of parseGuardianBody(html)) {
    expect(text).not.toMatch(/<\/?[a-z][^>]*>/i);
    expect(text).toBe(text.trim());
  }
}

describe('parseGuardianBody', () => {
  it('keeps paragraphs and headings of a real article, dropping its embed figure', () => {
    const blocks = parseGuardianBody(bodies.article.body);

    expect(blocks.filter((b) => b.type === 'heading').map((b) => b.text)).toEqual([
      'What has happened?',
      'If it is the plague, what are we talking about?',
    ]);
    expect(blocks[0]).toMatchObject({ type: 'paragraph' });
    expect(blocks[0]?.text).toMatch(/^After a 28-year-old lab technician died/);
    // The figure wraps a gu-atom media embed with an iframe: nothing of it survives.
    expect(types(bodies.article.body)).not.toContain(undefined);
    expect(blocks).toHaveLength(5);
    expectNoHtml(bodies.article.body);
  });

  it('turns list items into one block each, even when an li wraps a p', () => {
    const blocks = parseGuardianBody(bodies.list.body);
    const items = blocks.filter((b) => b.type === 'listItem');

    expect(items).toHaveLength(9);
    expect(items[0]?.text).toMatch(/^Russian strikes hit multiple Ukrainian power plants/);
    expectNoHtml(bodies.list.body);
  });

  it('reads liveblog posts: headings and quotes kept; timestamps and rich links dropped', () => {
    const blocks = parseGuardianBody(bodies.liveblog.body);
    const all = texts(bodies.liveblog.body).join('\n');

    expect(blocks.filter((b) => b.type === 'heading').map((b) => b.text)).toEqual([
      'Is it naive to hope for a climate crisis panacea?',
      'Welcome to the Conversation',
    ]);
    // One quote block; its paragraphs joined by blank lines.
    const quotes = blocks.filter((b) => b.type === 'quote');
    const rawParagraphs = new DOMParser()
      .parseFromString(bodies.liveblog.body, 'text/html')
      .querySelectorAll('blockquote p').length;
    expect(quotes).toHaveLength(1);
    expect(quotes[0]?.text).toMatch(/^Jon says: I can relate to this question/);
    expect(quotes[0]?.text.split('\n\n')).toHaveLength(rawParagraphs);
    expect(all).not.toMatch(/\d{1,2}\.\d{2}(am|pm) BST/); // post timestamps
    expect(all).not.toContain('Related:'); // aside rich links
    expectNoHtml(bodies.liveblog.body);
  });

  it('parses the real single-item body (paragraphs; figure and iframe dropped)', () => {
    const body = item.response.content.fields.body;

    expect(new Set(types(body))).toEqual(new Set(['paragraph']));
    expect(parseGuardianBody(body)).toHaveLength(6);
    expectNoHtml(body);
  });

  it('drops scripts, embeds and figures, and never leaks markup', () => {
    const blocks = parseGuardianBody(
      [
        '<p>Kept <script>alert(1)</script><a href="https://x">link</a> &amp; <em>emphasis</em></p>',
        '<script>alert(2)</script>',
        '<iframe src="https://evil.example"></iframe>',
        '<figure><img src="x.jpg"><figcaption>Caption</figcaption></figure>',
        '<aside class="element-rich-link"><p>Related: elsewhere</p></aside>',
        '<p>   </p>',
        '<h3>Sub heading</h3>',
      ].join(''),
    );

    expect(blocks).toEqual([
      { type: 'paragraph', text: 'Kept link & emphasis' },
      { type: 'heading', text: 'Sub heading' },
    ]);
  });

  it('returns no blocks for an empty body', () => {
    expect(parseGuardianBody('')).toEqual([]);
    expect(parseGuardianBody(undefined)).toEqual([]);
  });
});
