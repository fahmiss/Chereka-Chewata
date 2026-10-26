import { pickInsiderWord } from '../../content/insider';
import { localizeText } from '../../content/localize';
import { createId, pickRandom, playerName, shuffle, voteCounts, voteLeaders } from '../shared/utils';
import {
  INSIDER_MAX_PLAYERS,
  INSIDER_MIN_PLAYERS,
  type ContentLanguage,
  type InsiderRole,
  type InsiderSession,
  type InsiderSetup,
  type Player,
} from './types';

type CreateOptions = {
  sessionId?: string;
  excludedWordIds?: string[];
  /** The Master role moves one seat on each rematch. */
  previousMasterId?: string;
};

export function createInsiderSession(
  setup: InsiderSetup,
  contentLanguage: ContentLanguage = 'en',
  options: CreateOptions = {},
): InsiderSession | { error: string } {
  const count = setup.players.length;
  if (count < INSIDER_MIN_PLAYERS || count > INSIDER_MAX_PLAYERS) {
    return { error: `Insider needs ${INSIDER_MIN_PLAYERS}–${INSIDER_MAX_PLAYERS} players.` };
  }
  if (setup.players.some((player) => !player.displayName.trim())) {
    return { error: 'Every player needs a name.' };
  }
  if (setup.categoryIds.length === 0) return { error: 'Pick at least one category.' };
  if (setup.contentLevels.length === 0) return { error: 'Pick at least one content level.' };

  const excluded = options.excludedWordIds ?? [];
  const word =
    pickInsiderWord({
      categoryIds: setup.categoryIds,
      contentLevels: setup.contentLevels,
      contentLanguage,
      excludeIds: excluded,
    }) ??
    // Every word has been played this session: start the deck over.
    pickInsiderWord({
      categoryIds: setup.categoryIds,
      contentLevels: setup.contentLevels,
      contentLanguage,
    });
  if (!word) return { error: 'No words match these categories and levels.' };

  const ids = setup.players.map((player) => player.id);
  const previous = options.previousMasterId ? ids.indexOf(options.previousMasterId) : -1;
  const masterId = previous >= 0 ? ids[(previous + 1) % ids.length]! : pickRandom(ids)!;
  const insiderId = pickRandom(ids.filter((id) => id !== masterId))!;

  return {
    sessionId: options.sessionId ?? createId('sess'),
    setup,
    contentLanguage,
    phase: 'master_intro',
    word,
    masterId,
    insiderId,
    revealOrder: ids,
    revealIndex: 0,
    solvedWithSeconds: null,
    voteOrder: [],
    voteIndex: 0,
    votes: {},
    eligibleSuspectIds: null,
    runoffRound: 0,
    accusedPlayerId: null,
    winner: null,
    excludedWordIds: excluded.includes(word.id) ? [word.id] : [...excluded, word.id],
  };
}

export function rematchInsiderSession(session: InsiderSession) {
  return createInsiderSession(session.setup, session.contentLanguage, {
    sessionId: session.sessionId,
    excludedWordIds: session.excludedWordIds,
    previousMasterId: session.masterId,
  });
}

export function getInsiderPlayerName(session: InsiderSession, playerId: string): string {
  return playerName(session.setup.players, playerId);
}

export function insiderWordText(session: InsiderSession): string {
  return localizeText(session.contentLanguage, {
    en: session.word.word_en,
    am: session.word.word_am,
  });
}

export function roleOf(session: InsiderSession, playerId: string): InsiderRole {
  if (playerId === session.masterId) return 'master';
  if (playerId === session.insiderId) return 'insider';
  return 'common';
}

export function currentRevealPlayerId(session: InsiderSession): string | null {
  return session.revealOrder[session.revealIndex] ?? null;
}

export function currentVoterId(session: InsiderSession): string | null {
  return session.voteOrder[session.voteIndex] ?? null;
}

/** The Master is public and cannot be the Insider. */
export function suspects(session: InsiderSession): Player[] {
  const pool = session.setup.players.filter((player) => player.id !== session.masterId);
  if (!session.eligibleSuspectIds) return pool;
  return pool.filter((player) => session.eligibleSuspectIds!.includes(player.id));
}

