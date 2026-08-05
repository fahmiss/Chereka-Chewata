import { defaultSettings, type AppSettings } from './types';

/**
 * Sync snapshot for places that can't use React context (PressableScale,
 * motion hooks). SettingsProvider keeps this in sync on every change.
 */
let snapshot: AppSettings = { ...defaultSettings };
const listeners = new Set<(value: AppSettings) => void>();

export function getSettingsSnapshot(): AppSettings {
  return snapshot;
}

export function setSettingsSnapshot(next: AppSettings) {
  snapshot = next;
  listeners.forEach((listener) => listener(next));
}

export function subscribeSettings(listener: (value: AppSettings) => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
