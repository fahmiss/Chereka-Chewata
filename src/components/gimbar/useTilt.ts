import { DeviceMotion } from 'expo-sensors';
import { useEffect, useRef, useState } from 'react';
import type { GimbarResult } from '../../domain/gimbar/types';

/** Phone within ~17° of upright before a tilt can count. */
const NEUTRAL = 0.3;
/** About 37° forward or back counts as a tilt. */
const TRIGGER = 0.6;
const COOLDOWN_MS = 650;

/** Resolves whether this device reports motion at all. */
export function useMotionAvailable(enabled: boolean): boolean | null {
  const [available, setAvailable] = useState<boolean | null>(enabled ? null : false);

  useEffect(() => {
    if (!enabled) {
      setAvailable(false);
      return;
    }
    let active = true;
    DeviceMotion.isAvailableAsync()
      .then((value) => {
        if (active) setAvailable(value);
      })
      .catch(() => {
        if (active) setAvailable(false);
      });
    return () => {
      active = false;
    };
  }, [enabled]);

  return available;
}

/**
 * Forehead tilt detection on iOS and Android.
 *
 * expo-sensors reports `accelerationIncludingGravity.z` near −g with the
 * screen facing up and +g facing down on both native platforms. Held on the
 * forehead the screen faces the room (z ≈ 0); nodding the screen toward the
 * floor is "got it", toward the ceiling is "pass". A tilt only fires after
 * the phone has come back upright, so one nod never scores twice.
 */
export function useTilt(enabled: boolean, onTilt: (result: GimbarResult) => void) {
  const onTiltRef = useRef(onTilt);
  onTiltRef.current = onTilt;

  useEffect(() => {
    if (!enabled) return;
    let armed = false;
    let smoothed = 0;
    let lastFire = 0;

    DeviceMotion.setUpdateInterval(50);
    const subscription = DeviceMotion.addListener((measurement) => {
      const gravity = measurement.accelerationIncludingGravity;
      if (!gravity) return;
      const magnitude = Math.hypot(gravity.x, gravity.y, gravity.z);
      if (magnitude < 4) return;
      smoothed = smoothed * 0.6 + (gravity.z / magnitude) * 0.4;

      if (!armed) {
        if (Math.abs(smoothed) < NEUTRAL) armed = true;
        return;
      }
      const now = Date.now();
      if (now - lastFire < COOLDOWN_MS) return;
      if (smoothed > TRIGGER || smoothed < -TRIGGER) {
        armed = false;
        lastFire = now;
        onTiltRef.current(smoothed > 0 ? 'correct' : 'pass');
      }
    });

    return () => subscription.remove();
  }, [enabled]);
}
