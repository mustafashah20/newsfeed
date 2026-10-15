import { useRouter } from '@tanstack/react-router';
import type { ErrorComponentProps } from '@tanstack/react-router';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { PAGE_STACK_CLASS } from './page-styles';
import { PageHeader } from './PageHeader';

// Never show the raw error: it can contain API messages or proxied URLs.
export function RouteError({ reset }: ErrorComponentProps) {
  const router = useRouter();

  function handleRetry() {
    reset();
    void router.invalidate();
  }

  return (
    <div role="alert" className={cn(PAGE_STACK_CLASS, 'items-start')}>
      <PageHeader
        title="Something went wrong"
        description="This page couldn't be shown. Try again."
      />
      <Button onClick={handleRetry} className="h-11 px-4">
        Retry
      </Button>
    </div>
  );
}
