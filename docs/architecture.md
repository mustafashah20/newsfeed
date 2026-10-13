# Architecture

Data flows one way: **provider adapters → registry → aggregation hook → TanStack Query → UI**. Filters live in the URL, preferences in a persisted Zustand store, server data in the Query cache.

## Domain model (`services/news/types.ts`)

```ts
export const PROVIDER_IDS = ['newsapi', 'guardian', 'nyt'] as const;
export type ProviderId = (typeof PROVIDER_IDS)[number];

export type Article = {
  id: string;               // `${providerId}:${hash or url}`, stable and unique
  externalId: string;       // provider-native id used in the reader URL (Guardian content id, NYT _id, NewsAPI url)
  title: string;
  description: string | null;
  excerpt: string | null;   // extra text beyond description (NewsAPI content minus "[+N chars]"); NYT: null (no lead_paragraph in current responses)
  url: string;
  imageUrl: string | null;
  publishedAt: string;      // ISO 8601
  author: string | null;    // normalized ("By " removed, trimmed)
  category: Category | null;
  provider: ProviderId;
  sourceName: string;       // publication shown on the card ("BBC News", "The Guardian", …)
};

export type ProviderQuery = {
  q?: string;
  from?: string;            // yyyy-MM-dd
  to?: string;
  categories: Category[];   // empty = all
};

export type ProviderPage = { articles: Article[]; hasMore: boolean };

export interface NewsProvider {
  readonly id: ProviderId;
  readonly label: string;
  fetchPage(query: ProviderQuery, page: number, signal: AbortSignal): Promise<ProviderPage>;
}

// Reader
export type ArticleBlock =
  | { type: 'paragraph' | 'heading' | 'quote' | 'listItem'; text: string };

export type ArticleDetail = Article & {
  blocks: ArticleBlock[];
  isFullText: boolean;      // true only when the source returned the complete body
};

// Optional capability (Interface Segregation): only providers that can fetch one article by id implement it.
export interface ArticleDetailSource {
  readonly providesFullText: boolean; // false (NYT): fetching only recovers the preview, so skip it when one is cached
  fetchArticle(externalId: string, signal: AbortSignal): Promise<ArticleDetail>;
}
export const supportsArticleDetail = (p: NewsProvider): p is NewsProvider & ArticleDetailSource =>
  'fetchArticle' in p;
```

## Provider adapters (`services/news/providers/<id>/`)

Four files, one job each:

- `client.ts`: a pure `buildXParams(query, page)` that maps `ProviderQuery` + page to the provider's query params (unit-tested), plus the call through the provider's axios client. Knows the provider's param names, nothing about the UI.
- `schema.ts`: Zod schema of the **raw** response. Loose objects; optional/nullable wherever the API may omit fields.
- `mapper.ts`: pure `raw item → Article | null`. `safeParse` each item; drop invalid items instead of failing the page.
- `index.ts`: composes the three into the exported `NewsProvider` (e.g. `newsapiProvider`). Not a barrel.

`registry.ts` exports `providers: Record<ProviderId, NewsProvider>` and `providerList`. Adding a source = a new folder + one registry line. Nothing outside `providers/<id>/` references raw field names. Provider details: [data-sources.md](data-sources.md).

## HTTP (`services/news/http.ts`)

One axios service; adapters never call `fetch` or `axios` directly. `createApiClient(provider)` returns an axios instance for that provider's proxy path, configured once:

