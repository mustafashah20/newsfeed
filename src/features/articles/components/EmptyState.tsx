import { SearchXIcon } from 'lucide-react';
import type { ReactNode } from 'react';

type EmptyStateProps = {
  title: string;
  description?: string;
  /** Actions such as "Clear filters". */
  children?: ReactNode;
};

export function EmptyState({ title, description, children }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed px-4 py-12 text-center">
      <SearchXIcon aria-hidden="true" className="size-8 text-muted-foreground" />
      <h2 className="font-heading text-lg font-semibold">{title}</h2>
      {description && <p className="max-w-prose text-muted-foreground">{description}</p>}
      {children && <div className="flex flex-wrap justify-center gap-2">{children}</div>}
    </div>
  );
}
