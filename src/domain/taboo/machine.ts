import { pickTabooCard } from '../../content/taboo';
import {
  createId,
  type Player,
  type TabooCard,
  type TabooSession,
  type TabooSetup,
  type TeamId,
} from './types';

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy;
}

function playerMap(players: Player[]): Map<string, Player> {
  return new Map(players.map((player) => [player.id, player]));
}

export function getPlayerName(session: TabooSession, playerId: string): string {
  return playerMap(session.setup.players).get(playerId)?.displayName ?? 'Player';
}

export function teamLabel(team: TeamId): string {
  return team === 'a' ? 'Team A' : 'Team B';
}

export function otherTeam(team: TeamId): TeamId {
  return team === 'a' ? 'b' : 'a';
}

export function teamPlayerIds(session: TabooSession, team: TeamId): string[] {
  return team === 'a' ? session.teamA : session.teamB;
}

export function currentDescriberId(session: TabooSession): string | null {
  const ids = teamPlayerIds(session, session.activeTeam);
  if (ids.length === 0) return null;
  const index = session.describerIndex[session.activeTeam] % ids.length;
  return ids[index] ?? null;
}

function splitTeams(players: Player[]): { teamA: string[]; teamB: string[] } {
  const shuffled = shuffle(players.map((player) => player.id));
  const mid = Math.ceil(shuffled.length / 2);
  return { teamA: shuffled.slice(0, mid), teamB: shuffled.slice(mid) };
}

function drawCard(session: TabooSession): TabooCard | null {
  return pickTabooCard({
    categoryIds: session.setup.categoryIds,
    contentLevels: session.setup.contentLevels,
    excludeIds: session.excludedCardIds,
  });
}

function withNextCard(session: TabooSession): TabooSession {
  const card = drawCard(session);
  if (!card) {
    return { ...session, currentCard: null };
  }
  return {
    ...session,
    currentCard: card,
    excludedCardIds: [...session.excludedCardIds, card.id],
  };
}

export function createTabooSession(
  setup: TabooSetup,
  options: { excludedCardIds?: string[]; sessionId?: string } = {},
): TabooSession | { error: string } {
  if (setup.players.length < 4) {
    return { error: 'Taboo needs at least 4 players on two teams.' };
  }
  if (setup.categoryIds.length === 0) {
    return { error: 'Pick at least one category.' };
  }
  if (setup.contentLevels.length === 0) {
    return { error: 'Pick at least one content level.' };
  }

  const probe = pickTabooCard({
    categoryIds: setup.categoryIds,
    contentLevels: setup.contentLevels,
    excludeIds: options.excludedCardIds ?? [],
  });
  if (!probe) {
    return { error: 'No cards left for these categories and content levels.' };
  }

  const { teamA, teamB } = splitTeams(setup.players);
  if (teamA.length === 0 || teamB.length === 0) {
    return { error: 'Need players on both teams.' };
  }

  return {
    sessionId: options.sessionId ?? createId('sess'),
    setup,
    phase: 'round_ready',
    teamA,
    teamB,
    scores: { a: 0, b: 0 },
    activeTeam: 'a',
    describerIndex: { a: 0, b: 0 },
    turnsCompleted: { a: 0, b: 0 },
    currentCard: null,
    turnCorrect: 0,
    turnSkips: 0,
    turnViolations: 0,
    turnScore: 0,
    excludedCardIds: options.excludedCardIds ?? [],
    isSuddenDeath: false,
    winner: null,
  };
}

function resetTurnCounters(session: TabooSession): TabooSession {
  return {
    ...session,
    turnCorrect: 0,
    turnSkips: 0,
    turnViolations: 0,
    turnScore: 0,
    currentCard: null,
  };
}

export function beginPlaying(session: TabooSession): TabooSession {
  if (session.phase !== 'round_ready' && session.phase !== 'paused') return session;
  const next = withNextCard(resetTurnCounters({ ...session, phase: 'playing' }));
  if (!next.currentCard) {
    return { ...session, phase: 'final', winner: leadingWinner(session) ?? 'tie' };
  }
  return next;
}

export function pauseTurn(session: TabooSession): TabooSession {
  if (session.phase !== 'playing') return session;
  return { ...session, phase: 'paused' };
}

export function resumeTurn(session: TabooSession): TabooSession {
  if (session.phase !== 'paused') return session;
  return { ...session, phase: 'playing' };
}