- **Instance config:** `baseURL` `/api/<provider>` (resolved against `location.origin` so it also works under jsdom), `timeout: 10_000`, `Accept: application/json`, `adapter: 'fetch'`, `responseType: 'json'`.
- **Request interceptor:** drops `undefined`, `null` and `''` params, so builders can pass optional filters straight through. The key is never added here: the proxy adds it.
- **Response interceptor (success):** rejects a 2xx whose body isn't JSON as `ApiError { code: 'invalid_response' }`.
- **Response interceptor (error):** maps every `AxiosError` to `ApiError { status, code, provider, message }`: `not_configured` (503 + body code from the proxy), `unauthorized` (401/403), `rate_limited` (429), `timeout`, `network`, `server` (5xx), `http`. Cancellations (`ERR_CANCELED`, from Query's `signal`) are rethrown unchanged. `message` is for developers and never contains the request URL; the UI maps `code` to friendly text.

Calls look like `client.get<unknown>('/search', { params, signal })`; `data` is `unknown` and goes to `parseResponse(schema, data, provider)`, which turns a shape mismatch into `ApiError { code: 'invalid_response' }` (so the UI can show a friendly per-source error). Items are then validated one by one in the mapper and invalid ones dropped. `isRetryableError` (network, timeout, server) drives Query's retry. Tests use MSW, which intercepts axios's fetch adapter.

## TanStack Query

`app/query-client.ts`:

```ts
new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60_000,
      gcTime: 30 * 60_000,
      refetchOnWindowFocus: false,
      retry: (count, err) => !(err instanceof ApiError && err.status < 500) && count < 2,
    },
  },
});
```

Query keys come only from `services/news/query-keys.ts`:

```ts
export const articleKeys = {
  all: ['articles'] as const,
  page: (provider: ProviderId, query: ProviderQuery, page: number) =>
    [...articleKeys.all, provider, normalizeQuery(query), page] as const,
  detail: (provider: ProviderId, externalId: string) =>
    [...articleKeys.all, 'detail', provider, externalId] as const,
  preview: (provider: ProviderId, externalId: string) =>
    [...articleKeys.all, 'preview', provider, externalId] as const,
};
```

`preview` holds the card's data seeded on click; `detail` holds only what `fetchArticle` returned. They are separate keys so a seeded preview never counts as a fresh detail and blocks the full-text fetch.

`normalizeQuery` sorts arrays, trims `q` and drops empty values, so equivalent filters share a cache entry.

## Aggregation (`features/articles/hooks/useAggregatedArticles.ts`)

Each provider is cached and fails independently, so toggling one source never refetches the others.

- Input: `{ query, providers, authors? }`. Local `pageCount` starts at 1 and resets when `query`/`providers` change.
- `useQueries` with one query per provider × page `1..pageCount`, keyed by `articleKeys.page(...)`. Page *n+1* is requested only for providers whose page *n* had `hasMore`.
- `combine` returns:
  - `articles`: for each page index, merge that batch across providers, dedupe by normalized URL, sort by `publishedAt` desc, then append batches in order (Load more never reshuffles what's already shown). Global dedupe across batches.
  - `statusByProvider` (`loading | success | error` + message), `isInitialLoading`, `isFetchingMore`, `hasMore`, `loadMore()`.
- Partial failure: if NYT returns 429, the others still render and `SourceStatusBar` shows a warning chip with Retry.
- Merge/dedupe/sort are pure functions in `features/articles/lib/merge.ts`, unit-tested.
- "Load more" button. Infinite scroll (backlog) would be an `IntersectionObserver` sentinel calling the same `loadMore()`.
- `pageCount` resets without an effect: the hook stores `{ key, count }` and treats the count as 1 whenever the current filter key differs. NYT pages get a 15 min `staleTime` (5 req/min limit).
- `ArticleResults` renders every state from the hook's result (skeleton, all-failed `ErrorState` with Retry, the page's empty state, list + count + Load more) and the `SourceStatusBar` above them; feed and search both use it.

## Search URL state (`features/search/search-params.ts`)

```ts
export const searchParamsSchema = z.object({
  q: z.string().trim().catch(''),
  from: z.iso.date().optional().catch(undefined),
  to: z.iso.date().optional().catch(undefined),
  category: z.enum(CATEGORIES).optional().catch(undefined),
  sources: z.array(z.enum(PROVIDER_IDS)).catch([...PROVIDER_IDS]),
});
```

`routes/search.tsx` uses `validateSearch: searchParamsSchema`. Read with `Route.useSearch()`, update with `navigate({ search: (prev) => ({ ...prev, ...patch }) })`. Date presets (Any time, Past 24 h, Past week, Past month) and a custom range are converted to `from`/`to` before writing to the URL.

## Article reader (`features/reader/`, route `/article/$provider?id=<externalId>`)

The id goes in a search param (validated with Zod) because Guardian ids contain slashes.

Every article is read inside the app. Only the Guardian's API returns full text; NYT and NewsAPI only return a preview, and scraping or iframing publisher pages is a non-goal. Preview-only articles show everything the API gave us, with no "Continue reading" button.

**What each source can show**

| Source | Reader content | Works on refresh / shared link? |
|---|---|---|
| Guardian | Full body (`isFullText: true`), fetched by id | Yes: `fetchArticle` calls the single-item endpoint |
| NYT | Image, title, byline, abstract (`isFullText: false`) + `PreviewNotice` | Yes: `fetchArticle` queries Article Search by `_id` (1 request against the 5/min limit; skipped when a preview is cached) |
| NewsAPI | Image, title, byline, description + truncated content (`isFullText: false`) + `PreviewNotice` | Only if the preview is in the Query cache (NewsAPI has no lookup by id) |

**Data flow**
1. Clicking a card seeds the cache: `queryClient.setQueryData(articleKeys.preview(provider, externalId), toPreviewDetail(article))`. `toPreviewDetail` (pure, `services/news/preview.ts`) turns `description` + `excerpt` into `paragraph` blocks with `isFullText: false`. The card itself stays presentational: it receives its title link as a `TitleLink` component prop, and the app passes `ReaderLink` (`features/articles/components/ReaderLink.tsx`), which renders the router `<Link>` and does the seeding on click. Tests pass a plain `<a>`.
2. `useArticle(provider, externalId)` reads the preview from `articleKeys.preview(...)` (cache only, never fetched) and the detail query at `articleKeys.detail(...)`:
   - The detail query is enabled when the provider implements `ArticleDetailSource` and either `providesFullText` is true (Guardian) or no preview is cached (NYT direct load). `queryFn` calls `fetchArticle`; `placeholderData` is the cached preview, so it shows instantly while the full body loads. `staleTime: 30 min`.
   - Result: fetched detail if present, otherwise the preview. If neither exists and no fetch is possible (NewsAPI direct load/refresh), return `status: 'unavailable'` so the page renders `ReaderUnavailable`.
3. The page picks the layout from `isFullText`: full body, or preview + `PreviewNotice` (a short note, no link or button).

**Guardian body parsing (`services/news/providers/guardian/body-parser.ts`)**
- Request `show-fields=body,byline,thumbnail,trailText` (and `show-elements=image` for a larger hero image when available).
- Parse with `new DOMParser().parseFromString(html, 'text/html')` and walk the tree **recursively** (real bodies nest content: `li` sits inside `ul`/`ol`, and liveblogs wrap every post in `div.block > div.block-elements`):
  - **Emit** a block for `p` → paragraph, `h2`/`h3` → heading, `blockquote` → quote (one block; its inner `<p>`s joined with a blank line), `li` → listItem. Text is `textContent`, whitespace-collapsed and trimmed; empty blocks are dropped. Don't descend into an emitted element (`li > p` stays one listItem).
  - **Descend** into containers: `div`, `section`, `ul`, `ol`.
  - **Drop** the whole subtree of everything else: `figure` (images, embeds), `aside` (rich links "Related: …"), `iframe`, `script`, `style`, `gu-atom` and other custom elements, and liveblog timestamps (`p.block-time`).
- No HTML ever reaches React; the UI maps blocks to `<p>`, `<h2>`, `<blockquote>`, `<li>`.
- Pure function, unit-tested with the real trimmed bodies in `src/test/fixtures/guardian/bodies.json` (`article`, `list`, `liveblog`) and `guardian/item.json`.
- Guardian search also returns `type: "liveblog"` items; they go through the same parser.

**Rules**
- Article bodies stay in the in-memory Query cache only. Never persist them (no localStorage, no Zustand).
- Every reader page shows source and author, and ends with a small attribution line "Source: {source} · Original article" (`target="_blank" rel="noopener noreferrer"`). That is the only link out of the app; it is not styled as a call to action.
- Nothing else links to publisher sites: cards, the feed, search and `ReaderUnavailable` (which links back to the feed) all stay in the app.
- Router: `createRouter({ ..., scrollRestoration: true })` so Back returns to the same scroll position in the list.

## Preferences (`features/preferences/store.ts`)

```ts
type Preferences = {
  sources: ProviderId[];   // default: all three
  categories: Category[];  // default: [] = all
  authors: string[];       // normalized, case-insensitive unique
};
```

- Actions: `toggleSource`, `setCategories`, `addAuthor`, `removeAuthor`, `reset`. `persist` with `name: 'news-prefs'`, `version: 1`, `migrate`.
- Components read with selectors (`usePreferences((s) => s.sources)`), never the whole store.
- At least one source must stay selected.
- **Authors:** no API filters by author consistently. The feed fetches by preferred sources + categories; on the client, articles by followed authors get a "Following" badge and move to the top of their batch, and an "Only followed authors" toggle filters to them. Authors can be followed from an `ArticleCard` (`FollowAuthorButton`) or typed in on `/preferences`.
