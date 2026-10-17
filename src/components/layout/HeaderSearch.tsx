import { Link } from '@tanstack/react-router';
import { SearchIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type HeaderSearchProps = {
  className?: string;
};

// A button to the search page, which has the real search bar and filters. It's deliberately not
// a field: a typeable one here left it unclear whether the icon or Enter starts a search.
export function HeaderSearch({ className }: HeaderSearchProps) {
  return (
    <Button
      asChild
      variant="outline"
      className={cn('h-11 rounded-full px-5 text-[0.9375rem] font-semibold', className)}
    >
      <Link to="/search" search={{ q: '' }}>
        <SearchIcon aria-hidden="true" />
        Search
      </Link>
    </Button>
  );
}
