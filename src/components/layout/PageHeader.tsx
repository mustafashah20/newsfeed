import type { ReactNode } from 'react';

type PageHeaderProps = {
  title: string;
  description?: string;
  /** Page-level actions, shown beside the title from `sm` up. */
  children?: ReactNode;
};

export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="font-heading text-2xl font-semibold tracking-tight break-words sm:text-3xl">
          {title}
        </h1>
        {description && <p className="mt-1 text-muted-foreground">{description}</p>}
      </div>
      {children && <div className="flex shrink-0 flex-wrap gap-2">{children}</div>}
    </div>
  );
}
