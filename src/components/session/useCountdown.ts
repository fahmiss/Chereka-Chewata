import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { useCallback, useEffect, useRef, useState } from 'react';

type Options = {
  /** Length of a fresh countdown. Read again whenever `resetKey` changes. */
  durationMs: number;
  running: boolean;
  /** Change it to restart from `durationMs` (new turn, new round). */
  resetKey: string | number;
  onExpire: () => void;
};

/**
 * Wall-clock countdown that survives re-renders and pauses cleanly.
 * Ticks four times a second so the display never skips a second.
 */
export function useCountdown({ durationMs, running, resetKey, onExpire }: Options) {
  const remainingRef = useRef(durationMs);
  const deadlineRef = useRef<number | null>(null);
  const expiredRef = useRef(false);
  const onExpireRef = useRef(onExpire);
  const [leftMs, setLeftMs] = useState(durationMs);

  onExpireRef.current = onExpire;

  useEffect(() => {
    remainingRef.current = durationMs;
    deadlineRef.current = null;
    expiredRef.current = false;
    setLeftMs(durationMs);
    // durationMs is read only when the countdown resets.
  }, [resetKey]);

  useEffect(() => {
    if (!running || expiredRef.current) return;
    deadlineRef.current = Date.now() + remainingRef.current;

    const tick = () => {
      const left = Math.max(0, (deadlineRef.current ?? Date.now()) - Date.now());
      remainingRef.current = left;
      setLeftMs(left);
      if (left <= 0 && !expiredRef.current) {
        expiredRef.current = true;
        onExpireRef.current();
      }
    };

    tick();
    const id = setInterval(tick, 250);
    return () => {
      clearInterval(id);
      if (deadlineRef.current !== null) {
        remainingRef.current = Math.max(0, deadlineRef.current - Date.now());
        deadlineRef.current = null;
      }
    };
  }, [running, resetKey]);

  const getLeftMs = useCallback(() => {
    if (deadlineRef.current === null) return remainingRef.current;
    return Math.max(0, deadlineRef.current - Date.now());
  }, []);

  return { leftMs, leftSeconds: Math.ceil(leftMs / 1000), getLeftMs };
}

let keepAwakeCount = 0;

/**
 * Keeps the screen on while a timed phase is visible. Failures are ignored:
 * some browsers expose no wake lock, and the game still works without one.
 */
export function useSessionKeepAwake(active = true) {
  useEffect(() => {
    if (!active) return;
    const tag = `chereka-session-${(keepAwakeCount += 1)}`;
    activateKeepAwakeAsync(tag).catch(() => undefined);
    return () => {
      deactivateKeepAwake(tag).catch(() => undefined);
    };
  }, [active]);
}
