import { describe, it, expect } from 'vitest';
import { localDateString, localDaysAgo } from './date';

describe('local date helpers', () => {
  it('formats the local calendar date, not the UTC one', () => {
    // 00:30 local time on Jan 5 — toISOString() would give Jan 4 for UTC+ zones
    const d = new Date(2026, 0, 5, 0, 30);
    expect(localDateString(d)).toBe('2026-01-05');
  });

  it('counts days back across month boundaries', () => {
    expect(localDaysAgo(1, new Date(2026, 2, 1, 12))).toBe('2026-02-28');
    expect(localDaysAgo(0, new Date(2026, 9, 24, 23, 59))).toBe('2026-10-24');
  });
});
