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
- **nginx (milestone 10):** each `/api/<provider>/` location starts with `if ($key = "") { return 503 '{"status":"error","code":"not_configured",...}'; }` with `default_type application/json`. Every key must be **defined** in the container's environment, even if blank (`.env.example` lists all three): envsubst leaves undefined `${VARS}` untouched and nginx then fails to start on the unknown variable.

## Docker: `nginx/default.conf.template`

The nginx image runs `envsubst` on `/etc/nginx/templates/*.template` at startup and substitutes only environment variables that are defined, so nginx's own `$args`, `$uri` etc. are untouched. Keys are injected at runtime from compose, never baked into the image.

```nginx
server {
  listen 8080;
  root /usr/share/nginx/html;
  index index.html;

  location / { try_files $uri $uri/ /index.html; }
  location /assets/ { expires 1y; add_header Cache-Control "public, immutable"; }

  # NewsAPI: key in header; strip Origin/Referer so the free plan accepts proxied calls
  location /api/newsapi/ {
    proxy_pass https://newsapi.org/v2/;
    proxy_ssl_server_name on;
    proxy_set_header Host newsapi.org;
    proxy_set_header X-Api-Key "${NEWSAPI_KEY}";
    proxy_set_header Origin "";
    proxy_set_header Referer "";
  }

  location /api/guardian/ {
    # `set` must come before `rewrite ... break`: break stops all later rewrite-module directives.
    set $args "$args&api-key=${GUARDIAN_API_KEY}";
    rewrite ^/api/guardian/(.*)$ /$1 break;
    proxy_pass https://content.guardianapis.com;
    proxy_ssl_server_name on;
    proxy_set_header Host content.guardianapis.com;
  }

  location /api/nyt/ {
    set $args "$args&api-key=${NYT_API_KEY}";
    rewrite ^/api/nyt/(.*)$ /svc/search/v2/$1 break;
    proxy_pass https://api.nytimes.com;
    proxy_ssl_server_name on;
    proxy_set_header Host api.nytimes.com;
  }

  gzip on;
  gzip_types text/css application/javascript application/json image/svg+xml;
  add_header X-Content-Type-Options nosniff always;
  add_header Referrer-Policy strict-origin-when-cross-origin always;
}
```

## Dockerfile

```dockerfile
FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginxinc/nginx-unprivileged:alpine
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
```

`docker-compose.yml`: one service `web`, `build: .`, `ports: ["8080:8080"]`, `env_file: .env`, healthcheck `wget -qO- http://localhost:8080/ || exit 1`. `.dockerignore` excludes `.env`, `node_modules`, `dist`, `.git`.

## Verifying

- Dev: with `npm run dev` running, `curl -s "http://localhost:5173/api/guardian/search?q=test" | head -c 500` returns JSON.
- Docker: `docker compose up --build`, then the same request against port 8080. Expect JSON, not 401/404.
