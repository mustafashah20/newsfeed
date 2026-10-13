import { createRootRouteWithContext } from '@tanstack/react-router';

import type { RouterContext } from '@/app/router';
import { NotFound } from '@/components/layout/NotFound';
import { RootLayout } from '@/components/layout/RootLayout';
import { RouteError } from '@/components/layout/RouteError';
import { pageTitle } from '@/lib/page-title';

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({ meta: [{ title: pageTitle() }] }),
  component: RootLayout,
  errorComponent: RouteError,
  notFoundComponent: NotFound,
});
