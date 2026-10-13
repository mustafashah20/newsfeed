import type { Category } from '@/services/news/categories';
import { NEWSAPI_MAX_CATEGORIES } from '@/services/news/providers/newsapi/client';
import type { ProviderId } from '@/services/news/types';

import { AuthorInput } from './AuthorInput';
import { CategoryPicker } from './CategoryPicker';
import { PreferencesSection } from './PreferencesSection';
import { SourceToggles } from './SourceToggles';

type PreferencesFormProps = {
  sources: readonly ProviderId[];
  categories: readonly Category[];
  authors: readonly string[];
  onToggleSource: (source: ProviderId) => void;
  onCategoriesChange: (categories: Category[]) => void;
  onAddAuthor: (name: string) => boolean;
  onRemoveAuthor: (name: string) => void;
};

export function PreferencesForm(props: PreferencesFormProps) {
  const newsapiCapped =
    props.sources.includes('newsapi') && props.categories.length > NEWSAPI_MAX_CATEGORIES;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <PreferencesSection title="Sources" description="Where your feed’s articles come from.">
        <SourceToggles value={props.sources} onToggle={props.onToggleSource} />
      </PreferencesSection>

      <PreferencesSection
        title="Categories"
        description="Leave all unchecked to see every category."
      >
        <CategoryPicker value={props.categories} onChange={props.onCategoriesChange} />
        {newsapiCapped && (
          <p className="mt-3 text-sm text-muted-foreground">
            NewsAPI uses your first {NEWSAPI_MAX_CATEGORIES} categories.
          </p>
        )}
      </PreferencesSection>

      <div className="lg:col-span-2">
        <PreferencesSection
          title="Authors"
          description="Articles by authors you follow are marked and shown first in your feed."
        >
          <AuthorInput
            authors={props.authors}
            onAdd={props.onAddAuthor}
            onRemove={props.onRemoveAuthor}
          />
        </PreferencesSection>
      </div>
    </div>
  );
}
