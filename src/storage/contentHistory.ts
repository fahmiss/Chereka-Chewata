import AsyncStorage from '@react-native-async-storage/async-storage';
import type { GameId } from '../domain/games';
import { storageKeys } from './keys';

type History = Partial<Record<GameId, string[]>>;

let recent: History = {};
let reported: History = {};

function clean(value: unknown): History {
  if (!value || typeof value !== 'object') return {};
  const result: History = {};
  for (const [game, ids] of Object.entries(value)) {
    if (!Array.isArray(ids)) continue;
    result[game as GameId] = ids.filter((id): id is string => typeof id === 'string');
  }
  return result;
}

export async function hydrateContentHistory(): Promise<void> {
  try {
    const [historyRaw, reportedRaw] = await AsyncStorage.multiGet([
      storageKeys.cardHistory,
      storageKeys.reportedCards,
    ]);
    recent = clean(historyRaw[1] ? JSON.parse(historyRaw[1]) : {});
    reported = clean(reportedRaw[1] ? JSON.parse(reportedRaw[1]) : {});
  } catch {
    recent = {};
    reported = {};
  }
}

export function recentIds(game: GameId): ReadonlySet<string> {
  return new Set(recent[game] ?? []);
}

export function reportedIds(game: GameId): ReadonlySet<string> {
  return new Set(reported[game] ?? []);
}

export function recordPlayed(game: GameId, ids: string | string[]): void {
  const additions = Array.isArray(ids) ? ids : [ids];
  const next = [...new Set([...(recent[game] ?? []), ...additions])].slice(-200);
  recent = { ...recent, [game]: next };
  void AsyncStorage.setItem(storageKeys.cardHistory, JSON.stringify(recent));
}

export function reportCard(game: GameId, id: string): void {
  reported = { ...reported, [game]: [...new Set([...(reported[game] ?? []), id])] };
  void AsyncStorage.setItem(storageKeys.reportedCards, JSON.stringify(reported));
}

export async function clearContentHistory(): Promise<void> {
  recent = {};
  reported = {};
  await AsyncStorage.multiRemove([storageKeys.cardHistory, storageKeys.reportedCards]);
}

export function prioritizeFresh<T extends { id: string }>(items: T[], game: GameId): T[] {
  const hidden = reportedIds(game);
  const seen = recentIds(game);
  const eligible = items.filter((item) => !hidden.has(item.id));
  const shuffle = (values: T[]) => {
    const copy = [...values];
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const swap = Math.floor(Math.random() * (index + 1));
      [copy[index], copy[swap]] = [copy[swap]!, copy[index]!];
    }
    return copy;
  };
  return [
    ...shuffle(eligible.filter((item) => !seen.has(item.id))),
    ...shuffle(eligible.filter((item) => seen.has(item.id))),
  ];
}
