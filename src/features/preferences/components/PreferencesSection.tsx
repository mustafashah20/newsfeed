import { useId } from 'react';
import type { ReactNode } from 'react';

type PreferencesSectionProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export function PreferencesSection({ title, description, children }: PreferencesSectionProps) {
  const id = useId();

  return (
    <section
      aria-labelledby={id}
      className="flex flex-col gap-3 border-t pt-6 first:border-t-0 first:pt-0"
    >
      <div>
        <h3 id={id} className="text-sm font-medium">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
    </section>
  );
}
