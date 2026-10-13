# Roadmap

Initial build, in order. Each milestone ends with the Done checks from `AGENTS.md` and a commit. Later changes keep the conventions each milestone establishes.

1. **Scaffold.** The repo root already holds `AGENTS.md`, `CLAUDE.md`, `.claude/` and `docs/`, so never scaffold into `.` and never choose "Remove existing files". Run `npm create vite@latest vite-tmp -- --template react-ts --no-interactive` (check `--help` if the flag isn't supported), move its contents including dotfiles into the root without overwriting, delete `vite-tmp`, `npm install`. Strict tsconfig, `@` alias, ESLint (with the `no-restricted-imports` rule for `@/features/*/*`) + Prettier, Vitest + RTL + jsdom, npm scripts. Commit `chore: scaffold vite react-ts project`.
2. **Styling & UI kit.** Tailwind v4 via `@tailwindcss/vite`; `npx shadcn@latest init`; add the shadcn components listed in `AGENTS.md`.
3. **Routing & shell.** TanStack Router file-based setup; `__root.tsx` with `AppShell` (header, mobile nav, `<Outlet/>`); empty `/`, `/search`, `/preferences`; QueryClient provider.
4. **Proxy & env.** `.env.example`, Vite proxy, `http.ts` + `ApiError` ([deployment.md](deployment.md)). Ask for `.env` to be filled in and `npm run dev` started, confirm one real call per provider with `curl`, save trimmed responses as fixtures. Also save one Guardian **single-item** response with `show-fields=body` (trimmed) for the body parser, and one NYT lookup by `_id` (`fq=_id:"…"`) to lock in the query syntax.
5. **Domain & adapters.** `types.ts` (including `externalId`, `excerpt`, reader types), `categories.ts`, the three adapters with schemas, mappers and tests, `registry.ts`, `query-keys.ts` ([architecture.md](architecture.md), [data-sources.md](data-sources.md)).
6. **Aggregation.** `merge.ts` (+ tests), `useAggregatedArticles`, `ArticleCard`, `ArticleList`, skeleton/empty/error states, `SourceStatusBar`, Load more. Cards link to `/article/$provider?id=…` (the reader route can be a placeholder until milestone 9).
7. **Search page.** Search params schema, `SearchBar`, filters (date presets + custom, category, sources), active chips, responsive Sheet, MSW integration test.
8. **Preferences & feed.** Store (+ tests), `/preferences` UI, follow-author from cards, personalized feed on `/` with "Only followed authors", first-visit hint linking to preferences.
9. **Article reader.** Guardian `fetchArticle` + `body-parser.ts` (+ tests), NYT `fetchArticle` by `_id`, `toPreviewDetail` (`services/news/preview.ts`), preview-key seeding on card open, `useArticle`, `/article/$provider` route with `ArticleReaderPage`, `ReaderHeader`, `ArticleBody`, `PreviewNotice`, `ReaderUnavailable`, attribution line, Follow-author button, scroll restoration; no links out of the app besides attribution; reader tests ([architecture.md](architecture.md) → Article reader).
10. **Docker.** Dockerfile, nginx template, compose, `.dockerignore`; verify end to end ([deployment.md](deployment.md)).
11. **Polish & docs.** Responsive pass at 360/768/1280 px (including the reader), keyboard-only a11y pass, README, screenshots.

## README contents (milestone 11)

1. Overview + desktop and mobile screenshots.
2. Quick start with Docker: links to sign up for the three keys, `cp .env.example .env`, fill keys, `docker compose up --build`, open http://localhost:8080.
3. Local development with npm.
4. Architecture: adapters → registry → aggregator → Query → UI; why keys are proxied; why filters live in the URL and only preferences in Zustand.
5. API limitations and how they're handled (NewsAPI 24 h delay and 30-day window, NYT 5 req/min, client-side author matching, every article opens in the app, but full text comes only from the Guardian; NYT and NewsAPI show their API preview; NewsAPI articles can't be reopened from a shared link).
6. Scripts, testing, known limitations, roadmap.

## Backlog (only when requested)

- **Dark mode:** class strategy, `ThemeProvider` (system default, persisted), `ThemeToggle` in the header.
- **Infinite scroll:** see [architecture.md](architecture.md#aggregation-featuresarticleshooksuseaggregatedarticlests).
- **CI:** `.github/workflows/ci.yml` running `npm ci`, typecheck, lint, test, build on push/PR.