export function voteSuspectOptions(session: InsiderSession): Player[] {
  const voterId = currentVoterId(session);
  return suspects(session).filter((player) => player.id !== voterId);
}

export function insiderVoteSummary(session: InsiderSession) {
  return voteCounts(session.setup.players, session.votes);
}

export function startReveals(session: InsiderSession): InsiderSession {
  if (session.phase !== 'master_intro') return session;
  return { ...session, phase: 'handoff' };
}

export function readyToReveal(session: InsiderSession): InsiderSession {
  if (session.phase === 'handoff') return { ...session, phase: 'reveal' };
  if (session.phase === 'voting_handoff') return { ...session, phase: 'voting_select' };
  return session;
}

export function hideRevealAndContinue(session: InsiderSession): InsiderSession {
  if (session.phase !== 'reveal') return session;
  const revealIndex = session.revealIndex + 1;
  if (revealIndex < session.revealOrder.length) {
    return { ...session, revealIndex, phase: 'handoff' };
  }
  return { ...session, revealIndex, phase: 'quiz' };
}

export function wordFound(session: InsiderSession, secondsLeft: number): InsiderSession {
  if (session.phase !== 'quiz') return session;
  return { ...session, phase: 'discussion', solvedWithSeconds: Math.max(0, Math.round(secondsLeft)) };
}

/** The clock ran out before anyone said the word: everyone loses. */
export function quizTimedOut(session: InsiderSession): InsiderSession {
  if (session.phase !== 'quiz') return session;
  return { ...session, phase: 'result', winner: 'nobody' };
}

export function startVoting(session: InsiderSession): InsiderSession {
  if (session.phase !== 'discussion') return session;
  const reset = {
    voteIndex: 0,
    votes: {},
    eligibleSuspectIds: null,
    runoffRound: 0,
    accusedPlayerId: null,
  };
  if (session.setup.votingMode === 'group') {
    return { ...session, ...reset, phase: 'group_accuse', voteOrder: [] };
  }
  return {
    ...session,
    ...reset,
    phase: 'voting_handoff',
    voteOrder: shuffle(session.setup.players.map((player) => player.id)),
  };
}

function verdict(session: InsiderSession, accusedId: string | null): InsiderSession {
  return {
    ...session,
    phase: 'result',
    accusedPlayerId: accusedId,
    winner: accusedId === session.insiderId ? 'commons' : 'insider',
  };
}

export function accusePlayer(session: InsiderSession, playerId: string): InsiderSession {
  if (session.phase !== 'group_accuse') return session;
  if (!suspects(session).some((player) => player.id === playerId)) return session;
  return verdict(session, playerId);
}

export function resolveGroupDeadlock(session: InsiderSession): InsiderSession {
  if (session.phase !== 'group_accuse') return session;
  return verdict(session, null);
}

function resolveVotes(session: InsiderSession): InsiderSession {
  const leaders = voteLeaders(session.votes, session.eligibleSuspectIds);
  if (leaders.length === 0) return verdict(session, null);
  if (leaders.length === 1) return verdict(session, leaders[0]!);
  if (session.runoffRound >= 1) return verdict(session, null);

  // Runoff between the tied players; they sit this vote out when enough remain.
  const others = session.setup.players.map((player) => player.id).filter((id) => !leaders.includes(id));
  const voteOrder = shuffle(others.length >= 2 ? others : session.setup.players.map((player) => player.id));
  return {
    ...session,
    phase: 'voting_handoff',
    voteOrder,
    voteIndex: 0,
    votes: {},
    eligibleSuspectIds: leaders,
    runoffRound: session.runoffRound + 1,
  };
}

export function castVote(session: InsiderSession, suspectId: string): InsiderSession {
  if (session.phase !== 'voting_select') return session;
  const voterId = currentVoterId(session);
  if (!voterId || voterId === suspectId) return session;
  if (!suspects(session).some((player) => player.id === suspectId)) return session;

  const votes = { ...session.votes, [voterId]: suspectId };
  const voteIndex = session.voteIndex + 1;
  if (voteIndex < session.voteOrder.length) {
    return { ...session, votes, voteIndex, phase: 'voting_handoff' };
  }
  return resolveVotes({ ...session, votes, voteIndex });
}
