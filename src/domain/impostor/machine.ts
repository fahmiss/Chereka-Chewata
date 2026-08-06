import { pickImpostorWord } from '../../content/impostor';
import {
  createId,
  TWO_IMPOSTOR_ENABLED,
  type ContentLanguage,
  type ImpostorSession,
  type ImpostorSetup,
  type Player,
  type RoleAssignment,
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

export function getPlayerName(session: ImpostorSession, playerId: string): string {
  return playerMap(session.setup.players).get(playerId)?.displayName ?? 'Player';
}

export function getRole(session: ImpostorSession, playerId: string): RoleAssignment | undefined {
  return session.roles.find((role) => role.playerId === playerId);
}

export function isImpostor(session: ImpostorSession, playerId: string): boolean {
  return getRole(session, playerId)?.role === 'impostor';
}

function assignRoles(players: Player[], impostorCount: 1 | 2): RoleAssignment[] {
  const shuffled = shuffle(players.map((player) => player.id));
  const impostorIds = new Set(shuffled.slice(0, impostorCount));
  return players.map((player) =>
    impostorIds.has(player.id)
      ? { playerId: player.id, role: 'impostor' }
      : { playerId: player.id, role: 'crew' },
  );
}

function rotatedOrder(playerIds: string[], startId: string): string[] {
  const start = playerIds.indexOf(startId);
  if (start < 0) return playerIds;
  return [...playerIds.slice(start), ...playerIds.slice(0, start)];
}

export function createImpostorSession(
  setup: ImpostorSetup,
  excludedWordIds: string[] = [],
  contentLanguage: ContentLanguage = 'en',
): ImpostorSession | { error: string } {
  if (setup.players.length < 3) {
    return { error: 'Impostor needs at least 3 players.' };
  }
  if (setup.categoryIds.length === 0) {
    return { error: 'Pick at least one category.' };
  }
  if (setup.contentLevels.length === 0) {
    return { error: 'Pick at least one content level.' };
  }

  const word = pickImpostorWord({
    categoryIds: setup.categoryIds,
    contentLevels: setup.contentLevels,
    contentLanguage,
    excludeIds: excludedWordIds,
  });

  if (!word) {
    return { error: 'No cards left for these categories and content levels.' };
  }

  // Gated, not deleted: role assignment already handles two, but the round
  // never runs §3.6's second clue-and-vote cycle, so catching one Impostor
  // would settle the round while the other sits undetected.
  const impostorCount: 1 | 2 =
    TWO_IMPOSTOR_ENABLED && setup.impostorCount === 2 && setup.players.length >= 8
      ? 2
      : 1;

  const revealOrder = shuffle(setup.players.map((player) => player.id));
  const roles = assignRoles(setup.players, impostorCount);
  const startId = setup.randomStartPlayer
    ? revealOrder[Math.floor(Math.random() * revealOrder.length)]!
    : setup.players[0]!.id;
  const clueOrder = rotatedOrder(
    setup.players.map((player) => player.id),
    startId,
  );

  return {
    sessionId: createId('sess'),
    setup,
    contentLanguage,
    phase: 'handoff',
    word,
    roles,
    revealOrder,
    revealIndex: 0,
    clueOrder,
    clueIndex: 0,
    voteOrder: [],
    voteIndex: 0,
    votes: {},
    eligibleSuspectIds: null,
    runoffRound: 0,
    accusedPlayerId: null,
    accusedIsImpostor: null,
    winner: null,
    excludedWordIds: [...excludedWordIds, word.id],
  };
}

export function readyToReveal(session: ImpostorSession): ImpostorSession {
  if (session.phase !== 'handoff' && session.phase !== 'voting_handoff') return session;
  if (session.phase === 'handoff') return { ...session, phase: 'reveal' };
  return { ...session, phase: 'voting_select' };
}

export function hideRevealAndContinue(session: ImpostorSession): ImpostorSession {
  if (session.phase !== 'reveal') return session;
  const nextIndex = session.revealIndex + 1;
  if (nextIndex >= session.revealOrder.length) {
    // Skip the dedicated clue-order screen — land on the first turn.
    return { ...session, phase: 'clues', revealIndex: nextIndex, clueIndex: 0 };
  }
  return { ...session, phase: 'handoff', revealIndex: nextIndex };
}

/** Legacy: older sessions may still sit on `starting_player`. */
export function beginClues(session: ImpostorSession): ImpostorSession {
  if (session.phase !== 'starting_player' && session.phase !== 'clues') return session;
  if (session.phase === 'clues') return session;
  return { ...session, phase: 'clues', clueIndex: 0 };
}

/** One shared clue screen — phone does not step through each player. */
export function nextClueOrDiscuss(session: ImpostorSession): ImpostorSession {
  if (session.phase !== 'clues' && session.phase !== 'starting_player') return session;
  return {
    ...session,
    phase: 'discussion',
    clueIndex: session.clueOrder.length,
  };
}

export function startVoting(session: ImpostorSession): ImpostorSession {
  if (session.phase !== 'discussion') return session;

  if (session.setup.votingMode === 'group') {
    return {
      ...session,
      phase: 'group_accuse',
      voteOrder: [],
      voteIndex: 0,
      votes: {},
      eligibleSuspectIds: null,
      runoffRound: 0,
      accusedPlayerId: null,
      accusedIsImpostor: null,
    };
  }

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
    accusedIsImpostor: null,
  };
}

