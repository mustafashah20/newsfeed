import type { ReactNode } from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type PreferencesSectionProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export function PreferencesSection({ title, description, children }: PreferencesSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h2 className="font-heading text-lg font-semibold">{title}</h2>
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
