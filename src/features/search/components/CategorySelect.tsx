import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CATEGORIES, categoryLabel } from '@/services/news/categories';
import type { Category } from '@/services/news/categories';

// Radix Select can't use '' as a value.
const ALL = 'all';

type CategorySelectProps = {
  id: string;
  value?: Category;
  onChange: (category: Category | undefined) => void;
};

export function CategorySelect({ id, value, onChange }: CategorySelectProps) {
  function handleValueChange(next: string) {
    onChange(CATEGORIES.find((c) => c === next));
  }

  return (
    <Select value={value ?? ALL} onValueChange={handleValueChange}>
      <SelectTrigger id={id} className="w-full text-base data-[size=default]:h-11">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>All categories</SelectItem>
        {CATEGORIES.map((category) => (
          <SelectItem key={category} value={category}>
            {categoryLabel(category)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
