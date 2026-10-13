import { NewspaperIcon } from 'lucide-react';
import { useState } from 'react';

import { cn } from '@/lib/utils';

type ArticleImageProps = {
  src: string | null;
  className?: string;
  /** The page's main image (reader hero): load it right away instead of lazily. */
  priority?: boolean;
};

// Decorative (alt=""): the title right below says what the article is.
export function ArticleImage({ src, className, priority = false }: ArticleImageProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={cn(
          'flex aspect-video w-full items-center justify-center bg-muted text-muted-foreground',
          className,
        )}
      >
        <NewspaperIcon aria-hidden="true" className="size-8" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt=""
      width={640}
      height={360}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => {
        setFailed(true);
      }}
      className={cn('aspect-video w-full bg-muted object-cover', className)}
    />
  );
}
