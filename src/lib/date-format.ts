import { differenceInSeconds, format, formatDistanceStrict, isValid, parseISO } from 'date-fns';

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

/** "Thursday 15 October": the feed's dateline. */
export function formatDayHeading(now = new Date()) {
  return format(now, 'EEEE d MMMM');
}

/** An ISO 8601 timestamp normalized to UTC (`…Z`), or null if it doesn't parse. */
export function toIsoDateTime(value: string | null | undefined): string | null {
  if (!value) return null;
  const date = parseISO(value);
  return isValid(date) ? date.toISOString() : null;
}

/** A Date as `yyyy-MM-dd` in local time (the app's day format). */
export function toDayString(date: Date) {
  return format(date, 'yyyy-MM-dd');
}

/** `yyyy-MM-dd` → `yyyyMMdd` (NYT's begin_date/end_date). */
export function toCompactDate(day: string) {
  return day.replaceAll('-', '');
}
