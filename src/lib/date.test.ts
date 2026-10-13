import { describe, expect, it } from 'vitest';

import {
  daysAgo,
  formatFullDate,
  isWithinDays,
  laterDay,
  timeAgo,
  toCompactDate,
  toIsoDateTime,
} from './date';

describe('date helpers', () => {
  it('normalizes timestamps to UTC ISO and rejects junk', () => {
    expect(toIsoDateTime('2026-10-13T14:15:19Z')).toBe('2026-10-13T14:15:19.000Z');
    expect(toIsoDateTime('2026-10-13T14:15:19+0000')).toBe('2026-10-13T14:15:19.000Z');
    expect(toIsoDateTime('not a date')).toBeNull();
    expect(toIsoDateTime(null)).toBeNull();
  });

  it('formats and compares days', () => {
    expect(toCompactDate('2026-10-01')).toBe('20261001');
    expect(daysAgo(30, new Date(2026, 9, 14))).toBe('2026-09-14');
    expect(laterDay('2026-08-01', '2026-09-14')).toBe('2026-09-14');
  });

  it('checks an inclusive day range', () => {
    const noon = new Date(2026, 9, 12, 12).toISOString();
    expect(isWithinDays(noon, '2026-10-12', '2026-10-12')).toBe(true);
    expect(isWithinDays(noon, '2026-10-13')).toBe(false);
    expect(isWithinDays(noon, undefined, '2026-10-11')).toBe(false);
    expect(isWithinDays(noon)).toBe(true);
  });

  it('describes how long ago something was published', () => {
    const now = new Date('2026-10-14T12:00:00.000Z');
    expect(timeAgo('2026-10-14T11:59:30.000Z', now)).toBe('just now');
    expect(timeAgo('2026-10-14T12:05:00.000Z', now)).toBe('just now'); // clock skew
    expect(timeAgo('2026-10-14T09:00:00.000Z', now)).toBe('3 hours ago');
    expect(timeAgo('2026-10-12T12:00:00.000Z', now)).toBe('2 days ago');
  });

  it('formats a full date for tooltips', () => {
    expect(formatFullDate('2026-10-13T14:15:19.000Z')).toBe('13 Oct 2026, 14:15');
  });
});
