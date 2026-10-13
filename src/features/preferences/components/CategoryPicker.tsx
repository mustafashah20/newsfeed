import { useId } from 'react';

import { Checkbox } from '@/components/ui/checkbox';
import { CATEGORIES, categoryLabel } from '@/services/news/categories';
import type { Category } from '@/services/news/categories';

type CategoryPickerProps = {
  value: readonly Category[];
  onChange: (categories: Category[]) => void;
};

/** None checked = all categories. */
export function CategoryPicker({ value, onChange }: CategoryPickerProps) {
  const id = useId();

  function handleToggle(category: Category, checked: boolean) {
    onChange(checked ? [...value, category] : value.filter((c) => c !== category));
  }

  return (
    <ul className="grid grid-cols-1 gap-x-6 sm:grid-cols-2">
      {CATEGORIES.map((category) => {
        const inputId = `${id}-${category}`;
        return (
          <li key={category} className="flex min-h-11 items-center gap-3">
            <Checkbox
              id={inputId}
              checked={value.includes(category)}
              onCheckedChange={(state) => {
                handleToggle(category, state === true);
              }}
            />
            <label htmlFor={inputId} className="flex min-h-11 flex-1 items-center">
              {categoryLabel(category)}
            </label>
          </li>
        );
      })}
    </ul>
  );
}
