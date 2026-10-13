import { getRouteApi } from '@tanstack/react-router';

import { usePreferences } from '@/features/preferences';
import { PROVIDER_IDS } from '@/services/news/types';
import type { ProviderQuery } from '@/services/news/types';

const route = getRouteApi('/');

/** What the personalized feed fetches (from preferences) and shows (from the URL). */
export function useFeedParams() {
  const sources = usePreferences((s) => s.sources);
  const categories = usePreferences((s) => s.categories);
  const authors = usePreferences((s) => s.authors);
  const hintDismissed = usePreferences((s) => s.feedHintDismissed);
  const dismissHint = usePreferences((s) => s.dismissFeedHint);
  const { following } = route.useSearch();
  const navigate = route.useNavigate();

  const query: ProviderQuery = { categories };
  const isPersonalized =
    categories.length > 0 || authors.length > 0 || sources.length < PROVIDER_IDS.length;

  function setOnlyFollowed(onlyFollowed: boolean) {
    void navigate({ search: { following: onlyFollowed || undefined } });
  }

  return {
    query,
    sources,
    categories,
    authors,
    onlyFollowed: following === true,
    setOnlyFollowed,
    // Shown until dismissed, and only while the feed is still the default one.
    showHint: !hintDismissed && !isPersonalized,
    dismissHint,
  };
}
