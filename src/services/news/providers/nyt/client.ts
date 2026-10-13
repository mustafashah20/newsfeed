import { toCompactDate } from '@/lib/date';

import { toProviderCategory } from '../../categories';
import { createApiClient } from '../../http';
import type { ProviderQuery } from '../../types';

/** Fixed by the API. */
export const NYT_PAGE_SIZE = 10;
/** The API's last 0-based page; deeper pages return 400. */
export const NYT_MAX_PAGE_INDEX = 100;

const client = createApiClient('nyt');

/** `section.name:("Business" "Technology")`, or undefined for all sections. */
export function buildNytSectionFilter(query: ProviderQuery) {
  if (query.categories.length === 0) return undefined;
  const names = query.categories.map((c) => `"${toProviderCategory('nyt', c)}"`).join(' ');
  return `section.name:(${names})`;
}

/** ProviderQuery + 1-based page → articlesearch params (the API's page is 0-based). */
export function buildNytSearchParams(query: ProviderQuery, page: number) {
  return {
    q: query.q,
    fq: buildNytSectionFilter(query),
    begin_date: query.from && toCompactDate(query.from),
    end_date: query.to && toCompactDate(query.to),
    sort: 'newest',
    page: page - 1,
  };
}

export async function searchNyt(query: ProviderQuery, page: number, signal: AbortSignal) {
  const { data } = await client.get<unknown>('/articlesearch.json', {
    params: buildNytSearchParams(query, page),
    signal,
  });
  return data;
}

/** `_id:"nyt://article/<uuid>"`: the verified way to look one article up (1 request). */
export function buildNytIdFilter(id: string) {
  // Escape quotes and backslashes so the id can't break out of the quoted Lucene term.
  return `_id:"${id.replace(/["\\]/g, '\\$&')}"`;
}

export async function fetchNytById(id: string, signal: AbortSignal) {
  const { data } = await client.get<unknown>('/articlesearch.json', {
    params: { fq: buildNytIdFilter(id) },
    signal,
  });
  return data;
}
