// @vitest-environment jsdom
import React, { useState, useEffect } from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import Timer from './Timer';

/** Hosts Timer with parent-owned state, as App.jsx does. */
function Harness({ initial = 60, running = false, onComplete, settersRef }) {
  const [focusTime, setFocusTime] = useState(initial);
  const [sessionDuration, setSessionDuration] = useState(initial);
  const [isRunning, setIsRunning] = useState(running);
  useEffect(() => {
    if (settersRef) settersRef.current = { setFocusTime, setSessionDuration, setIsRunning };
  }, [settersRef]);
  return (
    <>
      <span data-testid="running">{String(isRunning)}</span>
      <Timer
        focusTime={focusTime}
        setFocusTime={setFocusTime}
        sessionDuration={sessionDuration}
        setSessionDuration={setSessionDuration}
        isRunning={isRunning}
        setIsRunning={setIsRunning}
        onSessionComplete={onComplete}
      />
    </>
  );
}

const display = () => screen.getByRole('timer').textContent;

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe('Timer', () => {
  it('counts down and reports the session length when it completes', () => {
    const onComplete = vi.fn();
    render(<Harness initial={120} running onComplete={onComplete} />);
    act(() => { vi.advanceTimersByTime(60_000); });
    expect(display()).toBe('00:01:00');
    act(() => { vi.advanceTimersByTime(61_000); });
    expect(display()).toBe('00:00:00');
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledWith(2);
    expect(screen.getByTestId('running').textContent).toBe('false');
  });

  // Regression: the countdown decremented once per interval tick, so browser
  // throttling of background tabs made it run slower than real time.
  it('tracks wall-clock time even when interval ticks are delayed', () => {
    render(<Harness initial={300} running />);
    // Simulate a throttled tab: the clock jumps 2 minutes but timers have not fired
    act(() => {
      vi.setSystemTime(Date.now() + 120_000);
      document.dispatchEvent(new Event('visibilitychange'));
    });
    expect(display()).toBe('00:03:00');
  });

  // Regression: AI-set timers kept the old session duration, so completions logged wrong minutes
  it('reports the externally-set session length on completion', () => {
    const onComplete = vi.fn();
    const settersRef = { current: null };
    render(<Harness initial={25 * 60} onComplete={onComplete} settersRef={settersRef} />);
    act(() => {
      settersRef.current.setFocusTime(5 * 60);
      settersRef.current.setSessionDuration(5 * 60);
      settersRef.current.setIsRunning(true);
    });
    act(() => { vi.advanceTimersByTime(5 * 60_000 + 500); });
    expect(onComplete).toHaveBeenCalledWith(5);
  });

  // Regression: the reset button's click bubbled to the ring and restarted the timer
  it('reset restores the session length without starting the timer', () => {
    render(<Harness initial={90} running />);
    act(() => { vi.advanceTimersByTime(30_000); });
    fireEvent.click(screen.getByRole('button', { name: 'Pause timer' }));
    expect(screen.getByTestId('running').textContent).toBe('false');

    fireEvent.click(screen.getByRole('button', { name: 'Edit timer' }));
    fireEvent.click(screen.getByRole('button', { name: 'Reset timer' }));

    expect(display()).toBe('00:01:30');
    expect(screen.getByTestId('running').textContent).toBe('false');
    act(() => { vi.advanceTimersByTime(5_000); });
    expect(display()).toBe('00:01:30');
  });

  it('sets and starts a manual duration, ignoring invalid input', () => {
    const onComplete = vi.fn();
    render(<Harness initial={60} onComplete={onComplete} />);
    fireEvent.click(screen.getByRole('button', { name: 'Edit timer' }));
    fireEvent.change(screen.getByLabelText('Hours'), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText('Minutes'), { target: { value: '2' } });
    fireEvent.click(screen.getByRole('button', { name: 'Set' }));
    expect(screen.getByTestId('running').textContent).toBe('true');
    expect(display()).toBe('00:02:00');
    act(() => { vi.advanceTimersByTime(120_500); });
    expect(onComplete).toHaveBeenCalledWith(2);
  });

  it('is operable from the keyboard', () => {
    render(<Harness initial={60} />);
    const ring = screen.getByRole('button', { name: 'Edit timer' });
    fireEvent.keyDown(ring, { key: 'Enter' });
    expect(screen.getByLabelText('Minutes')).toBeTruthy();
  });
});
