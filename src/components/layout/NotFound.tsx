import { Link } from '@tanstack/react-router';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { PAGE_STACK_CLASS } from './page-styles';
import { PageHeader } from './PageHeader';

export function NotFound() {
  return (
    <div className={cn(PAGE_STACK_CLASS, 'items-start')}>
      <PageHeader title="Page not found" description="That page doesn't exist or has moved." />
      <Button asChild className="h-11 px-4">
        <Link to="/">Go to your feed</Link>
      </Button>
    </div>
  );
}
