import { useState } from 'react';

import { sameList } from '@/lib/array';
import { CATEGORIES, categoryLabel } from '@/services/news/categories';
import type { Category } from '@/services/news/categories';
import { NEWSAPI_MAX_CATEGORIES } from '@/services/news/providers/newsapi/client';
import type { ProviderId } from '@/services/news/types';

import { isNewsapiCategoryCapped } from '../search-params';
import { FilterCheckboxRow } from './FilterCheckboxRow';
import { FilterPopover } from './FilterPopover';

type CategoryFilterProps = {
  /** Applied categories; empty = all. */
  value: readonly Category[];
  onChange: (categories: Category[]) => void;
  /** The applied sources, for the NewsAPI limit note. */
  sources: readonly ProviderId[];
};

/** "Category", "Science", "Science +2". */
function categoriesLabel(value: readonly Category[]) {
  const [first] = value;
  if (!first) return 'Category';
  const name = categoryLabel(first);
  return value.length > 1 ? `${name} +${value.length - 1}` : name;
}

/** The desktop category filter: any number of categories, applied together with "Apply". */
export function CategoryFilter({ value, onChange, sources }: CategoryFilterProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Category[]>([...value]);
  const description = value.length > 0 ? value.map(categoryLabel).join(', ') : 'All categories';

  function handleOpenChange(next: boolean) {
    // Each opening starts from what's applied, not from a discarded draft.
    if (next) setDraft([...value]);
    setOpen(next);
  }

  function handleToggle(category: Category, checked: boolean) {
    const next = checked ? [...draft, category] : draft.filter((c) => c !== category);
    setDraft(CATEGORIES.filter((c) => next.includes(c)));
  }

  function handleApply() {
    if (!sameList(draft, value)) onChange(draft);
    setOpen(false);
  }

  return (
    <FilterPopover
      label={categoriesLabel(value)}
      ariaLabel={`Categories: ${description}`}
      active={value.length > 0}
      title="Category"
      open={open}
      onOpenChange={handleOpenChange}
      onReset={() => {
        setDraft([]);
      }}
      onApply={handleApply}
      note={
        isNewsapiCategoryCapped({ categories: draft, sources: [...sources] })
          ? `NewsAPI uses your first ${NEWSAPI_MAX_CATEGORIES} categories.`
          : undefined
      }
    >
      {CATEGORIES.map((category) => (
        <FilterCheckboxRow
          key={category}
          label={categoryLabel(category)}
          checked={draft.includes(category)}
          onCheckedChange={(checked) => {
            handleToggle(category, checked);
          }}
        />
      ))}
    </FilterPopover>
  );
}
