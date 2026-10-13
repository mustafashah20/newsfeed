import { HeadContent, Outlet } from '@tanstack/react-router';

import { AppShell } from './AppShell';

export function RootLayout() {
  return (
    <>
      <HeadContent />
      <AppShell>
        <Outlet />
      </AppShell>
    </>
  );
}
