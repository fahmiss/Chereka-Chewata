import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing } from 'react-native';
import { getSettingsSnapshot, subscribeSettings } from '../domain/settings/snapshot';

/** Strong ease-out — starts fast so the UI feels like it heard you. */
export const easeOut = Easing.bezier(0.23, 1, 0.32, 1);

/** On-screen movement (rails, thumbs) — accelerate then settle. */
export const easeInOut = Easing.bezier(0.77, 0, 0.175, 1);

export const duration = {
  press: 140,
  enter: 240,
  control: 200,
  modal: 220,
  /** Deliberate hold before a secret unlocks. */
  holdReveal: 480,
} as const;

/**
 * True when the OS switch OR the in-app setting asks for less motion.
 * Reduced motion = gentler/shorter motion, not zero.
 */
export function useReducedMotion(): boolean {
  const [system, setSystem] = useState(false);
  const [appFlag, setAppFlag] = useState(getSettingsSnapshot().reduceMotion);

  useEffect(() => {
    let alive = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((value) => {
      if (alive) setSystem(value);
    });
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setSystem);
    return () => {
      alive = false;
      sub.remove();
    };
  }, []);

  useEffect(() => subscribeSettings((next) => setAppFlag(next.reduceMotion)), []);

  return system || appFlag;
}

/**
 * Fade + slight rise + barely-visible scale on mount.
 * Never from scale(0) — nothing in the real world appears from nothing.
 */
export function useEnterAnimation(index = 0, distance = 12) {
  const reduced = useReducedMotion();
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reduced) {
      progress.setValue(1);
      return;
    }
    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: duration.enter,
      delay: Math.min(index, 8) * 40,
      easing: easeOut,
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [index, progress, reduced]);

  return {
    opacity: progress,
    transform: [
      {
        translateY: progress.interpolate({
          inputRange: [0, 1],
          outputRange: [distance, 0],
        }),
      },
      {
        scale: progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0.97, 1],
        }),
      },
    ],
  };
}

/** Smoothly animates a 0–1 progress value when `value` changes. */
export function useProgress(value: number, length = 1) {
  const reduced = useReducedMotion();
  const progress = useRef(new Animated.Value(length > 0 ? value / length : 0)).current;

  useEffect(() => {
    const next = length > 0 ? value / length : 0;
    if (reduced) {
      progress.setValue(next);
      return;
    }
    const animation = Animated.timing(progress, {
      toValue: next,
      duration: duration.control,
      easing: easeInOut,
      useNativeDriver: false,
    });
    animation.start();
    return () => animation.stop();
  }, [value, length, progress, reduced]);

  return progress;
}
