import { Link } from '@tanstack/react-router';

import { cn } from '@/lib/utils';

import { NAV_ITEMS } from './nav-items';

type MobileNavProps = {
  className?: string;
};

/** Bottom tab bar below `md`. Sticky as the shell's last child, so it never covers content. */
export function MobileNav({ className }: MobileNavProps) {
  return (
    <nav
      aria-label="Tabs"
      className={cn(
        'sticky bottom-0 z-40 border-t bg-background pb-[env(safe-area-inset-bottom)]',
        className,
      )}
    >
      <ul className="grid grid-cols-2 px-3 pt-1.5 pb-3.5">
        {NAV_ITEMS.map(({ to, label, icon: Icon, exact }) => (
          <li key={to}>
            <Link
              to={to}
              activeOptions={{ exact }}
              className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg text-xs text-muted-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50 data-[status=active]:font-semibold data-[status=active]:text-foreground"
            >
              <Icon aria-hidden="true" className="size-5.5" strokeWidth={1.8} />
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
