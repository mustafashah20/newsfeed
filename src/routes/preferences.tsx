import { createFileRoute } from '@tanstack/react-router';

import { PreferencesPage } from '@/features/preferences';
import { pageTitle } from '@/lib/page-title';

export const Route = createFileRoute('/preferences')({
  head: () => ({ meta: [{ title: pageTitle('Preferences') }] }),
  component: PreferencesPage,
});
