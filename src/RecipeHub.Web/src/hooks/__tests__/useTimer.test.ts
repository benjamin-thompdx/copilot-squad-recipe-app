import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTimer } from '../useTimer';

describe('useTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('initialises with remainingSeconds = minutes * 60 and isRunning = false', () => {
    const { result } = renderHook(() => useTimer(5));
    expect(result.current.remainingSeconds).toBe(300);
    expect(result.current.isRunning).toBe(false);
  });

  it('handles null/undefined minutes as 0 seconds', () => {
    const { result: r1 } = renderHook(() => useTimer(null));
    expect(r1.current.remainingSeconds).toBe(0);

    const { result: r2 } = renderHook(() => useTimer(undefined));
    expect(r2.current.remainingSeconds).toBe(0);
  });

  it('start() sets isRunning to true', () => {
    const { result } = renderHook(() => useTimer(5));
    act(() => {
      result.current.start();
    });
    expect(result.current.isRunning).toBe(true);
  });

  it('pause() sets isRunning to false', () => {
    const { result } = renderHook(() => useTimer(5));
    act(() => {
      result.current.start();
    });
    act(() => {
      result.current.pause();
    });
    expect(result.current.isRunning).toBe(false);
  });

  it('reset() restores remainingSeconds and sets isRunning to false', () => {
    const { result } = renderHook(() => useTimer(2));
    act(() => {
      result.current.start();
    });
    act(() => {
      vi.advanceTimersByTime(30000);
    });
    act(() => {
      result.current.reset();
    });
    expect(result.current.remainingSeconds).toBe(120);
    expect(result.current.isRunning).toBe(false);
  });

  it('counts down by 1 each second when running', () => {
    const { result } = renderHook(() => useTimer(1));
    act(() => {
      result.current.start();
    });

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.remainingSeconds).toBe(59);

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(result.current.remainingSeconds).toBe(57);
  });

  it('does not count down when paused', () => {
    const { result } = renderHook(() => useTimer(1));
    act(() => {
      result.current.start();
    });
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    act(() => {
      result.current.pause();
    });
    const snapshotAfterPause = result.current.remainingSeconds;

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(result.current.remainingSeconds).toBe(snapshotAfterPause);
  });

  it('stops at 0 and sets isRunning to false when timer expires', () => {
    const { result } = renderHook(() => useTimer(1 / 60)); // 1 second
    act(() => {
      result.current.start();
    });
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(result.current.remainingSeconds).toBe(0);
    expect(result.current.isRunning).toBe(false);
  });

  it('remainingSeconds never goes negative', () => {
    const { result } = renderHook(() => useTimer(1 / 60)); // 1 second
    act(() => {
      result.current.start();
    });
    act(() => {
      vi.advanceTimersByTime(10000);
    });
    expect(result.current.remainingSeconds).toBeGreaterThanOrEqual(0);
  });

  it('start() is a no-op when remainingSeconds is 0', () => {
    const { result } = renderHook(() => useTimer(0));
    act(() => {
      result.current.start();
    });
    expect(result.current.isRunning).toBe(false);
  });
});
