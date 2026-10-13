import { Link } from '@tanstack/react-router';

import { Button } from '@/components/ui/button';

import { PageHeader } from './PageHeader';

export function NotFound() {
  return (
    <div className="flex flex-col items-start gap-6">
      <PageHeader title="Page not found" description="That page doesn't exist or has moved." />
      <Button asChild className="h-11 px-4">
        <Link to="/">Go to your feed</Link>
      </Button>
    </div>
  );
}
