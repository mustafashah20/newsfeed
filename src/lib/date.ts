import {
  differenceInSeconds,
  endOfDay,
  format,
  formatDistanceStrict,
  isAfter,
  isBefore,
  isValid,
  parseISO,
  startOfDay,
  subDays,
} from 'date-fns';

/** "3 hours ago", "2 days ago"; "just now" for the first minute (and for clock skew). */
export function timeAgo(iso: string, now = new Date()) {
  const date = parseISO(iso);
  if (differenceInSeconds(now, date) < 60) return 'just now';
  return formatDistanceStrict(date, now, { addSuffix: true });
}

/** "13 Oct 2026, 14:15" for tooltips and screen readers. */
export function formatFullDate(iso: string) {
  return format(parseISO(iso), 'd MMM yyyy, HH:mm');
}

/** An ISO 8601 timestamp normalized to UTC (`…Z`), or null if it doesn't parse. */
export function toIsoDateTime(value: string | null | undefined): string | null {
  if (!value) return null;
  const date = parseISO(value);
  return isValid(date) ? date.toISOString() : null;
}

/** `yyyy-MM-dd` → `yyyyMMdd` (NYT's begin_date/end_date). */
export function toCompactDate(day: string) {
  return day.replaceAll('-', '');
}

/** Today minus `days`, as `yyyy-MM-dd` in local time. */
export function daysAgo(days: number, now = new Date()) {
  return format(subDays(now, days), 'yyyy-MM-dd');
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
