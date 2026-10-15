import { useNavigate } from '@tanstack/react-router';
import { SearchIcon } from 'lucide-react';
import type { SubmitEvent } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type HeaderSearchProps = {
  className?: string;
};

export function HeaderSearch({ className }: HeaderSearchProps) {
  const navigate = useNavigate();

  // Submit-only: the APIs' quotas are too small for as-you-type search.
  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = new FormData(event.currentTarget).get('q');
    const q = typeof value === 'string' ? value.trim() : '';
    void navigate({ to: '/search', search: { q } });
  }

  return (
    // A filled pill: the ring sits on the form, so the borderless input inside shows focus.
    <form
      role="search"
      aria-label="Site search"
      onSubmit={handleSubmit}
      className={cn(
        'flex h-11 min-w-0 items-center rounded-full bg-muted pr-2 has-[input:focus-visible]:ring-3 has-[input:focus-visible]:ring-ring/50',
        className,
      )}
    >
      {/* The magnifier is the submit button, so touch users don't depend on Enter. */}
      <Button
        type="submit"
        variant="ghost"
        size="icon"
        className="size-11 rounded-full text-muted-foreground hover:bg-transparent"
        aria-label="Search"
      >
        <SearchIcon aria-hidden="true" />
      </Button>
      <label htmlFor="header-search" className="sr-only">
        Search news
      </label>
      <Input
        id="header-search"
        name="q"
        type="search"
        placeholder="Search stories and topics"
        className="h-full border-0 bg-transparent px-0 focus-visible:ring-0 md:text-base"
      />
    </form>
  );
}
