import { SlidersHorizontalIcon, XIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

type FiltersSheetProps = {
  activeCount: number;
  className?: string;
  /** The filters panel. */
  children: ReactNode;
};

/** Below `lg` the filters live in a Sheet instead of the sidebar. */
export function FiltersSheet({ activeCount, className, children }: FiltersSheetProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className={cn('h-11 px-4', className)}>
          <SlidersHorizontalIcon aria-hidden="true" />
          Filters
          {activeCount > 0 && <span className="text-muted-foreground">({activeCount})</span>}
        </Button>
      </SheetTrigger>
      {/* Own close button: the generated one is smaller than the 44 px touch target. */}
      <SheetContent side="left" showCloseButton={false} className="gap-6 overflow-y-auto p-4">
        <SheetHeader className="flex-row items-center justify-between p-0">
          <SheetTitle>Filters</SheetTitle>
          <SheetClose asChild>
            <Button variant="ghost" size="icon" className="size-11" aria-label="Close filters">
              <XIcon aria-hidden="true" />
            </Button>
          </SheetClose>
        </SheetHeader>
        <SheetDescription className="sr-only">
          Narrow the results by date, category and source.
        </SheetDescription>
        {children}
        <SheetFooter className="mt-auto p-0">
          <SheetClose asChild>
            <Button className="h-11">Show results</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
