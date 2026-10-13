import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Vitest globals are off, so RTL can't register its own auto-cleanup.
afterEach(() => {
  cleanup();
});

// jsdom doesn't implement these; the router's scroll restoration and Sonner call them.
window.scrollTo = () => undefined;
window.matchMedia = (query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: () => undefined,
  removeListener: () => undefined,
  addEventListener: () => undefined,
  removeEventListener: () => undefined,
  dispatchEvent: () => false,
});
