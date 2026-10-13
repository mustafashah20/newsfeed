import { Checkbox } from '@/components/ui/checkbox';
import { providerList } from '@/services/news/registry';
import { PROVIDER_IDS } from '@/services/news/types';
import type { ProviderId } from '@/services/news/types';

type SourceMultiSelectProps = {
  idPrefix: string;
  value: readonly ProviderId[];
  onChange: (sources: ProviderId[]) => void;
};

export function SourceMultiSelect({ idPrefix, value, onChange }: SourceMultiSelectProps) {
  function handleToggle(provider: ProviderId, checked: boolean) {
    const next = checked ? [...value, provider] : value.filter((id) => id !== provider);
    onChange(PROVIDER_IDS.filter((id) => next.includes(id)));
  }

  return (
    <fieldset className="flex flex-col">
      <legend className="mb-1 text-sm font-medium">Sources</legend>
      {providerList.map(({ id, label }) => {
        const checked = value.includes(id);
        const inputId = `${idPrefix}-${id}`;
        return (
          <div key={id} className="flex min-h-11 items-center gap-3">
            <Checkbox
              id={inputId}
              checked={checked}
              // At least one source stays selected.
              disabled={checked && value.length === 1}
              onCheckedChange={(state) => {
                handleToggle(id, state === true);
              }}
            />
            <label htmlFor={inputId} className="flex min-h-11 flex-1 items-center text-sm">
              {label}
            </label>
          </div>
        );
      })}
    </fieldset>
  );
}
