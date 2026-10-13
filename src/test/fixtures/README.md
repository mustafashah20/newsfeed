# Fixtures

Real API responses captured through the dev proxy on 2026-10-14, then trimmed: array items and whole top-level body elements were removed, but no value was edited. Paths below are what the browser requests (`/api/...`); the proxy adds the key.

| File | Request |
|---|---|
| `newsapi/top-headlines.json` | `/api/newsapi/top-headlines?country=us&pageSize=5` (4 items; item 3 has null author/description/image/content) |
| `newsapi/everything.json` | `/api/newsapi/everything?q=climate&language=en&sortBy=publishedAt&pageSize=5` (first 3) |
| `newsapi/top-headlines-technology.json` | `/api/newsapi/top-headlines?country=us&category=technology&pageSize=5` (first 3) |
| `guardian/search.json` | `/api/guardian/search?q=climate&order-by=newest&page-size=5&show-fields=trailText,thumbnail,byline` (first 3) |
| `guardian/item.json` | `/api/guardian/<id>?show-fields=body,byline,thumbnail,trailText&show-elements=image` (main image, smallest + largest asset) |
| `guardian/bodies.json` | `fields.body` from `/api/guardian/search?q="what we know"&show-fields=body,…`, trimmed to chosen top-level elements: `article` (h2, inline links, embed figure), `list` (ul/li, iframe figure), `liveblog` (div.block wrappers, blockquote, rich-link asides) |
| `nyt/articlesearch.json` | `/api/nyt/articlesearch.json?q=climate&sort=newest&page=0` (first 3 docs, 2 keywords each) |
| `nyt/articlesearch-sections.json` | `/api/nyt/articlesearch.json?fq=section.name:("Technology" "Science")&sort=newest` (first 2) — confirms the `section.name` field |
| `nyt/article-by-id.json` | `/api/nyt/articlesearch.json?fq=_id:"nyt://article/e14886a8-…"` (exactly 1 doc) |

Re-capture only when a provider changes its response; update the schema from the new response rather than editing a fixture by hand.
