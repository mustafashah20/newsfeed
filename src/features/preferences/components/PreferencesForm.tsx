import { CategoryPicker } from '@/components/common/CategoryPicker';
import type { Category } from '@/services/news/categories';
import { NEWSAPI_MAX_CATEGORIES } from '@/services/news/providers/newsapi/client';
import type { ProviderId } from '@/services/news/types';

import { AuthorInput } from './AuthorInput';
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
    <div className="flex flex-col gap-6">
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

      <PreferencesSection
        title="Authors"
        description="Articles by these authors are shown first in your feed."
      >
        <AuthorInput
          authors={props.authors}
          onAdd={props.onAddAuthor}
          onRemove={props.onRemoveAuthor}
        />
      </PreferencesSection>
    </div>
  );
}
