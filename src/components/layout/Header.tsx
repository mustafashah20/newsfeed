import { Link } from '@tanstack/react-router';
import { NewspaperIcon } from 'lucide-react';

import { HeaderSearch } from './HeaderSearch';
import { MobileNav } from './MobileNav';
import { NavLinks } from './NavLinks';

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="inline-flex min-h-11 items-center gap-2 rounded-lg font-heading text-lg font-semibold tracking-tight outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <NewspaperIcon aria-hidden="true" className="size-5" />
          Newsfeed
        </Link>
        <nav aria-label="Main" className="hidden md:block">
          <NavLinks />
        </nav>
        <HeaderSearch className="order-last w-full md:order-none md:ml-auto md:w-auto md:max-w-sm md:flex-1" />
        <MobileNav className="ml-auto md:hidden" />
      </div>
    </header>
  );
}
