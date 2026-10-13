import { http, HttpResponse } from 'msw';
import type { RequestHandler } from 'msw';

import guardianSearch from '@/test/fixtures/guardian/search.json';
import newsapiEverything from '@/test/fixtures/newsapi/everything.json';
import newsapiTopHeadlines from '@/test/fixtures/newsapi/top-headlines.json';
import nytSearch from '@/test/fixtures/nyt/articlesearch.json';

// Default responses for every test: the real, trimmed fixtures. Tests override per case with
// `server.use(...)`; anything without a handler fails the test (onUnhandledRequest: 'error').
export const handlers: RequestHandler[] = [
  http.get('*/api/newsapi/top-headlines', () => HttpResponse.json(newsapiTopHeadlines)),
  http.get('*/api/newsapi/everything', () => HttpResponse.json(newsapiEverything)),
  http.get('*/api/guardian/search', () => HttpResponse.json(guardianSearch)),
  http.get('*/api/nyt/articlesearch.json', () => HttpResponse.json(nytSearch)),
];
