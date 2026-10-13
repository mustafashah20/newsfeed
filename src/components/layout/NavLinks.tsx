import { Link } from '@tanstack/react-router';

import { cn } from '@/lib/utils';

import { NAV_ITEMS } from './nav-items';

type NavLinksProps = {
  className?: string;
  onNavigate?: () => void;
};

export function NavLinks({ className, onNavigate }: NavLinksProps) {
  return (
    <ul className={cn('flex gap-1', className)}>
      {NAV_ITEMS.map(({ to, label, icon: Icon, exact }) => (
        <li key={to}>
          <Link
            to={to}
            activeOptions={{ exact }}
            onClick={onNavigate}
            className="inline-flex min-h-11 w-full items-center gap-2 rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 data-[status=active]:bg-muted data-[status=active]:text-foreground"
          >
            <Icon aria-hidden="true" className="size-4" />
            {label}
          </Link>
        </li>
      ))}
    </ul>
  );
}
