import { createId, playerName, shuffle } from '../shared/utils';
import {
  WINK_DETECTIVE_GUESSES,
  WINK_DETECTIVE_MIN_PLAYERS,
  WINK_MAX_PLAYERS,
  WINK_MIN_PLAYERS,
  WINK_TWO_KILLERS_MIN_PLAYERS,
  type ContentLanguage,
  type Player,
  type WinkKillerSession,
  type WinkKillerSetup,
  type WinkOutReason,
  type WinkRole,
} from './types';

export function effectiveKillerCount(setup: WinkKillerSetup): 1 | 2 {
  return setup.killerCount === 2 && setup.players.length >= WINK_TWO_KILLERS_MIN_PLAYERS ? 2 : 1;
}

export function detectiveEnabled(setup: WinkKillerSetup): boolean {
  return setup.detective && setup.players.length >= WINK_DETECTIVE_MIN_PLAYERS;
}

export function createWinkKillerSession(
  setup: WinkKillerSetup,
  contentLanguage: ContentLanguage = 'en',
  sessionId: string = createId('sess'),
): WinkKillerSession | { error: string } {
  if (setup.players.length < WINK_MIN_PLAYERS || setup.players.length > WINK_MAX_PLAYERS) {
    return { error: `Wink Killer needs ${WINK_MIN_PLAYERS}–${WINK_MAX_PLAYERS} players.` };
  }
  if (setup.players.some((player) => !player.displayName.trim())) {
    return { error: 'Every player needs a name.' };
  }

  const killers = effectiveKillerCount(setup);
  const withDetective = detectiveEnabled(setup);
  const dealt = shuffle(setup.players.map((player) => player.id));
  const roles: Record<string, WinkRole> = {};
  dealt.forEach((id, index) => {
    roles[id] =
      index < killers ? 'killer' : withDetective && index === killers ? 'detective' : 'citizen';
  });

  return {
    sessionId,
    setup: { ...setup, killerCount: killers, detective: withDetective },
    contentLanguage,
    phase: 'handoff',
    roles,
    revealOrder: setup.players.map((player) => player.id),
    revealIndex: 0,
    outIds: [],
    outReasons: {},
    detectiveGuessesLeft: WINK_DETECTIVE_GUESSES,
    accuserId: null,
    lastAccusation: null,
    winner: null,
  };
}

export function rematchWinkKillerSession(session: WinkKillerSession) {
  return createWinkKillerSession(session.setup, session.contentLanguage, session.sessionId);
}

export function getWinkPlayerName(session: WinkKillerSession, playerId: string): string {
  return playerName(session.setup.players, playerId);
}

export function currentRevealPlayerId(session: WinkKillerSession): string | null {
  return session.revealOrder[session.revealIndex] ?? null;
}

export function roleOf(session: WinkKillerSession, playerId: string): WinkRole {
  return session.roles[playerId] ?? 'citizen';
}

export function detectiveId(session: WinkKillerSession): string | null {
  return Object.keys(session.roles).find((id) => session.roles[id] === 'detective') ?? null;
}

export function killerIds(session: WinkKillerSession): string[] {
  return session.setup.players
    .map((player) => player.id)
    .filter((id) => session.roles[id] === 'killer');
}

export function isOut(session: WinkKillerSession, playerId: string): boolean {
  return session.outIds.includes(playerId);
}

export function alivePlayers(session: WinkKillerSession): Player[] {
  return session.setup.players.filter((player) => !isOut(session, player.id));
}

/**
 * Who can be marked as winked out. The Detective stands in the open and
 * cannot be winked, so they are never offered.
 */
export function winkablePlayers(session: WinkKillerSession): Player[] {
  return alivePlayers(session).filter((player) => roleOf(session, player.id) !== 'detective');
}

function settle(session: WinkKillerSession): WinkKillerSession {
  // A killer cannot be winked, so marking one out is a mis-tap: it must not
  // end the game (that would reveal them) and stays undoable.
  const killersLeft = killerIds(session).filter(
    (id) => !isOut(session, id) || session.outReasons[id] === 'winked',
  ).length;
  if (killersLeft === 0) return { ...session, winner: 'citizens' };

  if (session.setup.detective) {
    const citizensLeft = alivePlayers(session).filter(
      (player) => roleOf(session, player.id) === 'citizen',
    ).length;
    if (session.detectiveGuessesLeft <= 0 || citizensLeft === 0) {
      return { ...session, winner: 'killers' };
    }
    return session;
  }

  const othersLeft = alivePlayers(session).filter(
    (player) => roleOf(session, player.id) !== 'killer',
  ).length;
  if (othersLeft <= 1) return { ...session, winner: 'killers' };
  return session;
}

