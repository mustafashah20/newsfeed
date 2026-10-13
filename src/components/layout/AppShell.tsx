import type { ReactNode } from 'react';

import { Header } from './Header';

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-background focus:px-4 focus:py-3 focus:ring-3 focus:ring-ring/50"
      >
        Skip to content
      </a>
      <Header />
      <main
        id="main"
        tabIndex={-1}
        className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 outline-none sm:px-6 lg:px-8"
      >
        {children}
      </main>
    </div>
  );
}
