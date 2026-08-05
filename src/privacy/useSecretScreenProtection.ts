import {
  disableAppSwitcherProtectionAsync,
  enableAppSwitcherProtectionAsync,
  usePreventScreenCapture,
} from 'expo-screen-capture';
import { useEffect } from 'react';
import { Platform } from 'react-native';

/**
 * Blocks screenshots/recordings while mounted, and blurs the iOS app-switcher
 * preview. Android gets a blank recents tile via FLAG_SECURE from the same API.
 * No-ops safely on web / unsupported platforms.
 */
export function useSecretScreenProtection(key = 'chereka-secret') {
  usePreventScreenCapture(key);

  useEffect(() => {
    if (Platform.OS !== 'ios') return;

    let active = true;
    void enableAppSwitcherProtectionAsync(0.75).catch(() => {
      /* Expo Go / older iOS — ignore */
    });

    return () => {
      if (!active) return;
      active = false;
      void disableAppSwitcherProtectionAsync().catch(() => {});
    };
  }, []);
}
