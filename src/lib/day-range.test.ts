import { describe, expect, it } from 'vitest';

import { daysAgo, isWithinDays, laterDay } from './day-range';

describe('day ranges', () => {
  it('computes and compares days', () => {
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
});
