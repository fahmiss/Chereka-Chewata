import AsyncStorage from '@react-native-async-storage/async-storage';
import { storageKeys } from './keys';

export async function hasCompletedLanguageGate(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(storageKeys.hasCompletedLanguageGate);
    return value === '1';
  } catch {
    return false;
  }
}

export async function markLanguageGateComplete(): Promise<void> {
  await AsyncStorage.setItem(storageKeys.hasCompletedLanguageGate, '1');
}