function knockOut(
  session: WinkKillerSession,
  playerId: string,
  reason: WinkOutReason,
): WinkKillerSession {
  if (isOut(session, playerId)) return session;
  return {
    ...session,
    outIds: [...session.outIds, playerId],
    outReasons: { ...session.outReasons, [playerId]: reason },
  };
}

export function readyToReveal(session: WinkKillerSession): WinkKillerSession {
  if (session.phase !== 'handoff') return session;
  return { ...session, phase: 'reveal' };
}

export function hideRevealAndContinue(session: WinkKillerSession): WinkKillerSession {
  if (session.phase !== 'reveal') return session;
  const revealIndex = session.revealIndex + 1;
  if (revealIndex < session.revealOrder.length) {
    return { ...session, revealIndex, phase: 'handoff' };
  }
  return {
    ...session,
    revealIndex,
    phase: session.setup.detective ? 'detective_announce' : 'play',
  };
}

export function startPlay(session: WinkKillerSession): WinkKillerSession {
  if (session.phase !== 'detective_announce' && session.phase !== 'accuse_result') return session;
  return { ...session, phase: session.winner ? 'result' : 'play', accuserId: null };
}

export function openMarkOut(session: WinkKillerSession): WinkKillerSession {
  if (session.phase !== 'play') return session;
  return { ...session, phase: 'mark_out' };
}

export function markWinked(session: WinkKillerSession, playerId: string): WinkKillerSession {
  if (session.phase !== 'mark_out') return session;
  if (!winkablePlayers(session).some((player) => player.id === playerId)) return session;
  const settled = settle(knockOut(session, playerId, 'winked'));
  return { ...settled, phase: settled.winner ? 'result' : 'play' };
}

/**
 * Bring a winked-out player back, for a mis-tap. Works on any wink-out, not
 * just the latest, so a Killer marked out by mistake can always be restored
 * and stays catchable. Accusation results stand.
 */
export function restoreWinked(session: WinkKillerSession, playerId: string): WinkKillerSession {
  if (session.phase !== 'play' || session.outReasons[playerId] !== 'winked') return session;
  const outReasons = { ...session.outReasons };
  delete outReasons[playerId];
  return { ...session, outIds: session.outIds.filter((id) => id !== playerId), outReasons };
}

export function cancelAction(session: WinkKillerSession): WinkKillerSession {
  if (
    session.phase !== 'mark_out' &&
    session.phase !== 'accuse_accuser' &&
    session.phase !== 'accuse_target'
  ) {
    return session;
  }
  return { ...session, phase: 'play', accuserId: null };
}

export function openAccusation(session: WinkKillerSession): WinkKillerSession {
  if (session.phase !== 'play') return session;
  if (session.setup.detective) {
    return { ...session, phase: 'accuse_target', accuserId: detectiveId(session) };
  }
  return { ...session, phase: 'accuse_accuser', accuserId: null };
}

export function chooseAccuser(session: WinkKillerSession, playerId: string): WinkKillerSession {
  if (session.phase !== 'accuse_accuser') return session;
  if (isOut(session, playerId)) return session;
  return { ...session, phase: 'accuse_target', accuserId: playerId };
}

export function accuseTargets(session: WinkKillerSession): Player[] {
  return alivePlayers(session).filter((player) => player.id !== session.accuserId);
}

export function accuse(session: WinkKillerSession, accusedId: string): WinkKillerSession {
  if (session.phase !== 'accuse_target') return session;
  if (!accuseTargets(session).some((player) => player.id === accusedId)) return session;

  const correct = roleOf(session, accusedId) === 'killer';
  const lastAccusation = { accuserId: session.accuserId, accusedId, correct };
  let next: WinkKillerSession = { ...session, lastAccusation };

  if (correct) {
    next = knockOut(next, accusedId, 'caught');
  } else if (session.setup.detective) {
    next = { ...next, detectiveGuessesLeft: session.detectiveGuessesLeft - 1 };
  } else if (session.accuserId) {
    next = knockOut(next, session.accuserId, 'wrong_accusation');
  }

  return { ...settle(next), phase: 'accuse_result' };
}
