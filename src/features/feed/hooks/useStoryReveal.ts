import { useState } from 'react';

import { FIRST_REVEAL, REVEAL_STEP } from '../lib/stories';

type StoryRevealOptions = {
  /** Stories loaded so far (after the chip filter). */
  total: number;
  hasMore: boolean;
  onLoadMore: () => void;
  /** The reveal starts over when this changes (e.g. another chip). */
  resetKey: string;
};

/**
 * "Show more stories": reveals stories already loaded, and fetches the next page once the
 * reveal reaches the end of them.
 */
export function useStoryReveal({ total, hasMore, onLoadMore, resetKey }: StoryRevealOptions) {
  // Reset by comparing a key during render instead of syncing state in an effect.
  const [reveal, setReveal] = useState({ key: resetKey, count: FIRST_REVEAL });
  const count = reveal.key === resetKey ? reveal.count : FIRST_REVEAL;
  const shown = Math.min(count, total);

  function showMore() {
    const next = count + REVEAL_STEP;
    setReveal({ key: resetKey, count: next });
    if (next >= total && hasMore) onLoadMore();
  }

  return { shown, total, canShowMore: shown < total || hasMore, showMore };
}
