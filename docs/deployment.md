# API proxy, environment and Docker

The browser only ever calls same-origin paths `/api/<provider>/...`. In development the Vite proxy adds the API keys; in Docker, nginx does. Client code is identical in both.

Keys live in `.env` as `NEWSAPI_KEY`, `GUARDIAN_API_KEY`, `NYT_API_KEY` (no `VITE_` prefix). `.env.example` is committed with empty values.

## Development: `vite.config.ts`

Load keys with `loadEnv(mode, process.cwd(), '')` (empty prefix, so non-`VITE_` vars are readable in the config only). Define the proxy once and use it for both `server.proxy` and `preview.proxy`.

`rewrite` only maps the path. Keys are added to the **outgoing** request in a `proxyReq` listener, never in `rewrite`: Vite logs the rewritten `req.url` on proxy errors, so a key added there would be printed to the terminal.

```ts
const withKey = (path: string, key: string) =>
  `${path}${path.includes('?') ? '&' : '?'}api-key=${encodeURIComponent(key)}`;

const apiProxy = {
  '/api/newsapi': {
    target: 'https://newsapi.org',
    changeOrigin: true,
    rewrite: (p) => p.replace(/^\/api\/newsapi/, '/v2'),
    configure: (proxy) => {
      proxy.on('proxyReq', (proxyReq) => {
        proxyReq.setHeader('X-Api-Key', keys.newsapi);
        proxyReq.removeHeader('origin'); // free plan rejects browser-originated requests
        proxyReq.removeHeader('referer');
      });
    },
  },
  '/api/guardian': {
    target: 'https://content.guardianapis.com',
    changeOrigin: true,
    rewrite: (p) => p.replace(/^\/api\/guardian/, ''),
    configure: (proxy) => {
      proxy.on('proxyReq', (proxyReq) => { proxyReq.path = withKey(proxyReq.path, keys.guardian); });
    },
  },
  '/api/nyt': { /* same as guardian, rewrite to /svc/search/v2, keys.nyt */ },
};
```

## Missing keys: the `not_configured` contract

A blank key would earn an upstream 401 that looks exactly like a bad key. Instead, both proxies answer locally, without contacting the provider:

```
HTTP 503   Content-Type: application/json
{"status":"error","code":"not_configured","message":"API key not configured"}
```

`http.ts` maps this to `ApiError { code: 'not_configured' }` (never retried) and the UI shows "{Source} isn't configured" while the other sources keep working.

- **Dev/preview:** the `newsfeed:api-key-guard` plugin in `vite.config.ts` adds a middleware in `configureServer`/`configurePreviewServer`, which runs before Vite's proxy.
- **nginx:** each `/api/<provider>/` location copies its key into a variable (`set $guardian_key "${GUARDIAN_API_KEY}";`) and starts with `if ($guardian_key = "") { return 503 '{"status":"error","code":"not_configured",...}'; }` under `default_type application/json` (nginx's `if` needs a variable on the left).

## Docker

The files are the source of truth; this section records why they look the way they do.

### `nginx/default.conf.template` (+ `nginx/security-headers.inc`)

- The image runs `envsubst` on `/etc/nginx/templates/*.template` at startup and substitutes only variables that are **defined**, so nginx's own `$args`, `$uri`… are untouched. Keys are injected at runtime, never baked into the image.
- SPA fallback `try_files $uri $uri/ /index.html`; `index.html` is `Cache-Control: no-cache`; `/assets/` (hashed names) is `public, max-age=31536000, immutable` (one header: `expires` would add a second `Cache-Control`). gzip for css/js/json/svg; `server_tokens off`.
- **Proxy:** NewsAPI `proxy_pass https://newsapi.org/v2/` with `X-Api-Key` and `Origin`/`Referer` cleared (the free plan rejects browser-originated calls). Guardian and NYT append `&api-key=…` to `$args` and then `rewrite … break` to the upstream path: **`set` must come before `rewrite … break`**, because `break` stops every later rewrite-module directive (including `set`). All use `proxy_ssl_server_name on` and the upstream `Host`.
- **No keys in logs:** the access log records the client's request line (no key). nginx's error log prints the full upstream URL, which carries the Guardian/NYT key, so the `/api/` locations set `error_log /dev/stderr crit`.
- **Headers** (`security-headers.inc`, included in every location that sets its own `add_header`, since nginx doesn't inherit `add_header` once a location has one): `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options: DENY`, and a CSP: everything same-origin except `img-src 'self' https: data:` (publisher image CDNs) and `style-src 'unsafe-inline'` (Radix positions popovers with style attributes).

### `Dockerfile`

`node:24-alpine` runs `npm ci` + `npm run build` (`src/routeTree.gen.ts` is committed, so `tsc -b` works before Vite generates it); `nginxinc/nginx-unprivileged:alpine` serves `dist/` on 8080 as uid 101, with the template in `/etc/nginx/templates/` and the headers include in `/etc/nginx/conf.d/`.

### `docker-compose.yml` and `.dockerignore`

- One service `web`, `build: .`, `ports: ["8080:8080"]`.
- Keys via `environment: NEWSAPI_KEY: ${NEWSAPI_KEY:-}` (×3), **not** `env_file`: Compose reads `.env` for interpolation, and `:-` makes a missing key an empty string. Every variable is then always defined, so a missing key yields `503 not_configured` instead of an unsubstituted `${VAR}` that stops nginx from starting. It also works with no `.env` at all.
- Healthcheck `wget -qO- http://127.0.0.1:8080/`: **not `localhost`**, which resolves to `::1` first inside the container while nginx listens on IPv4 only.
- `.dockerignore` keeps `.env*` (except `.env.example`), `node_modules`, `dist`, `.git`, `.claude`, docs and Markdown out of the build context.

## Verifying

- Dev: with `npm run dev` running, `curl -s "http://localhost:5173/api/guardian/search?q=test" | head -c 500` returns JSON.
- Docker: `docker compose up --build`, then the same request against port 8080. Expect JSON, not 401/404. Also: SPA routes return `index.html`; `docker compose ps` shows `healthy`; a container started with blank keys answers 503 `not_configured` per source; `docker compose logs web | grep -c api-key` is 0.
