import { describe, expect, it } from 'vitest';

import {
  describeRange,
  detectPreset,
  fromPickerRange,
  presetRange,
  toPickerRange,
} from './date-presets';

const NOW = new Date(2026, 9, 14, 15); // 14 Oct 2026, local

describe('date presets', () => {
  it('turns presets into a from date', () => {
    expect(presetRange('any', NOW)).toEqual({});
    expect(presetRange('24h', NOW)).toEqual({ from: '2026-10-13' });
    expect(presetRange('week', NOW)).toEqual({ from: '2026-10-07' });
    expect(presetRange('month', NOW)).toEqual({ from: '2026-09-14' });
  });

  it('recognizes a preset from the URL range, otherwise custom', () => {
    expect(detectPreset({}, NOW)).toBe('any');
    expect(detectPreset({ from: '2026-10-07' }, NOW)).toBe('week');
    expect(detectPreset({ from: '2026-10-08' }, NOW)).toBe('custom');
    expect(detectPreset({ from: '2026-10-07', to: '2026-10-10' }, NOW)).toBe('custom');
  });

  it('labels ranges for filter chips', () => {
    expect(describeRange({}, NOW)).toBeNull();
    expect(describeRange({ from: '2026-10-13' }, NOW)).toBe('Past 24 hours');
    expect(describeRange({ from: '2026-10-01', to: '2026-10-14' }, NOW)).toBe(
      '1 Oct 2026 – 14 Oct 2026',
    );
    expect(describeRange({ from: '2026-10-02' }, NOW)).toBe('From 2 Oct 2026');
    expect(describeRange({ to: '2026-10-02' }, NOW)).toBe('Until 2 Oct 2026');
  });

  it('converts between day ranges and calendar selections', () => {
    expect(toPickerRange({})).toBeUndefined();
    const picked = toPickerRange({ from: '2026-10-01', to: '2026-10-05' });
    expect(fromPickerRange(picked)).toEqual({ from: '2026-10-01', to: '2026-10-05' });

    // One picked day is a one-day range; nothing picked is no range.
    expect(fromPickerRange({ from: new Date(2026, 9, 3), to: undefined })).toEqual({
      from: '2026-10-03',
      to: '2026-10-03',
    });
    expect(fromPickerRange(undefined)).toBeNull();
  });
});
