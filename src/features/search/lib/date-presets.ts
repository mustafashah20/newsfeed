import { format, parseISO } from 'date-fns';

import { daysAgo } from '@/lib/date';

// The APIs filter by whole days, so "Past 24 hours" starts at yesterday's date.
export const DATE_PRESETS = [
  { id: 'any', label: 'Any time', days: null },
  { id: '24h', label: 'Past 24 hours', days: 1 },
  { id: 'week', label: 'Past week', days: 7 },
  { id: 'month', label: 'Past month', days: 30 },
] as const;

export type DatePresetId = (typeof DATE_PRESETS)[number]['id'] | 'custom';

export type DayRange = { from?: string; to?: string };

/** The from/to a preset stands for, as of `now`. */
export function presetRange(id: Exclude<DatePresetId, 'custom'>, now = new Date()): DayRange {
  const preset = DATE_PRESETS.find((p) => p.id === id);
  if (!preset?.days) return {};
  return { from: daysAgo(preset.days, now) };
}

/** Which preset a URL's range matches today; anything else is a custom range. */
export function detectPreset({ from, to }: DayRange, now = new Date()): DatePresetId {
  if (!from && !to) return 'any';
  if (to) return 'custom';
  const match = DATE_PRESETS.find((p) => p.days !== null && from === daysAgo(p.days, now));
  return match?.id ?? 'custom';
}

const day = (value: string) => format(parseISO(value), 'd MMM yyyy');

/** A short label for chips: "Past week", "1 Oct 2026 – 14 Oct 2026", "From 1 Oct 2026". */
export function describeRange(range: DayRange, now = new Date()): string | null {
  const preset = detectPreset(range, now);
  if (preset === 'any') return null;
  if (preset !== 'custom') return DATE_PRESETS.find((p) => p.id === preset)?.label ?? null;
  if (range.from && range.to) return `${day(range.from)} – ${day(range.to)}`;
  if (range.from) return `From ${day(range.from)}`;
  return range.to ? `Until ${day(range.to)}` : null;
}
