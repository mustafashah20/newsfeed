import { describe, expect, it } from 'vitest';

import { formatFullDate, timeAgo, toCompactDate, toIsoDateTime } from './date-format';

describe('date formatting', () => {
  it('normalizes timestamps to UTC ISO and rejects junk', () => {
    expect(toIsoDateTime('2026-10-13T14:15:19Z')).toBe('2026-10-13T14:15:19.000Z');
    expect(toIsoDateTime('2026-10-13T14:15:19+0000')).toBe('2026-10-13T14:15:19.000Z');
    expect(toIsoDateTime('not a date')).toBeNull();
    expect(toIsoDateTime(null)).toBeNull();
  });

  it('formats days for NYT', () => {
    expect(toCompactDate('2026-10-01')).toBe('20261001');
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
