import type { Player, TeamId } from './types';

export function createId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function defaultPlayers(count: number): Player[] {
  return Array.from({ length: count }, (_, index) => ({
    id: createId('p'),
    displayName: `Player ${index + 1}`,
  }));
}

export function shuffle<T>(items: readonly T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy;
}

export function pickRandom<T>(items: readonly T[]): T | undefined {
  return items[Math.floor(Math.random() * items.length)];
}

export function playerName(players: Player[], playerId: string | null | undefined): string {
  if (!playerId) return 'Player';
  return players.find((player) => player.id === playerId)?.displayName ?? 'Player';
}

/** Random balanced split; team A takes the extra player on odd counts. */
export function splitTeams(players: Player[]): { teamA: string[]; teamB: string[] } {
  const shuffled = shuffle(players.map((player) => player.id));
  const mid = Math.ceil(shuffled.length / 2);
  return { teamA: shuffled.slice(0, mid), teamB: shuffled.slice(mid) };
}

export function teamLabel(team: TeamId): string {
  return team === 'a' ? 'Team A' : 'Team B';
}

export function otherTeam(team: TeamId): TeamId {
  return team === 'a' ? 'b' : 'a';
}

/** Plurality leaders among the eligible suspects; empty when nobody voted. */
export function voteLeaders(
  votes: Record<string, string>,
  eligible: string[] | null,
): string[] {
  const counts = new Map<string, number>();
  for (const suspectId of Object.values(votes)) {
    if (eligible && !eligible.includes(suspectId)) continue;
    counts.set(suspectId, (counts.get(suspectId) ?? 0) + 1);
  }
  let best = 0;
  for (const value of counts.values()) best = Math.max(best, value);
  return [...counts.entries()]
    .filter(([, count]) => count === best && best > 0)
    .map(([id]) => id);
}

export function voteCounts(
  players: Player[],
  votes: Record<string, string>,
): { name: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const suspectId of Object.values(votes)) {
    counts.set(suspectId, (counts.get(suspectId) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([id, count]) => ({ name: playerName(players, id), count }))
    .sort((a, b) => b.count - a.count);
}