export function markCorrect(session: TabooSession): TabooSession {
  if (session.phase !== 'playing' || !session.currentCard) return session;
  const scored = {
    ...session,
    turnCorrect: session.turnCorrect + 1,
    turnScore: session.turnScore + 1,
  };
  return withNextCard(scored);
}

export function markSkip(session: TabooSession): TabooSession {
  if (session.phase !== 'playing' || !session.currentCard) return session;
  if (session.turnSkips >= session.setup.maxSkips) return session;

  const penalty = session.setup.skipPenalty ? -1 : 0;
  const scored = {
    ...session,
    turnSkips: session.turnSkips + 1,
    turnScore: session.turnScore + penalty,
  };
  return withNextCard(scored);
}

export function markViolation(session: TabooSession): TabooSession {
  if (session.phase !== 'playing' || !session.currentCard) return session;
  const scored = {
    ...session,
    turnViolations: session.turnViolations + 1,
    turnScore: session.turnScore - 1,
  };
  return withNextCard(scored);
}

export function expireTurn(session: TabooSession): TabooSession {
  if (session.phase !== 'playing' && session.phase !== 'paused') return session;
  return { ...session, phase: 'turn_summary', currentCard: null };
}

export function adjustTurnScore(session: TabooSession, delta: number): TabooSession {
  if (session.phase !== 'turn_summary') return session;
  return { ...session, turnScore: session.turnScore + delta };
}

function leadingWinner(session: TabooSession): TeamId | null {
  if (session.scores.a === session.scores.b) return null;
  return session.scores.a > session.scores.b ? 'a' : 'b';
}

function applyTurnAndAdvance(session: TabooSession): TabooSession {
  const team = session.activeTeam;
  const nextScore = Math.max(0, session.scores[team] + session.turnScore);
  const scores = { ...session.scores, [team]: nextScore };
  const turnsCompleted = {
    ...session.turnsCompleted,
    [team]: session.turnsCompleted[team] + 1,
  };
  const describerIndex = {
    ...session.describerIndex,
    [team]: session.describerIndex[team] + 1,
  };

  const equalTurns = turnsCompleted.a === turnsCompleted.b;
  const hitTarget =
    scores.a >= session.setup.pointsToWin || scores.b >= session.setup.pointsToWin;

  // Matching final turn: if A hit target first, B still gets their turn.
  if (hitTarget && equalTurns) {
    if (scores.a === scores.b) {
      return {
        ...resetTurnCounters(session),
        scores,
        turnsCompleted,
        describerIndex,
        phase: 'round_ready',
        activeTeam: 'a',
        isSuddenDeath: true,
        winner: null,
      };
    }
    return {
      ...session,
      scores,
      turnsCompleted,
      describerIndex,
      phase: 'final',
      currentCard: null,
      winner: leadingWinner({ ...session, scores }) ?? 'tie',
    };
  }

  if (session.isSuddenDeath && equalTurns) {
    if (scores.a === scores.b) {
      return {
        ...resetTurnCounters(session),
        scores,
        turnsCompleted,
        describerIndex,
        phase: 'round_ready',
        activeTeam: 'a',
        isSuddenDeath: true,
        winner: null,
      };
    }
    return {
      ...session,
      scores,
      turnsCompleted,
      describerIndex,
      phase: 'final',
      currentCard: null,
      winner: leadingWinner({ ...session, scores }) ?? 'tie',
    };
  }

  return {
    ...resetTurnCounters(session),
    scores,
    turnsCompleted,
    describerIndex,
    phase: 'round_ready',
    activeTeam: otherTeam(team),
    winner: null,
  };
}

export function confirmTurnSummary(session: TabooSession): TabooSession {
  if (session.phase !== 'turn_summary') return session;
  return applyTurnAndAdvance(session);
}

export function rematchSession(session: TabooSession): TabooSession | { error: string } {
  return createTabooSession(session.setup, {
    excludedCardIds: [],
    sessionId: session.sessionId,
  });
}

export function rematchKeepTeams(session: TabooSession): TabooSession | { error: string } {
  const created = createTabooSession(session.setup, {
    excludedCardIds: [],
    sessionId: session.sessionId,
  });
  if ('error' in created) return created;
  return {
    ...created,
    teamA: session.teamA,
    teamB: session.teamB,
  };
}
