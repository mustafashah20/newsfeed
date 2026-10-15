import { Link, useMatchRoute } from '@tanstack/react-router';
import { NewspaperIcon } from 'lucide-react';

import { HeaderSearch } from './HeaderSearch';

// Just the wordmark (→ feed) and the search bar: Preferences is on the feed, beside the chips,
// and below md the bottom tab bar (MobileNav) replaces the search bar.
export function Header() {
  const matchRoute = useMatchRoute();
  // The search page has its own search bar; a second one in the header is redundant there.
  const isSearchPage = Boolean(matchRoute({ to: '/search' }));

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-1.5 sm:px-6 md:min-h-18 md:gap-8 lg:px-8">
        <Link
          to="/"
          className="inline-flex min-h-11 items-center gap-2.5 rounded-lg font-heading text-2xl font-semibold tracking-tight outline-none focus-visible:ring-3 focus-visible:ring-ring/50 md:text-[1.625rem]"
        >
          <NewspaperIcon
            aria-hidden="true"
            className="hidden size-6.5 md:block"
            strokeWidth={1.8}
          />
          Newsfeed
        </Link>
        {/* Below md the Search tab replaces the bar. */}
        {isSearchPage ? null : (
          <HeaderSearch className="ml-auto hidden min-w-0 flex-1 md:flex md:max-w-105" />
        )}
      </div>
    </header>
  );
}
