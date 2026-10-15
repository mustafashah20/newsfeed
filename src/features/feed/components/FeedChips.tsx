import { Button } from '@/components/ui/button';

import type { FeedFilter } from '../feed-params';

export type FeedChip = { value: FeedFilter | undefined; label: string };

type FeedChipsProps = {
  chips: readonly FeedChip[];
  value: FeedFilter | undefined;
  onChange: (value: FeedFilter | undefined) => void;
};

export function FeedChips({ chips, value, onChange }: FeedChipsProps) {
  return (
    // Scrolls sideways below md; wraps from md up.
    <div
      role="group"
      aria-label="Filter stories"
      className="flex min-w-0 flex-1 scrollbar-none gap-2 overflow-x-auto md:flex-wrap md:overflow-visible"
    >
      {chips.map((chip) => {
        const pressed = chip.value === value;
        return (
          <Button
            key={chip.value ?? 'all'}
            type="button"
            variant={pressed ? 'default' : 'outline'}
            aria-pressed={pressed}
            onClick={() => {
              onChange(chip.value);
            }}
            className="h-11 shrink-0 rounded-full border-input px-4 text-sm aria-pressed:border-foreground"
          >
            {chip.label}
          </Button>
        );
      })}
    </div>
  );
}
