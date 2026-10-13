# Data sources

Newsfeed reads from three APIs. All are free with a key; treat their limits as hard constraints.

| | NewsAPI.org | The Guardian Open Platform | NYT Article Search |
|---|---|---|---|
| Proxy path | `/api/newsapi/*` → `https://newsapi.org/v2/*` | `/api/guardian/*` → `https://content.guardianapis.com/*` | `/api/nyt/*` → `https://api.nytimes.com/svc/search/v2/*` |
| Auth (added by proxy) | header `X-Api-Key` | query `api-key` | query `api-key` |
| Free limits | 100 req/day, articles ~24 h delayed, search window ≈ last 30 days, development use only | ~500 req/day, ~1 req/s, non-commercial | ~500 req/day, **5 req/min** |
| Endpoints | `/everything`, `/top-headlines` | `/search` | `/articlesearch.json` |
| Keyword | `q` | `q` | `q` |
| Date | `from`, `to` (ISO 8601), `/everything` only | `from-date`, `to-date` (`YYYY-MM-DD`) | `begin_date`, `end_date` (`YYYYMMDD`) |
| Category | `category`, **`/top-headlines` only, one value** | `section` (OR with `\|`, e.g. `business\|technology`) | `fq` on section name, e.g. `section.name:("Business" "Technology")` |
| Sort | `sortBy=publishedAt` | `order-by=newest` | `sort=newest` |
| Paging | `page`, `pageSize` (≤ 100) | `page`, `page-size` (≤ 50); response has `pages` | `page` (0-based, fixed 10/page, max page 100) |
| Extra params | — | `show-fields=trailText,thumbnail,byline` | — |
| Author | `author` (often null) | `fields.byline` | `byline.original` ("By …") |
| Image | `urlToImage` | `fields.thumbnail` (small); larger via `show-elements=image` | `multimedia` (see below) |
| Native id (`externalId`) | article `url` (no id field) | `id` (e.g. `football/2024/oct/13/slug`, contains slashes) | `_id` |
| Text for the reader | `description` + `content` (**truncated** to ~200 chars, ends with `[+N chars]`) | **Full body** via `show-fields=body` | `abstract` only (`snippet` duplicates it; no `lead_paragraph`) |
| Single-article endpoint | none | `GET /{id}?show-fields=body,byline,thumbnail,trailText` → `response.content` | `GET /articlesearch.json?fq=_id:"<_id>"` → `response.docs[0]` (preview fields only) |

## Gotchas (all must be handled)

**NewsAPI**
- `/everything` requires `q` (or `sources`/`domains`). With no keyword, use `/top-headlines?country=us`.
- `/everything` has no `category`; `/top-headlines` has `category` but no date range. If a category is set → `/top-headlines` with `category` (+ `q`) and apply the date filter client-side; otherwise → `/everything` with `language=en`, `sortBy=publishedAt`.
- `/top-headlines` takes one category. For several, the adapter makes one request per category (max 3, `pageSize` split between them) and tags each article with its category.
- Drop placeholder items whose `title` or `url` is `"[Removed]"` / `https://removed.com`.
- Clamp `from` to today − 30 days, and show an inline note in the date filter when NewsAPI is selected.
- Error body: `{ status: "error", code, message }`. Map `code` into `ApiError`.
- `content` ends with a marker like `… [+3412 chars]`; strip it before using the text as `excerpt`.
- The free (Developer) plan serves only the first 100 results of a query (deeper pages fail with `maximumResultsReached`), so `hasMore` stops at `min(totalResults, 100)`.
- A page can hold fewer items than `pageSize` even when more exist (`pageSize=5` returned 4 of `totalResults: 35`), so compute `hasMore` as `page * pageSize < totalResults`, never from a short page.
- `author`, `description`, `urlToImage` and `content` can all be null on the same item (fixture `newsapi/top-headlines.json`, item 3); `source.id` is often null.

**Guardian**
- Always send `show-fields=trailText,thumbnail,byline`, or there is no description, image or author.
- `trailText` contains HTML; strip tags in the mapper.
- `body` is full article HTML with embeds, figures and asides; parse it into text blocks with the body parser (see architecture.md → Article reader). Never render it as HTML.
- The single-item response is wrapped as `response.content` (not `response.results`); give it its own schema.
- Guardian's terms require attribution: show "The Guardian" as the source and link to `webUrl` on every reader page (the small attribution line; the app applies the same line to all sources).
- Categories are "sections" (`sport`, not `sports`; `culture` for entertainment). Use the mapping table.

**NYT**
- 5 requests per minute: long `staleTime`, no retries on 429, submit-only search.
- `page` is 0-based; the app is 1-based. Convert in the adapter only.
- Category filter is **`fq=section.name:("Technology" "Science")`** (verified 2026-10-14, fixture `nyt/articlesearch-sections.json`). The response field is still named `section_name`.
- `multimedia` in current responses is an object `{ caption, credit, default: { url, width, height }, thumbnail }` with absolute URLs (all docs captured). Older responses used an array of objects with relative `url`: support both, prefixing relative URLs with `https://www.nytimes.com/`.
- `metadata.hits` caps at 10000; together with the 100-page limit, compute `hasMore` from `offset + docs.length < min(hits, 1010)`.
- `byline.original` starts with "By "; normalize it.
- No full text: the in-app reader shows `abstract` with a preview notice and no "Continue reading" button. `lead_paragraph` is absent from current responses (0 of 10 docs, 2026-10-14) and `snippet` equals `abstract`, so the mapper uses `abstract` as `description` and sets `excerpt: null`. Keep `lead_paragraph` optional in the schema in case it returns.
- Lookup by id for direct loads/shared links: `fq=_id:"<_id>"` (ids look like `nyt://article/<uuid>`; quote and URL-encode them). Verified 2026-10-14: returns exactly one doc (fixture `nyt/article-by-id.json`). Costs one of the 5 req/min, so the reader skips it when a preview is already cached. An empty `docs` array → `ReaderUnavailable`.

**NewsAPI** has no lookup by id: a NewsAPI article opened directly (refresh, shared link) with nothing cached shows `ReaderUnavailable`.

## Canonical categories (`services/news/categories.ts`)

One `as const` table; the mapping lives nowhere else.

| Canonical | NewsAPI | Guardian `section` | NYT section name |
|---|---|---|---|
| `general` | `general` | `world` | `World` |
| `business` | `business` | `business` | `Business` |
| `technology` | `technology` | `technology` | `Technology` |
| `science` | `science` | `science` | `Science` |
| `health` | `health` | `society` | `Health` |
| `sports` | `sports` | `sport` | `Sports` |
| `entertainment` | `entertainment` | `culture` | `Arts` |
