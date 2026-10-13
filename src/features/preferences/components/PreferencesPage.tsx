import { RotateCcwIcon } from 'lucide-react';
import { toast } from 'sonner';

import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';

import { usePreferences } from '../store';
import { PreferencesForm } from './PreferencesForm';

export function PreferencesPage() {
  const sources = usePreferences((s) => s.sources);
  const categories = usePreferences((s) => s.categories);
  const authors = usePreferences((s) => s.authors);
  const toggleSource = usePreferences((s) => s.toggleSource);
  const setCategories = usePreferences((s) => s.setCategories);
  const addAuthor = usePreferences((s) => s.addAuthor);
  const removeAuthor = usePreferences((s) => s.removeAuthor);
  const reset = usePreferences((s) => s.reset);

  function handleReset() {
    reset();
    toast('Preferences reset to defaults');
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Preferences"
        description="Choose the sources, categories and authors your feed shows. Changes save automatically on this device."
      >
        <Button variant="outline" className="h-11 px-4" onClick={handleReset}>
          <RotateCcwIcon aria-hidden="true" />
          Reset to defaults
        </Button>
      </PageHeader>
      <PreferencesForm
        sources={sources}
        categories={categories}
        authors={authors}
        onToggleSource={toggleSource}
        onCategoriesChange={setCategories}
        onAddAuthor={addAuthor}
        onRemoveAuthor={removeAuthor}
      />
    </div>
  );
}
