import * as Haptics from 'expo-haptics';
import { getSettingsSnapshot } from '../domain/settings/snapshot';

/** Fire a haptic only when the Vibration setting is on. */
export function hapticImpact(style: 'light' | 'medium' | 'selection' = 'light') {
  if (!getSettingsSnapshot().vibrationEnabled) return;
  void (style === 'selection'
    ? Haptics.selectionAsync()
    : Haptics.impactAsync(
        style === 'medium'
          ? Haptics.ImpactFeedbackStyle.Medium
          : Haptics.ImpactFeedbackStyle.Light,
      ));
}

export function hapticSuccess() {
  if (!getSettingsSnapshot().vibrationEnabled) return;
  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}
