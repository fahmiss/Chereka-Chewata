import { setAudioModeAsync } from 'expo-audio';

/** Shared configuration for short, foreground-only party-game effects. */
export async function prepareGameAudio() {
  await setAudioModeAsync({
    playsInSilentMode: true,
    shouldPlayInBackground: false,
    interruptionMode: 'mixWithOthers',
  });
}
