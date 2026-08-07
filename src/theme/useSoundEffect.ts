import { useAudioPlayer, type AudioSource } from 'expo-audio';
import { useCallback } from 'react';
import { useSettings } from '../domain/settings/SettingsContext';
import { prepareGameAudio } from './audio';

/** Preloaded local sound effect with app-level Sound-setting support. */
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
