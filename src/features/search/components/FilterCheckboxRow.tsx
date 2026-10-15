import { useId } from 'react';

import { Checkbox } from '@/components/ui/checkbox';

type FilterCheckboxRowProps = {
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
};

/** A 44px option row in a filter popover: the whole row toggles its checkbox. */
export function FilterCheckboxRow({
  label,
  checked,
  onCheckedChange,
  disabled = false,
}: FilterCheckboxRowProps) {
  const id = useId();

  return (
    <label
      htmlFor={id}
      className="flex h-11 cursor-pointer items-center gap-3 rounded-lg px-3 text-[0.9375rem] text-foreground transition-colors duration-150 hover:bg-muted has-disabled:cursor-not-allowed has-disabled:hover:bg-transparent"
    >
      <Checkbox
        id={id}
        checked={checked}
        disabled={disabled}
        onCheckedChange={(state) => {
          onCheckedChange(state === true);
        }}
        className="size-5 rounded-[5px] border-[1.5px] border-muted-foreground [&_svg]:stroke-[3]"
      />
      {label}
    </label>
  );
}
