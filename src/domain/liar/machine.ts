import { pickLiarPair } from '../../content/liar';
import {
  createId,
  type LiarSession,
  type LiarSetup,
  type Player,
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

export function getPlayerName(session: LiarSession, playerId: string): string {
  return playerMap(session.setup.players).get(playerId)?.displayName ?? 'Player';
}

export function isLiar(session: LiarSession, playerId: string): boolean {
  return session.liarPlayerId === playerId;
}

/** Question shown privately — never labels the Liar role. */
export function questionForPlayer(session: LiarSession, playerId: string): string {
  return isLiar(session, playerId)
    ? session.pair.liar_question_en
    : session.pair.main_question_en;
}

function pickLiarPlayerId(
  players: Player[],
  previousLiarPlayerId: string | null,
): string {
  const ids = players.map((player) => player.id);
  if (players.length >= 4 && previousLiarPlayerId) {
    const eligible = ids.filter((id) => id !== previousLiarPlayerId);
    if (eligible.length > 0) {
      return eligible[Math.floor(Math.random() * eligible.length)]!;
    }
  }
  return ids[Math.floor(Math.random() * ids.length)]!;
}

function rotatedOrder(playerIds: string[], startId: string): string[] {
  const start = playerIds.indexOf(startId);
  if (start < 0) return playerIds;
  return [...playerIds.slice(start), ...playerIds.slice(0, start)];
}

export function createLiarSession(
  setup: LiarSetup,
  options: {
    excludedPairIds?: string[];
    previousLiarPlayerId?: string | null;
    sessionId?: string;
  } = {},
): LiarSession | { error: string } {
  if (setup.players.length < 3) {
    return { error: "Who's the Liar? needs at least 3 players." };
  }
  if (setup.categoryIds.length === 0) {
    return { error: 'Pick at least one category.' };
  }
  if (setup.contentLevels.length === 0) {
    return { error: 'Pick at least one content level.' };
  }

  const excludedPairIds = options.excludedPairIds ?? [];
  const pair = pickLiarPair({
    categoryIds: setup.categoryIds,
    contentLevels: setup.contentLevels,
    excludeIds: excludedPairIds,
  });

  if (!pair) {
    return { error: 'No cards left for these categories and content levels.' };
  }

  const previousLiarPlayerId = options.previousLiarPlayerId ?? null;
  const liarPlayerId = pickLiarPlayerId(setup.players, previousLiarPlayerId);
  const revealOrder = shuffle(setup.players.map((player) => player.id));
  const playerIds = setup.players.map((player) => player.id);
  const startId = setup.randomAnswerOrder
    ? playerIds[Math.floor(Math.random() * playerIds.length)]!
    : playerIds[0]!;
  const answerOrder = rotatedOrder(playerIds, startId);

  return {
    sessionId: options.sessionId ?? createId('sess'),
    setup,
    phase: 'handoff',
    pair,
    liarPlayerId,
    revealOrder,
    revealIndex: 0,
    answerOrder,
    answerIndex: 0,
    voteOrder: [],
    voteIndex: 0,
    votes: {},
    eligibleSuspectIds: null,
    runoffRound: 0,
    winner: null,
    accusedPlayerId: null,
    excludedPairIds: [...excludedPairIds, pair.id],
    previousLiarPlayerId,
  };
}

export function readyToReveal(session: LiarSession): LiarSession {
  if (session.phase !== 'handoff' && session.phase !== 'voting_handoff') return session;
  if (session.phase === 'handoff') return { ...session, phase: 'reveal' };
  return { ...session, phase: 'voting_select' };
}

export function hideRevealAndContinue(session: LiarSession): LiarSession {
  if (session.phase !== 'reveal') return session;
  const nextIndex = session.revealIndex + 1;
  if (nextIndex >= session.revealOrder.length) {
    return { ...session, phase: 'answer_order', revealIndex: nextIndex };
  }
  return { ...session, phase: 'handoff', revealIndex: nextIndex };
}

export function beginAnswers(session: LiarSession): LiarSession {
  if (session.phase !== 'answer_order') return session;
  return { ...session, phase: 'answers', answerIndex: 0 };
}

export function nextAnswerOrDiscuss(session: LiarSession): LiarSession {
  if (session.phase !== 'answers') return session;
  const next = session.answerIndex + 1;
  if (next >= session.answerOrder.length) {
    return { ...session, phase: 'discussion', answerIndex: next };
  }
  return { ...session, answerIndex: next };
}

export function startVoting(session: LiarSession): LiarSession {
  if (session.phase !== 'discussion') return session;

  const voteOrder = shuffle(session.setup.players.map((player) => player.id));
  return {
    ...session,
    phase: 'voting_handoff',
    voteOrder,
    voteIndex: 0,
    votes: {},
    eligibleSuspectIds: null,
    runoffRound: 0,
    accusedPlayerId: null,
    winner: null,
  };
}

export function beginVoteSelect(session: LiarSession): LiarSession {
  if (session.phase !== 'voting_handoff') return session;
  return { ...session, phase: 'voting_select' };
}

function tallyVotes(
  votes: Record<string, string>,
  eligible: string[] | null,
): { leaders: string[] } {
  const counts = new Map<string, number>();
  for (const suspectId of Object.values(votes)) {
    if (eligible && !eligible.includes(suspectId)) continue;
    counts.set(suspectId, (counts.get(suspectId) ?? 0) + 1);
  }
  let best = 0;
  for (const value of counts.values()) best = Math.max(best, value);
  const leaders = [...counts.entries()]
    .filter(([, count]) => count === best && best > 0)
    .map(([id]) => id);
  return { leaders };
}

function resolveVotes(session: LiarSession): LiarSession {
  const { leaders } = tallyVotes(session.votes, session.eligibleSuspectIds);

  if (leaders.length === 0) {
    return {
      ...session,
      phase: 'result',
      winner: 'liar',
      accusedPlayerId: null,
    };
  }

  if (leaders.length > 1) {
    if (session.runoffRound >= 1) {
      return {
        ...session,
        phase: 'result',
        winner: 'liar',
        accusedPlayerId: null,
      };
    }

    const tied = leaders;
    let voteOrder = session.setup.players
      .map((player) => player.id)
      .filter((id) => !tied.includes(id));

    if (voteOrder.length < 2) {
      voteOrder = shuffle(session.setup.players.map((player) => player.id));
    } else {
      voteOrder = shuffle(voteOrder);
    }

    return {
      ...session,
      phase: 'voting_handoff',
      voteOrder,
      voteIndex: 0,
      votes: {},
      eligibleSuspectIds: tied,
      runoffRound: session.runoffRound + 1,
    };
  }

  const accusedPlayerId = leaders[0]!;
  const caught = accusedPlayerId === session.liarPlayerId;

  return {
    ...session,
    phase: 'result',
    accusedPlayerId,
    winner: caught ? 'group' : 'liar',
  };
}

export function castVote(session: LiarSession, suspectId: string): LiarSession {
  if (session.phase !== 'voting_select') return session;
  const voterId = session.voteOrder[session.voteIndex];
  if (!voterId || voterId === suspectId) return session;

  const eligible = session.eligibleSuspectIds;
  if (eligible && !eligible.includes(suspectId)) return session;

  const votes = { ...session.votes, [voterId]: suspectId };
  const nextIndex = session.voteIndex + 1;

  if (nextIndex < session.voteOrder.length) {
    return {
      ...session,
      votes,
      voteIndex: nextIndex,
      phase: 'voting_handoff',
    };
  }

  return resolveVotes({ ...session, votes, voteIndex: nextIndex });
}

export function rematchSession(session: LiarSession): LiarSession | { error: string } {
  return createLiarSession(session.setup, {
    excludedPairIds: session.excludedPairIds,
    previousLiarPlayerId: session.liarPlayerId,
    sessionId: session.sessionId,
  });
}

export function currentRevealPlayerId(session: LiarSession): string | null {
  return session.revealOrder[session.revealIndex] ?? null;
}

export function currentAnswerPlayerId(session: LiarSession): string | null {
  return session.answerOrder[session.answerIndex] ?? null;
}

export function currentVoterId(session: LiarSession): string | null {
  return session.voteOrder[session.voteIndex] ?? null;
}

export function voteSuspectOptions(session: LiarSession): Player[] {
  const voterId = currentVoterId(session);
  const pool = session.eligibleSuspectIds
    ? session.setup.players.filter((player) =>
        session.eligibleSuspectIds!.includes(player.id),
      )
    : session.setup.players;
  return pool.filter((player) => player.id !== voterId);
}

export function voteSummary(session: LiarSession): { name: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const suspectId of Object.values(session.votes)) {
    counts.set(suspectId, (counts.get(suspectId) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([id, count]) => ({ name: getPlayerName(session, id), count }))
    .sort((a, b) => b.count - a.count);
}
