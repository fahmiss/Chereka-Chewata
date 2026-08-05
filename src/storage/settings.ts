import AsyncStorage from '@react-native-async-storage/async-storage';
import { defaultSettings, type AppSettings } from '../domain/settings/types';
import { storageKeys } from './keys';

function asInterfaceLanguage(value: unknown): AppSettings['interfaceLanguage'] {
  return value === 'am' || value === 'en' ? value : defaultSettings.interfaceLanguage;
}

function asContentLanguage(value: unknown): AppSettings['contentLanguage'] {
  return value === 'am' || value === 'mixed' || value === 'en'
    ? value
    : defaultSettings.contentLanguage;
}

export async function loadSettings(): Promise<AppSettings> {
  try {
    const raw = await AsyncStorage.getItem(storageKeys.settings);
    if (!raw) return { ...defaultSettings };
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    return {
      soundEnabled:
        typeof parsed.soundEnabled === 'boolean'
          ? parsed.soundEnabled
          : defaultSettings.soundEnabled,
      vibrationEnabled:
        typeof parsed.vibrationEnabled === 'boolean'
          ? parsed.vibrationEnabled
          : defaultSettings.vibrationEnabled,
      reduceMotion:
        typeof parsed.reduceMotion === 'boolean'
          ? parsed.reduceMotion
          : defaultSettings.reduceMotion,
      interfaceLanguage: asInterfaceLanguage(parsed.interfaceLanguage),
      contentLanguage: asContentLanguage(parsed.contentLanguage),
    };
  } catch {
    return { ...defaultSettings };
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await AsyncStorage.setItem(storageKeys.settings, JSON.stringify(settings));
}

export async function clearCardHistory(): Promise<void> {
  await AsyncStorage.multiRemove([storageKeys.cardHistory, storageKeys.reportedCards]);
}
