const APP_NAME = 'Newsfeed';

/** "Search: climate" → "Search: climate · Newsfeed"; no title → "Newsfeed". */
export function pageTitle(title?: string) {
  return title ? `${title} · ${APP_NAME}` : APP_NAME;
}
