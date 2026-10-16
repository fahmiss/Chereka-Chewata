import { setAudioModeAsync } from 'expo-audio';

let preparation: Promise<void> | null = null;

/** Configure foreground effects once, and retry if the initial setup fails. */
export function prepareGameAudio(): Promise<void> {
  if (!preparation) {
    preparation = setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: false,
      interruptionMode: 'mixWithOthers',
    }).catch((error: unknown) => {
      preparation = null;
      throw error;
    });
  }
  return preparation;
}
