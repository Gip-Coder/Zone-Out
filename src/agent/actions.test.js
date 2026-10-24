import { describe, it, expect } from 'vitest';
import { validateAction } from './actions';

describe('validateAction (client AI allowlist)', () => {
  it('passes valid actions through, normalized', () => {
    expect(validateAction({ type: 'SET_TIMER', minutes: '45' })).toEqual({ type: 'SET_TIMER', minutes: 45 });
    expect(validateAction({ type: 'PAUSE_TIMER', extra: 'x' })).toEqual({ type: 'PAUSE_TIMER' });
    expect(validateAction({ type: 'NAVIGATE', view: 'dashboard' })).toEqual({ type: 'NAVIGATE', view: 'dashboard' });
    expect(validateAction({ type: 'ADD_GOAL', title: 'CAT 1', date: '2026-11-02', plan: ['Revise', { task: 'Mock test' }] }))
      .toEqual({ type: 'ADD_GOAL', title: 'CAT 1', date: '2026-11-02', plan: [{ task: 'Revise', done: false }, { task: 'Mock test', done: false }] });
  });

  it('rejects unknown types, bad parameters and non-objects', () => {
    for (const bad of [
      null, undefined, 'SET_TIMER', [], {},
      { type: 'EVAL', code: 'alert(1)' },
      { type: 'SET_TIMER', minutes: 0 },
      { type: 'SET_TIMER', minutes: 301 },
      { type: 'SET_TIMER', minutes: NaN },
      { type: 'NAVIGATE', view: '/admin' },
      { type: 'ADD_GOAL', title: '   ' },
      { type: 'ADD_GOAL', title: 'x'.repeat(201) },
      { type: 'OPEN_RESOURCE', resource: 'files', moduleName: 'm' },
    ]) {
      expect(validateAction(bad), JSON.stringify(bad)).toBeNull();
    }
  });

  it('drops malformed date strings instead of passing them on', () => {
    expect(validateAction({ type: 'ADD_GOAL', title: 'x', date: 'next friday' })).toEqual({ type: 'ADD_GOAL', title: 'x', plan: [] });
  });
});
