import type { ServerResponse } from 'node:http';
import { fileURLToPath, URL } from 'node:url';

import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import type { Connect, Plugin, ProxyOptions } from 'vite';
import { loadEnv } from 'vite';
import { defineConfig } from 'vitest/config';

// Mirrors PROVIDER_IDS in src/services/news/types.ts (the Node config can't import app code).
type ProviderId = 'newsapi' | 'guardian' | 'nyt';
type ApiKeys = Record<ProviderId, string>;

const withKey = (path: string, key: string) =>
  `${path}${path.includes('?') ? '&' : '?'}api-key=${encodeURIComponent(key)}`;

// Keys are added to the outgoing request in `proxyReq`, never via `rewrite`: Vite logs the
// rewritten req.url on proxy errors, which would print the key to the terminal.
function createApiProxy(keys: ApiKeys): Record<string, ProxyOptions> {
  return {
    '/api/newsapi': {
      target: 'https://newsapi.org',
      changeOrigin: true,
      rewrite: (p) => p.replace(/^\/api\/newsapi/, '/v2'),
      configure: (proxy) => {
        proxy.on('proxyReq', (proxyReq) => {
          proxyReq.setHeader('X-Api-Key', keys.newsapi);
          // NewsAPI's free plan rejects browser-originated requests; match nginx.
          proxyReq.removeHeader('origin');
          proxyReq.removeHeader('referer');
        });
      },
    },
    '/api/guardian': {
      target: 'https://content.guardianapis.com',
      changeOrigin: true,
      rewrite: (p) => p.replace(/^\/api\/guardian/, ''),
      configure: (proxy) => {
        proxy.on('proxyReq', (proxyReq) => {
          proxyReq.path = withKey(proxyReq.path, keys.guardian);
        });
      },
    },
    '/api/nyt': {
      target: 'https://api.nytimes.com',
      changeOrigin: true,
      rewrite: (p) => p.replace(/^\/api\/nyt/, '/svc/search/v2'),
      configure: (proxy) => {
        proxy.on('proxyReq', (proxyReq) => {
          proxyReq.path = withKey(proxyReq.path, keys.nyt);
        });
      },
    },
  };
}

const API_PATH = /^\/api\/(newsapi|guardian|nyt)(?:[/?]|$)/;

function isProviderId(value: string | undefined): value is ProviderId {
  return value === 'newsapi' || value === 'guardian' || value === 'nyt';
}

function sendNotConfigured(res: ServerResponse) {
  res.statusCode = 503;
  res.setHeader('Content-Type', 'application/json');
  res.end(
    JSON.stringify({ status: 'error', code: 'not_configured', message: 'API key not configured' }),
  );
}

// A blank key would only earn an upstream 401 that looks like a bad key. Answer 503
// `not_configured` instead so the UI can say "{Source} isn't configured" (nginx does the same).
function apiKeyGuard(keys: ApiKeys): Plugin {
  const guard: Connect.NextHandleFunction = (req, res, next) => {
    const provider = API_PATH.exec(req.url ?? '')?.[1];
    if (!isProviderId(provider) || keys[provider]) {
      next();
      return;
    }
    sendNotConfigured(res);
  };

  // Middlewares added directly in these hooks run before Vite's internal ones, incl. the proxy.
  return {
    name: 'newsfeed:api-key-guard',
    configureServer(server) {
      server.middlewares.use(guard);
    },
    configurePreviewServer(server) {
      server.middlewares.use(guard);
    },
  };
}

// https://vite.dev/config/ · https://vitest.dev/config/
export default defineConfig(({ mode }) => {
  // Empty prefix: read the non-VITE_ keys here only. They never reach the client bundle.
  const env = loadEnv(mode, process.cwd(), '');
  const keys: ApiKeys = {
    newsapi: env.NEWSAPI_KEY?.trim() ?? '',
    guardian: env.GUARDIAN_API_KEY?.trim() ?? '',
    nyt: env.NYT_API_KEY?.trim() ?? '',
  };
  const apiProxy = createApiProxy(keys);

  return {
    plugins: [
      // Must run before react() so it can generate routeTree.gen.ts and split route chunks.
      tanstackRouter({
        target: 'react',
        autoCodeSplitting: true,
        routesDirectory: './src/routes',
        generatedRouteTree: './src/routeTree.gen.ts',
      }),
      react(),
      tailwindcss(),
      apiKeyGuard(keys),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: { proxy: apiProxy },
    preview: { proxy: apiProxy },
    build: {
      rolldownOptions: {
        output: {
          // Vendor code changes rarely; separate chunks keep it cached across app deploys.
          codeSplitting: {
            groups: [
              { name: 'react', test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/ },
              { name: 'tanstack', test: /node_modules[\\/]@tanstack[\\/]/ },
              { name: 'zod', test: /node_modules[\\/]zod[\\/]/ },
              { name: 'data', test: /node_modules[\\/](axios|date-fns)[\\/]/ },
              {
                name: 'ui',
                test: /node_modules[\\/](radix-ui|@radix-ui|sonner|cn|lucide-react|react-remove-scroll[^\\/]*)[\\/]/,
              },
            ],
          },
        },
      },
    },
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      include: ['src/**/*.test.{ts,tsx}'],
      // Date logic uses local days; fixtures carry UTC timestamps. Same result on every machine.
      env: { TZ: 'UTC' },
    },
  };
});
