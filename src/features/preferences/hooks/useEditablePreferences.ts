import { usePreferences } from '../store';
import type { EditablePreferences } from '../store';

/** The saved sources, categories and authors, and how to replace them in one go. */
export function useEditablePreferences() {
  const sources = usePreferences((s) => s.sources);
  const categories = usePreferences((s) => s.categories);
  const authors = usePreferences((s) => s.authors);
  const save = usePreferences((s) => s.save);

  const preferences: EditablePreferences = { sources, categories, authors };
  return { preferences, save };
}
