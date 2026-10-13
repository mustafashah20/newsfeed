import { CheckIcon, PlusIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';

type FollowAuthorButtonProps = {
  author: string;
  isFollowing: boolean;
  onToggle: () => void;
};

/** A toggle: "Follow" / "Following". Doubles as the card's "Following" badge. */
export function FollowAuthorButton({ author, isFollowing, onToggle }: FollowAuthorButtonProps) {
  const label = isFollowing ? 'Following' : 'Follow';

  return (
    <Button
      variant={isFollowing ? 'secondary' : 'outline'}
      aria-pressed={isFollowing}
      // An explicit label: a visually hidden " {author}" span loses its leading space in the
      // computed name ("FollowPeter"). It starts with the visible text, as WCAG asks.
      aria-label={`${label} ${author}`}
      onClick={onToggle}
      className="h-11 px-3"
    >
      {isFollowing ? <CheckIcon aria-hidden="true" /> : <PlusIcon aria-hidden="true" />}
      {label}
    </Button>
  );
}