/** Group mode: table already decided — record the accused player. */
export function accusePlayer(session: ImpostorSession, playerId: string): ImpostorSession {
  if (session.phase !== 'group_accuse') return session;
  if (!session.setup.players.some((player) => player.id === playerId)) return session;

  const accusedIsImpostor = isImpostor(session, playerId);
  return {
    ...session,
    phase: 'accusation',
    accusedPlayerId: playerId,
    accusedIsImpostor,
    winner: accusedIsImpostor ? null : 'impostor',
  };
}

/** Group mode: table cannot agree — Impostor survives (same as a second-tie). */
export function resolveGroupDeadlock(session: ImpostorSession): ImpostorSession {
  if (session.phase !== 'group_accuse') return session;
  return {
    ...session,
    phase: 'result',
    winner: 'impostor',
    accusedPlayerId: null,
    accusedIsImpostor: null,
  };
}

export function beginVoteSelect(session: ImpostorSession): ImpostorSession {
  if (session.phase !== 'voting_handoff') return session;
  return { ...session, phase: 'voting_select' };
}

function tallyVotes(
  votes: Record<string, string>,
  eligible: string[] | null,
): { counts: Map<string, number>; leaders: string[] } {
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
  return { counts, leaders };
}

export function castVote(session: ImpostorSession, suspectId: string): ImpostorSession {
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

function resolveVotes(session: ImpostorSession): ImpostorSession {
  const { leaders } = tallyVotes(session.votes, session.eligibleSuspectIds);

  if (leaders.length === 0) {
    return { ...session, phase: 'result', winner: 'impostor' };
  }

  if (leaders.length > 1) {
    if (session.runoffRound >= 1) {
      return {
        ...session,
        phase: 'result',
        winner: 'impostor',
        accusedPlayerId: null,
        accusedIsImpostor: null,
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
  const accusedIsImpostor = isImpostor(session, accusedPlayerId);

  if (!accusedIsImpostor) {
    return {
      ...session,
      phase: 'accusation',
      accusedPlayerId,
      accusedIsImpostor: false,
      winner: 'impostor',
    };
  }

  return {
    ...session,
    phase: 'accusation',
    accusedPlayerId,
    accusedIsImpostor: true,
    winner: null,
  };
}

export function continueAfterAccusation(session: ImpostorSession): ImpostorSession {
  if (session.phase !== 'accusation') return session;
  if (session.accusedIsImpostor) {
    return { ...session, phase: 'final_guess' };
  }
  return { ...session, phase: 'result', winner: 'impostor' };
}

export function resolveFinalGuess(
  session: ImpostorSession,
  correct: boolean,
): ImpostorSession {
  if (session.phase !== 'final_guess') return session;
  return {
    ...session,
    phase: 'result',
    winner: correct ? 'impostor' : 'crew',
  };
}

export function rematchSession(session: ImpostorSession): ImpostorSession | { error: string } {
  const created = createImpostorSession(
    session.setup,
    session.excludedWordIds,
    session.contentLanguage,
  );
  if ('error' in created) return created;
  // Keep the route session id stable so rematch does not orphan /session/[id].
  return { ...created, sessionId: session.sessionId };
}

export function currentRevealPlayerId(session: ImpostorSession): string | null {
  return session.revealOrder[session.revealIndex] ?? null;
}

export function currentCluePlayerId(session: ImpostorSession): string | null {
  return session.clueOrder[session.clueIndex] ?? null;
}

export function currentVoterId(session: ImpostorSession): string | null {
  return session.voteOrder[session.voteIndex] ?? null;
}

export function voteSuspectOptions(session: ImpostorSession): Player[] {
  const voterId = currentVoterId(session);
  const pool = session.eligibleSuspectIds
    ? session.setup.players.filter((player) => session.eligibleSuspectIds!.includes(player.id))
    : session.setup.players;
  return pool.filter((player) => player.id !== voterId);
}

export function voteSummary(session: ImpostorSession): { name: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const suspectId of Object.values(session.votes)) {
    counts.set(suspectId, (counts.get(suspectId) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([id, count]) => ({ name: getPlayerName(session, id), count }))
    .sort((a, b) => b.count - a.count);
}
