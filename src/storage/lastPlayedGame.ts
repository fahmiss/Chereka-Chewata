import AsyncStorage from '@react-native-async-storage/async-storage';
import { GAMES, type GameId } from '../domain/games';
import { storageKeys } from './keys';

export type LastPlayedGame = {
  gameId: GameId;
  playedAt: number;
};

const playableIds = new Set(GAMES.filter((game) => game.playable).map((game) => game.id));

export async function loadLastPlayedGame(): Promise<LastPlayedGame | null> {
  try {
    const raw = await AsyncStorage.getItem(storageKeys.lastPlayedGame);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<LastPlayedGame>;
    if (
      typeof parsed.gameId !== 'string' ||
      !playableIds.has(parsed.gameId as GameId) ||
      typeof parsed.playedAt !== 'number'
    ) {
      return null;
    }
    return parsed as LastPlayedGame;
  } catch {
    return null;
  }
}

export async function saveLastPlayedGame(gameId: GameId): Promise<void> {
  const value: LastPlayedGame = { gameId, playedAt: Date.now() };
  await AsyncStorage.setItem(storageKeys.lastPlayedGame, JSON.stringify(value));
}
