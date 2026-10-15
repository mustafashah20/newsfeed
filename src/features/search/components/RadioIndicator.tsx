import { cn } from '@/lib/utils';

type RadioIndicatorProps = {
  checked: boolean;
};

// Decorative: the row itself carries the state (aria-pressed), so screen readers don't need it.
// Its row is a `group`, so hovering the row darkens an empty circle.
export function RadioIndicator({ checked }: RadioIndicatorProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'size-5 shrink-0 rounded-full border-[1.5px] border-muted-foreground transition-colors group-hover:border-foreground',
        checked && 'border-[6px] border-primary group-hover:border-primary',
      )}
    />
  );
}
