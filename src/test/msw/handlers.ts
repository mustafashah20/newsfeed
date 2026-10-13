import type { RequestHandler } from 'msw';

// Default handlers for every test. Provider handlers serving the fixtures arrive with the
// adapters (milestone 5); tests add one-off responses with `server.use(...)`.
export const handlers: RequestHandler[] = [];
