import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Player } from '../domain/impostor/types';
import { storageKeys } from './keys';

export async function loadLastPlayerGroup(): Promise<Player[] | null> {
  try {
    const raw = await AsyncStorage.getItem(storageKeys.lastPlayerGroup);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Player[];
    if (!Array.isArray(parsed) || parsed.length === 0) return null;
    return parsed.filter(
      (player) =>
        player &&
        typeof player.id === 'string' &&
        typeof player.displayName === 'string' &&
        player.displayName.trim().length > 0,
    );
  } catch {
    return null;
  }
}

export async function saveLastPlayerGroup(players: Player[]): Promise<void> {
  const clean = players.map((player) => ({
    id: player.id,
    displayName: player.displayName.trim(),
  }));
  await AsyncStorage.setItem(storageKeys.lastPlayerGroup, JSON.stringify(clean));
}
