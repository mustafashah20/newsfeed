import type { QueryClient } from '@tanstack/react-query';
import { createRouter } from '@tanstack/react-router';
import type { RouterHistory } from '@tanstack/react-router';

import { routeTree } from '@/routeTree.gen';

export type RouterContext = {
  queryClient: QueryClient;
};

export function createAppRouter(queryClient: QueryClient, history?: RouterHistory) {
  return createRouter({
    routeTree,
    context: { queryClient },
    history,
    // Back from the reader returns to the same place in the list.
    scrollRestoration: true,
  });
}

// Module augmentation has to be an interface; this registers the router's types app-wide.
declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createAppRouter>;
  }
}
