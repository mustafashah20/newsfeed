import { SearchIcon, XIcon } from 'lucide-react';
import { useRef, useState } from 'react';
import type { SubmitEvent } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type SearchBarProps = {
  /** The current keyword. Give the component a `key` of it so the field resets when it changes. */
  defaultValue: string;
  onSearch: (q: string) => void;
  className?: string;
};

// Submit-only, never as-you-type: every search costs requests against tiny quotas. Typing (and
// the clear button) only edits the field; nothing is fetched until Search is pressed.
export function SearchBar({ defaultValue, onSearch, className }: SearchBarProps) {
  const [value, setValue] = useState(defaultValue);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    onSearch(value.trim());
  }

  function handleClear() {
    setValue('');
    inputRef.current?.focus();
  }

  return (
    // One rounded field holding the icon, the input, the clear button and the Search button.
    // The field shows focus as a whole, since the input itself has no border.
    <form
      role="search"
      aria-label="Search articles"
      onSubmit={handleSubmit}
      className={cn(
        'flex h-13 min-w-0 items-center gap-2 rounded-full border border-field bg-background pr-1 pl-4 has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-ring sm:h-15 sm:gap-2.5 sm:pr-1.5 sm:pl-5',
        className,
      )}
    >
      <SearchIcon aria-hidden="true" className="size-5 shrink-0 text-muted-foreground" />
      <label htmlFor="search-keyword" className="sr-only">
        Keyword
      </label>
      <Input
        ref={inputRef}
        id="search-keyword"
        name="q"
        type="search"
        value={value}
        onChange={(event) => {
          setValue(event.target.value);
        }}
        placeholder="Search by keyword"
        className="h-full min-w-0 flex-1 rounded-none border-0 bg-transparent px-0 text-base shadow-none focus-visible:ring-0 sm:text-[1.0625rem] md:text-[1.0625rem] dark:bg-transparent [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Clear search"
          onClick={handleClear}
          className="size-11 shrink-0 rounded-full text-muted-foreground focus-visible:ring-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <XIcon aria-hidden="true" className="size-4.5" />
        </Button>
      )}
      <Button
        type="submit"
        className="h-11 shrink-0 rounded-full px-5 text-[0.9375rem] font-semibold focus-visible:ring-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:h-12 sm:px-6"
      >
        Search
      </Button>
    </form>
  );
}
