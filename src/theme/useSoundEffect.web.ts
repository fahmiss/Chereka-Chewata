import type { AudioSource } from 'expo-audio';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useSettings } from '../domain/settings/SettingsContext';
import { loadSound, playSound } from './webAudio';

/**
 * Web sound effect played through Web Audio, so it also works when fired by
 * a timer rather than a tap. Same API as the native hook.
 */
export function useSoundEffect(source: AudioSource, volume = 0.7) {
  const { settings } = useSettings();

  useEffect(() => {
    void loadSound(source);
  }, [source]);

  return useCallback(() => {
    if (!settings.soundEnabled) return;
    return playSound(source, volume);
  }, [settings.soundEnabled, source, volume]);
}

/** Seamless web loop (Web Audio loops sample-accurately). Stops on unmount. */
export function useLoopingSound(source: AudioSource, volume = 0.5) {
  const { settings } = useSettings();
  const stopRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    void loadSound(source);
    return () => {
      stopRef.current?.();
      stopRef.current = null;
    };
  }, [source]);

  return useMemo(
    () => ({
      start: () => {
        stopRef.current?.();
        stopRef.current = settings.soundEnabled
          ? playSound(source, volume, { loop: true })
          : null;
      },
      stop: () => {
        stopRef.current?.();
        stopRef.current = null;
      },
    }),
    [settings.soundEnabled, source, volume],
  );
}
