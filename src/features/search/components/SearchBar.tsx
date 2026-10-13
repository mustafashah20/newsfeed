import { SearchIcon } from 'lucide-react';
import type { SubmitEvent } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type SearchBarProps = {
  /** The current keyword. Give the component a `key` of it so the field resets when it changes. */
  defaultValue: string;
  onSearch: (q: string) => void;
};

// Submit-only, never as-you-type: every search costs requests against tiny quotas.
export function SearchBar({ defaultValue, onSearch }: SearchBarProps) {
  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = new FormData(event.currentTarget).get('q');
    onSearch(typeof value === 'string' ? value.trim() : '');
  }

  return (
    <form role="search" aria-label="Search articles" onSubmit={handleSubmit} className="flex gap-2">
      <label htmlFor="search-keyword" className="sr-only">
        Keyword
      </label>
      <Input
        id="search-keyword"
        name="q"
        type="search"
        defaultValue={defaultValue}
        placeholder="Search by keyword"
        className="h-11 md:text-base"
      />
      <Button type="submit" className="h-11 shrink-0 px-4">
        <SearchIcon aria-hidden="true" />
        Search
      </Button>
    </form>
  );
}
