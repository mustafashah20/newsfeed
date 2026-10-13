import { createMemoryHistory } from '@tanstack/react-router';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { AppProviders } from '@/app/providers';
import { createQueryClient } from '@/app/query-client';
import { createAppRouter } from '@/app/router';

/** Renders the whole app (providers, router, shell) at `path`, with a fresh cache per test. */
export function renderApp(path = '/') {
  const queryClient = createQueryClient();
  const router = createAppRouter(queryClient, createMemoryHistory({ initialEntries: [path] }));
  const user = userEvent.setup();

  render(<AppProviders queryClient={queryClient} router={router} />);

  return { user, router, queryClient };
}
