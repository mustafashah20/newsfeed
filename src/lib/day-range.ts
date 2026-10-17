import { endOfDay, isAfter, isBefore, parseISO, startOfDay, subDays } from 'date-fns';

import { toDayString } from './date-format';

// Date filters work in whole local days, as `yyyy-MM-dd` strings.

/** Today minus `days`, as `yyyy-MM-dd` in local time. */
export function daysAgo(days: number, now = new Date()) {
  return toDayString(subDays(now, days));
}

/** The later of two `yyyy-MM-dd` days (they compare correctly as strings). */
export function laterDay(a: string, b: string) {
  return a > b ? a : b;
}

/** Whether an ISO timestamp falls within the inclusive `yyyy-MM-dd` range (local days). */
export function isWithinDays(iso: string, from?: string, to?: string) {
  const date = parseISO(iso);
  if (from && isBefore(date, startOfDay(parseISO(from)))) return false;
  if (to && isAfter(date, endOfDay(parseISO(to)))) return false;
  return true;
}
