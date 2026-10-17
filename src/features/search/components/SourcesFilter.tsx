import { useState } from 'react';

import { sameList } from '@/lib/list-equality';
import { providerList, providers } from '@/services/news/registry';
import { PROVIDER_IDS } from '@/services/news/types';
import type { ProviderId } from '@/services/news/types';

import { FilterCheckboxRow } from './FilterCheckboxRow';
import { FilterPopover } from './FilterPopover';

type SourcesFilterProps = {
  /** Applied sources; never empty. */
  value: readonly ProviderId[];
  onChange: (sources: ProviderId[]) => void;
};

/** "The Guardian", "The Guardian +1"; the default label when every source is on. */
function sourcesLabel(value: readonly ProviderId[]) {
  const [first] = value;
  if (value.length === PROVIDER_IDS.length || !first) return 'Sources';
  const name = providers[first].label;
  return value.length > 1 ? `${name} +${value.length - 1}` : name;
}

/** The desktop sources filter, applied with "Apply" like the category filter. */
export function SourcesFilter({ value, onChange }: SourcesFilterProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<ProviderId[]>([...value]);
  const isFiltered = value.length < PROVIDER_IDS.length;
  const description = isFiltered
    ? value.map((id) => providers[id].label).join(', ')
    : 'All sources';

  function handleOpenChange(next: boolean) {
    // Each opening starts from what's applied, not from a discarded draft.
    if (next) setDraft([...value]);
    setOpen(next);
  }

  function handleToggle(provider: ProviderId, checked: boolean) {
    const next = checked ? [...draft, provider] : draft.filter((id) => id !== provider);
    setDraft(PROVIDER_IDS.filter((id) => next.includes(id)));
  }

  function handleApply() {
    if (!sameList(draft, value)) onChange(draft);
    setOpen(false);
  }

  return (
    <FilterPopover
      label={sourcesLabel(value)}
      ariaLabel={`Sources: ${description}`}
      active={isFiltered}
      title="Source"
      open={open}
      onOpenChange={handleOpenChange}
      onReset={() => {
        setDraft([...PROVIDER_IDS]);
      }}
      onApply={handleApply}
    >
      {providerList.map(({ id, label }) => {
        const checked = draft.includes(id);
        return (
          <FilterCheckboxRow
            key={id}
            label={label}
            checked={checked}
            // At least one source stays selected.
            disabled={checked && draft.length === 1}
            onCheckedChange={(next) => {
              handleToggle(id, next);
            }}
          />
        );
      })}
    </FilterPopover>
  );
}
