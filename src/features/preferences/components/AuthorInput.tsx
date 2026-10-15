import { PlusIcon, XIcon } from 'lucide-react';
import { useId, useState } from 'react';
import type { SubmitEvent } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type AuthorInputProps = {
  authors: readonly string[];
  /** Returns false when the name is empty or already in the list. */
  onAdd: (name: string) => boolean;
  onRemove: (name: string) => void;
};

export function AuthorInput({ authors, onAdd, onRemove }: AuthorInputProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const value = new FormData(form).get('author');
    const name = typeof value === 'string' ? value.trim() : '';
    if (!name) {
      setError('Enter an author’s name.');
      return;
    }
    if (!onAdd(name)) {
      setError(`${name} is already in your authors.`);
      return;
    }
    setError(null);
    form.reset();
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-2">
        <label htmlFor={`${id}-input`} className="text-sm font-medium">
          Author name
        </label>
        <div className="flex gap-2">
          <Input
            id={`${id}-input`}
            name="author"
            autoComplete="off"
            placeholder="e.g. Peter Bradshaw"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            className="h-11 md:text-base"
          />
          <Button type="submit" className="h-11 shrink-0 px-4">
            <PlusIcon aria-hidden="true" />
            Add
          </Button>
        </div>
        {error && (
          <p id={errorId} role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
      </form>

      {authors.length === 0 ? (
        <p className="text-sm text-muted-foreground">No authors added yet.</p>
      ) : (
        <ul aria-label="Preferred authors" className="flex flex-wrap gap-2">
          {authors.map((author) => (
            <li
              key={author}
              className="flex min-w-0 items-center rounded-full border bg-secondary pl-3 text-sm text-secondary-foreground"
            >
              <span className="min-w-0 truncate">{author}</span>
              <Button
                variant="ghost"
                size="icon"
                className="size-11 shrink-0 rounded-full"
                aria-label={`Remove ${author}`}
                onClick={() => {
                  onRemove(author);
                }}
              >
                <XIcon aria-hidden="true" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
