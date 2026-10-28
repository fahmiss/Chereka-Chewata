import { useAudioPlayer, type AudioSource } from 'expo-audio';
import { useCallback, useEffect, useMemo } from 'react';
import { useSettings } from '../domain/settings/SettingsContext';
import { prepareGameAudio } from './audio';

/**
 * Preloaded local sound effect with app-level Sound-setting support.
 * Native implementation; the web build uses useSoundEffect.web.ts.
 */
export function useSoundEffect(source: AudioSource, volume = 0.7) {
  const { settings } = useSettings();
  const player = useAudioPlayer(source);

  return useCallback(() => {
    if (!settings.soundEnabled) return;
    let active = true;
    player.volume = volume;
    player.pause();
    void prepareGameAudio()
      .then(async () => {
        await player.seekTo(0);
        if (active) player.play();
      })
      .catch(() => undefined);
    return () => {
      active = false;
      player.pause();
    };
  }, [player, settings.soundEnabled, volume]);
}

/**
 * A sound that loops until stopped, loaded as soon as the screen mounts so
 * `start` plays immediately. Stops on unmount.
 */
export function useLoopingSound(source: AudioSource, volume = 0.5) {
  const { settings } = useSettings();
  const player = useAudioPlayer(source);

  useEffect(() => {
    void prepareGameAudio().catch(() => undefined);
    return () => player.pause();
  }, [player]);

  return useMemo(
    () => ({
      start: () => {
        if (!settings.soundEnabled) return;
        player.loop = true;
        player.volume = volume;
        void player.seekTo(0);
        player.play();
      },
      stop: () => {
        player.pause();
        void player.seekTo(0);
      },
    }),
    [player, settings.soundEnabled, volume],
  );
}
