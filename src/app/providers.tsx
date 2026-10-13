import type { QueryClient } from '@tanstack/react-query';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';

import { Toaster } from '@/components/ui/sonner';

import type { createAppRouter } from './router';

type AppProvidersProps = {
  queryClient: QueryClient;
  router: ReturnType<typeof createAppRouter>;
};

export function AppProviders({ queryClient, router }: AppProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster />
    </QueryClientProvider>
  );
}
