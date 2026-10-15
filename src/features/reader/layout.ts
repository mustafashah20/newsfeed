// The reader's layout, shared by the page and its skeleton so nothing jumps when the article
// arrives. Everything (Back, title, byline, hero, body) sits in one centred column, so the image
// is exactly as wide as the text around it and the space either side is even.

/** The article column: wide enough for the hero, a readable line length for the body. */
export const READER_COLUMN = 'mx-auto w-full min-w-0 max-w-3xl';

/** The hero: 16:9 crops photos least (most news images are shot near it). */
export const READER_HERO = 'aspect-video rounded-md';
