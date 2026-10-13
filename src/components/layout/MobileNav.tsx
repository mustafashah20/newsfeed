import { MenuIcon, XIcon } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

import { NavLinks } from './NavLinks';

type MobileNavProps = {
  className?: string;
};

export function MobileNav({ className }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn('size-11', className)}
          aria-label="Open menu"
        >
          <MenuIcon aria-hidden="true" />
        </Button>
      </SheetTrigger>
      {/* Own close button: the generated one is smaller than the 44 px touch target. */}
      <SheetContent side="right" showCloseButton={false} className="p-4">
        <SheetHeader className="flex-row items-center justify-between p-0">
          <SheetTitle>Menu</SheetTitle>
          <SheetClose asChild>
            <Button variant="ghost" size="icon" className="size-11" aria-label="Close menu">
              <XIcon aria-hidden="true" />
            </Button>
          </SheetClose>
        </SheetHeader>
        <SheetDescription className="sr-only">Site navigation</SheetDescription>
        <nav aria-label="Mobile">
          <NavLinks
            className="flex-col"
            onNavigate={() => {
              setOpen(false);
            }}
          />
        </nav>
      </SheetContent>
    </Sheet>
  );
}
