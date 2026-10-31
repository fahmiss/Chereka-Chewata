import { pickManNegnIdentities } from '../../content/manNegn';
import { createId } from '../shared/utils';
import type { ContentLanguage } from '../shared/types';
import { recordPlayed } from '../../storage/contentHistory';
import { MAN_NEGN_MAX_PLAYERS, MAN_NEGN_MIN_PLAYERS, type ManNegnSession, type ManNegnSetup } from './types';

export function createManNegnSession(setup: ManNegnSetup, contentLanguage: ContentLanguage = 'en', excludedIdentityIds: string[] = []): ManNegnSession | { error: string } {
  if (setup.players.length < MAN_NEGN_MIN_PLAYERS || setup.players.length > MAN_NEGN_MAX_PLAYERS) return { error: 'Man Negn needs 2–5 players.' };
  if (setup.players.some((player) => !player.displayName.trim())) return { error: 'Every player needs a name.' };
  if (!setup.categoryIds.length) return { error: 'Pick at least one category.' };
  const deck = pickManNegnIdentities({ categoryIds: setup.categoryIds, contentLevels: setup.contentLevels, contentLanguage }, setup.players.length, excludedIdentityIds);
  if (deck.length < setup.players.length) return { error: 'Not enough identities match this setup.' };
  const assignments = Object.fromEntries(setup.players.map((player, index) => [player.id, deck[index]!]));
  const ids = setup.players.map((player) => player.id);
  recordPlayed('man_negn', deck.map((item) => item.id));
  return {
    sessionId: createId('sess'), setup, contentLanguage, phase: 'handoff', assignments,
    revealIndex: 0, activePlayerId: ids[0]!, turnQuestions: 0, lives: Object.fromEntries(ids.map((id) => [id, 2])),
    statuses: Object.fromEntries(ids.map((id) => [id, 'playing'])), finishOrder: [], lastGuess: null,
    excludedIdentityIds: [...excludedIdentityIds, ...deck.map((item) => item.id)],
  };
}

export function rematchManNegnSession(session: ManNegnSession) {
  const next = createManNegnSession(session.setup, session.contentLanguage, session.excludedIdentityIds);
  return 'error' in next ? next : { ...next, sessionId: session.sessionId };
}

export function currentRevealPlayer(session: ManNegnSession) { return session.setup.players[session.revealIndex] ?? null; }
export function playerName(session: ManNegnSession, playerId: string) { return session.setup.players.find((p) => p.id === playerId)?.displayName ?? 'Player'; }
export function activePlayers(session: ManNegnSession) { return session.setup.players.filter((p) => session.statuses[p.id] === 'playing'); }

export function revealOthers(session: ManNegnSession): ManNegnSession { return session.phase === 'handoff' ? { ...session, phase: 'reveal' } : session; }
export function hideAndContinue(session: ManNegnSession): ManNegnSession {
  if (session.phase !== 'reveal') return session;
  const next = session.revealIndex + 1;
  return next < session.setup.players.length ? { ...session, revealIndex: next, phase: 'handoff' } : { ...session, phase: 'play', revealIndex: next };
}

function nextPlayerId(session: ManNegnSession, afterId: string) {
  const ids = session.setup.players.map((p) => p.id);
  const start = ids.indexOf(afterId);
  for (let offset = 1; offset <= ids.length; offset += 1) {
    const id = ids[(start + offset) % ids.length]!;
    if (session.statuses[id] === 'playing') return id;
  }
  return afterId;
}

export function answerYes(session: ManNegnSession): ManNegnSession {
  return session.phase === 'play' ? { ...session, turnQuestions: session.turnQuestions + 1 } : session;
}
export function answerNo(session: ManNegnSession): ManNegnSession {
  return session.phase === 'play'
    ? { ...session, activePlayerId: nextPlayerId(session, session.activePlayerId), turnQuestions: 0 }
    : session;
}
export function startGuess(session: ManNegnSession): ManNegnSession { return session.phase === 'play' ? { ...session, phase: 'guess' } : session; }
export function cancelGuess(session: ManNegnSession): ManNegnSession { return session.phase === 'guess' ? { ...session, phase: 'play' } : session; }
export function startReview(session: ManNegnSession): ManNegnSession {
  return session.phase === 'play' ? { ...session, phase: 'review_handoff' } : session;
}
export function revealReview(session: ManNegnSession): ManNegnSession {
  return session.phase === 'review_handoff' ? { ...session, phase: 'review' } : session;
}
export function finishReview(session: ManNegnSession): ManNegnSession {
  return session.phase === 'review' ? { ...session, phase: 'play' } : session;
}

export function resolveGuess(session: ManNegnSession, correct: boolean): ManNegnSession {
  if (session.phase !== 'guess') return session;
  const id = session.activePlayerId;
  const lives = { ...session.lives };
  const statuses = { ...session.statuses };
  const finishOrder = [...session.finishOrder];
  if (correct) { statuses[id] = 'solved'; finishOrder.push(id); }
  else { lives[id] = Math.max(0, lives[id] - 1); if (lives[id] === 0) statuses[id] = 'out'; }
  return { ...session, lives, statuses, finishOrder, lastGuess: { playerId: id, correct }, phase: 'guess_result' };
}

export function continueAfterGuess(session: ManNegnSession): ManNegnSession {
  if (session.phase !== 'guess_result') return session;
  if (!activePlayers(session).length) return { ...session, phase: 'result' };
  return { ...session, activePlayerId: nextPlayerId(session, session.activePlayerId), turnQuestions: 0, lastGuess: null, phase: 'play' };
}
