import { isByFollowedAuthor, splitAuthors } from '@/lib/authors';

import { usePreferences } from '../store';

/** Following authors from an article byline ("A, B" follows both). */
export function useFollowedAuthors() {
  const authors = usePreferences((s) => s.authors);
  const addAuthor = usePreferences((s) => s.addAuthor);
  const removeAuthor = usePreferences((s) => s.removeAuthor);

  function isFollowing(byline: string | null) {
    return isByFollowedAuthor(byline, authors);
  }

  function toggle(byline: string) {
    const names = splitAuthors(byline);
    if (isFollowing(byline)) names.forEach(removeAuthor);
    else names.forEach(addAuthor);
  }

  return { authors, isFollowing, toggle };
}
