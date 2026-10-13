# AGENTS.md — Newsfeed

Guidance for AI coding agents in this repo (Claude Code loads it via `CLAUDE.md`). If a rule is impossible or clearly wrong, stop and say so rather than working around it.

## Project

Client-side news aggregator: articles from NewsAPI.org, The Guardian and The New York Times, normalized into one model and shown in a mobile-first UI.

- **Features:** keyword search filtered by date, category and source · personalized feed (preferred sources, categories, authors; persisted) · **in-app article reader** (every article is read inside Newsfeed, never on the publisher's site; full text where the source API provides it, the complete API preview otherwise) · responsive from 360 px · ships as a Docker image.
- **Principles:** clarity over cleverness (KISS) · one source of truth per concept (DRY) · one job per module; new sources plug in without editing existing code (SOLID) · strict TypeScript; external data is validated.

## Reference docs (read before working in that area)

| File | Read when |
|---|---|
| [docs/architecture.md](docs/architecture.md) | Touching `services/`, data hooks, query keys, aggregation, search params, or the preferences store |
| [docs/data-sources.md](docs/data-sources.md) | Anything provider-specific: params, limits, quirks, category mapping |
| [docs/deployment.md](docs/deployment.md) | Proxy, env vars, Docker, nginx |
| [docs/roadmap.md](docs/roadmap.md) | Starting a milestone, the README, or backlog questions |

## Commands

npm only; commit `package-lock.json`.

`npm run dev` (:5173) · `npm run typecheck` · `npm run lint` · `npm run format` · `npm test` (`vitest run`) · `npm run test:watch` · `npm run build` · `npm run preview` · `docker compose up --build` (:8080) · `npx shadcn@latest add <name>`

**Done** = `npm run typecheck && npm run lint && npm test && npm run build` pass with zero errors and zero warnings.

## Stack (fixed)

Node 24 · Vite 8 · React 19 · TypeScript strict (+ `noUncheckedIndexedAccess`, `noImplicitOverride`, `verbatimModuleSyntax`) · Tailwind v4 via `@tailwindcss/vite` (CSS-first, no `tailwind.config.js`) · shadcn/ui + lucide-react · TanStack Router (file-based) · TanStack Query v5 · Zustand v5 (preferences only) · axios 1.x (one client in `services/news/http.ts`) · Zod v4 · date-fns · Vitest + RTL + user-event + MSW v2 + jsdom · ESLint flat config (typescript-eslint, react-hooks, jsx-a11y) + Prettier (tailwind plugin) · Docker: `node:24-alpine` → `nginxinc/nginx-unprivileged`.

Packages that `shadcn add` installs (radix-ui, class-variance-authority, clsx, tailwind-merge, tw-animate-css, sonner…) are allowed. No other dependencies (lodash, redux, ky/other HTTP clients, form libraries, moment, UI kits…) without asking. No major-version upgrades.

## Hard rules

**Security**
- API keys live only in `.env` as `NEWSAPI_KEY`, `GUARDIAN_API_KEY`, `NYT_API_KEY`. Never `VITE_`-prefixed, never in the bundle. The browser calls only `/api/{newsapi,guardian,nyt}/*`; the Vite proxy and nginx add keys.
- Never read, print or grep `.env`. To check keys, call the running dev server: `curl -s "localhost:5173/api/guardian/search?q=test" | head -c 500`.
- `.env` is in `.gitignore` and `.dockerignore`; `.env.example` is committed. Never log keys or proxied URLs.
- No `dangerouslySetInnerHTML`, ever. Short HTML fields are stripped to text in mappers; full article HTML is parsed with the browser's `DOMParser` into typed text blocks and rendered as React elements (see docs/architecture.md → Article reader). The only external link is the reader's attribution link (see UI → Reader); it uses `target="_blank" rel="noopener noreferrer"`.

**TypeScript**
- No `any`, no `@ts-ignore`, no `!` outside tests. No `as` on external data; parse it with Zod. `import type` for types. `interface` only for implemented contracts; otherwise `type`.

**API quota (very small)**
- Search runs on submit only, never as-you-type (any live suggestions: debounce ≥ 500 ms, ≥ 3 chars). No refetch on focus, no polling, no retries on 4xx. Tests never call real APIs (MSW + fixtures).
- All HTTP goes through the axios client in `services/news/http.ts` (`createApiClient(provider)`); never `fetch` or a bare `axios.get` elsewhere, and never import axios outside `services/`. Its interceptors own the base URL, timeout, param cleanup and `ApiError` mapping.
- Show users friendly errors, never raw API messages: map `ApiError` (401 bad key, 429 rate limit, network/timeout) to a short message with a Retry action. A missing key must not break the app: that source shows "{Source} isn't configured" and the others keep working.

**Generated files (don't hand-edit)**
- `src/routeTree.gen.ts` · `src/components/ui/*` (small style tweaks are fine; wrap for behavior) · `package-lock.json`.

**Process**
- Work milestone by milestone ([docs/roadmap.md](docs/roadmap.md)). Propose a short plan and wait for approval; milestones 1–3 may run together once approved.
- After each milestone: run the Done checks yourself, report real results, commit with Conventional Commits (one logical change per commit).
- Never push, force-push, rewrite history or amend commits you didn't just make. Don't start backlog items unless asked.
- Never delete or skip a failing test. If an API response doesn't match the schema, fix the schema from the real response; don't guess.
- Ask before adding a dependency, changing the stack or folder structure, or changing public types in `services/news/types.ts`.

## Folder structure

Feature-based. Imports flow one way: `routes → features → services / components / hooks / lib`. `services` never imports React; `components` never imports `features`.

```
src/
├── main.tsx, index.css, routeTree.gen.ts (generated)
├── app/            providers.tsx, query-client.ts, router.ts
├── routes/         __root.tsx, index.tsx (feed), search.tsx, preferences.tsx,
│                   article.$provider.tsx (reader, `?id=`) — all thin
├── features/       each has index.ts = its public API
│   ├── articles/   components/ (ArticleCard, ArticleList, skeleton, EmptyState,
│   │               SourceStatusBar, LoadMoreButton), hooks/useAggregatedArticles.ts, lib/merge.ts
│   ├── search/     components/ (SearchBar, FiltersPanel, DateRangeFilter, CategorySelect,
│   │               SourceMultiSelect, ActiveFilterChips), search-params.ts
│   ├── feed/       components/FeedPage.tsx, hooks/useFeedParams.ts
│   ├── reader/     components/ (ArticleReaderPage, ReaderHeader, ArticleBody, PreviewNotice,
│   │               ReaderUnavailable), hooks/useArticle.ts
│   └── preferences/ store.ts, components/ (PreferencesForm, SourceToggles, CategoryPicker,
│                   AuthorInput, FollowAuthorButton)
├── services/news/  types.ts, categories.ts, http.ts, registry.ts, query-keys.ts, preview.ts,
│                   providers/{newsapi,guardian,nyt}/ (client, schema, mapper, index + tests;
│                   guardian also has body-parser.ts)
├── components/     ui/ (shadcn, generated) · layout/ (AppShell, Header, MobileNav, PageHeader)
│                   · common/ (shared by 2+ features; starts empty)
├── hooks/          generic hooks (useMediaQuery, useDebouncedValue)
├── lib/            utils.ts (cn), date.ts, text.ts
└── test/           setup.ts, msw/handlers.ts, fixtures/, render.tsx
```
Root: `AGENTS.md`, `CLAUDE.md`, `.claude/settings.json` (denies reading `.env`), `docs/`, `nginx/default.conf.template`, `Dockerfile`, `docker-compose.yml`, `.env.example`. Alias `@/*` → `src/*` (set in both tsconfigs and `vite.config.ts` before `shadcn init`).

**Where new code goes**

| Writing… | Goes in |
|---|---|
| A page | `routes/<name>.tsx` (thin) → `features/<name>/components/<Name>Page.tsx` |
| UI for one feature / for 2+ features | `features/<f>/components/` / `components/common/` (move on second use) |
| A styling primitive | `npx shadcn@latest add` → `components/ui/`; wrap in `common/` for extra behavior |
| App chrome | `components/layout/` |
| Feature logic / generic hook | `features/<f>/hooks/` / `src/hooks/` |
| Feature helpers / generic helpers | `features/<f>/lib/` / `src/lib/` |
| Feature types or constants | `features/<f>/types.ts`, `constants.ts` |
| Anything about a news API | `services/news/` |
| A test | Next to its source (`x.ts` → `x.test.ts`); shared helpers in `src/test/` |

Anything else: ask before creating a new top-level folder.

## React

- **Components:** function components, named exports (route files excepted), one per file, `XProps` type declared above and typed directly (no `React.FC`). React 19: `ref` is a normal prop; no `forwardRef`, `defaultProps`, classes or string refs. Files ≤ ~200 lines.
- **Three layers:** routes/pages compose; hooks hold logic and never return JSX; presentational components render props and local UI state only (no Query, store, router, axios or `fetch`). A presentational component renders in a test with props alone.
- **Hooks:** one concern each, named after what they return, return named objects. Pure logic (merge, normalize, format) goes in `lib/` and is unit-tested.
- **State homes:** server data → Query · filters and shareable state → URL search params · preferences → Zustand (selectors only) · temporary UI state → `useState`. No app-state context. Keep state as low as possible.
- **Effects:** no data fetching in `useEffect`. Effects only sync with things outside React (DOM APIs, observers, listeners). Never copy or derive state in an effect; compute it during render. No reflexive `useMemo`/`useCallback`/`memo`.
- **Reuse:** start inside the feature; promote to `components/common/` on the second use. Prefer `children`/slots over boolean props (more than ~2 → split or use a `cva` `variant`). Primitives accept `className` and native props. Callback props `onX`, handlers `handleX`. No prop drilling past two levels.
- **Rendering:** early returns for loading/error/empty; no nested ternaries; native `<form onSubmit>`; stable keys (article `id`, never index); route errors via the router's `errorComponent`, unknown URLs via `notFoundComponent` on the root route, per-source errors inline. Every route sets a page title through its `head` option (`<HeadContent />` in `__root`), e.g. "Search: climate · Newsfeed".
- **Imports:** each feature exposes its API through `index.ts` with explicit named re-exports (no `export *`). Outside a feature, import only from that index (ESLint `no-restricted-imports` blocks `@/features/*/*`). Inside a feature, use relative imports and never import your own index. No other barrel files. Order: packages → `@/` → relative.

## UI and responsive design

- Use shadcn primitives (Button, Input, Card, Badge, Select, Checkbox, Switch, Popover, Calendar, Sheet, Skeleton, Separator, Sonner); don't rebuild them. Colors only through shadcn CSS variables. `cn()` for classes; no inline `style`.
- **Layout:** sticky header (logo, search → `/search?q=`, nav Feed/Search/Preferences; Sheet below `md`). Filters in a sidebar at `lg`+, a Sheet below, with removable active-filter chips. Card grid 1 → 2 → 3 columns by the list's own width (container queries `@xl`/`@3xl`, so it fits both the full-width feed and the space beside the search sidebar). Card: lazy `aspect-video` image with fallback, source badge, category, relative time, title (2-line clamp), description (3-line clamp), author.
- **Every async view** has a skeleton, an empty state (+ clear filters), an error state (+ retry) and partial-error chips.
- **Search with no keyword** (`/search` with empty `q`) shows the latest articles from the selected sources with the other filters applied, plus a prompt to type a keyword. It is never a blank page.
- **Cards open the in-app reader** (`/article/$provider?id=…`) via the router's `<Link>`, never the publisher's site. No card, list or button in the app links out. The router has scroll restoration on, so Back returns to the same place in the list.
- **Reader:** large hero image, title, byline (author · relative date · source badge · category), Follow-author button, body in a comfortable reading column (`max-w-prose`, larger line height, `text-base sm:text-lg`). Full-text sources (Guardian) render the whole body. Preview-only sources (NYT, NewsAPI) render all the text their API provides, with a short `PreviewNotice` ("{Source} only shares a preview of this article") and **no** "Continue reading" button or other call to action. Every reader page ends with a small attribution line: "Source: {source} · Original article" (the Guardian's terms require it; we apply it to all sources). Loading → skeleton matching the layout; missing article → `ReaderUnavailable` with a link back to the feed.
- **Mobile-first:** unprefixed classes are mobile; `sm`/`md`/`lg`/`xl` only enlarge. Default breakpoints only; no `max-*:` variants or media queries in components. Container queries (`@container`) for components whose layout depends on placement.
- **Sizing:** no fixed widths/heights; `min-w-0` on text-bearing flex/grid children; one page container (`max-w-7xl` + responsive padding) in `AppShell`; side-by-side layouts stack on mobile; panels move into Sheets instead of being hidden; `min-h-dvh`, never `h-screen`.
- **Touch & content:** targets ≥ 44 px with spacing; nothing hover-only; inputs ≥ `text-base`. Images `w-full` + `aspect-*` + `object-cover` + width/height attributes. Long text clamps, truncates or breaks.
- **Accessibility:** landmarks, labelled inputs, visible focus, `aria-live` on result counts, AA contrast.
- **Verify:** after UI work, report behavior at 360 / 768 / 1280 px; the developer checks in DevTools before committing.

## Code style

Prettier formats; ESLint has zero warnings. Components `PascalCase.tsx`, hooks `useThing.ts`, everything else `kebab-case.ts`. Early returns; pure functions over classes. No magic strings for providers or categories. Comments explain *why*; each provider adapter starts with a short quirks comment.

## Testing

Test logic that can break; don't chase coverage. Required: each provider's mapper and URL builder, merge/dedupe/sort, search-param fallbacks, the preferences store, the Guardian body parser (headings/paragraphs/quotes kept, scripts/embeds/figures dropped, no HTML leaks), the reader page (Guardian full text; NYT/NewsAPI preview + notice, no continue button, attribution link present; NYT direct load fetches by id; NewsAPI direct load with no cached preview shows `ReaderUnavailable`), and one MSW integration test (a search renders all sources; an NYT 429 still shows the others plus a warning). Fixtures are real, trimmed responses in `src/test/fixtures/`. In component tests, query by role/label/text (not test IDs or class names) and use `userEvent`, not `fireEvent`; test behavior the user sees, not implementation details.

## Claude Code workflow

- Track milestone steps in the todo list.
- Run `npm run dev` / `docker compose up` in the background (or ask), verify with `curl`, stop what you started.
- Check installed package types or official docs before relying on shadcn CLI flags, Router plugin options or Zod v4 helpers.
- Subagents only for read-only exploration; never delegate edits.
- Don't paste large API responses; trim with `head -c`/`jq` into fixtures.
- Don't run `/init` (it overwrites `CLAUDE.md`).

## Non-goals

SSR/Next.js, auth, a backend beyond the proxy, i18n, analytics, PWA/offline storage of article content, Storybook, E2E frameworks, a keyless demo mode, scraping publisher sites for full text, embedding publisher pages in iframes, sending users to publisher sites (other than the attribution link).
