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
    <form
      role="search"
      aria-label="Site search"
      onSubmit={handleSubmit}
      className={cn('flex min-w-0 gap-2', className)}
    >
      <label htmlFor="header-search" className="sr-only">
        Search news
      </label>
      <Input
        id="header-search"
        name="q"
        type="search"
        placeholder="Search news"
        className="h-11 md:text-base"
      />
      <Button type="submit" size="icon" className="size-11" aria-label="Search">
        <SearchIcon aria-hidden="true" />
      </Button>
    </form>
  );
}
