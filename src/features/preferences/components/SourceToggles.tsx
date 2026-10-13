import { useId } from 'react';

import { Switch } from '@/components/ui/switch';
import { providerList } from '@/services/news/registry';
import type { ProviderId } from '@/services/news/types';

type SourceTogglesProps = {
  value: readonly ProviderId[];
  onToggle: (source: ProviderId) => void;
};

export function SourceToggles({ value, onToggle }: SourceTogglesProps) {
  const id = useId();

  return (
    <ul className="flex flex-col divide-y">
      {providerList.map(({ id: provider, label }) => {
        const checked = value.includes(provider);
        const inputId = `${id}-${provider}`;
        return (
          <li key={provider} className="flex min-h-14 items-center justify-between gap-4">
            <label htmlFor={inputId} className="flex min-h-11 flex-1 items-center">
              {label}
            </label>
            <Switch
              id={inputId}
              checked={checked}
              // At least one source stays selected.
              disabled={checked && value.length === 1}
              onCheckedChange={() => {
                onToggle(provider);
              }}
            />
          </li>
        );
      })}
    </ul>
  );
}
