import type { ReactNode } from 'react';

import { PAGE_DESCRIPTION_CLASS, PAGE_TITLE_CLASS } from './page-styles';

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
        <h1 className={PAGE_TITLE_CLASS}>{title}</h1>
        {description && <p className={PAGE_DESCRIPTION_CLASS}>{description}</p>}
      </div>
      {children && <div className="flex shrink-0 flex-wrap gap-2">{children}</div>}
    </div>
  );
}
