import { pickWouldRatherDeck } from '../../content/wouldRather';
import { createId, type WouldRatherSession, type WouldRatherSetup } from './types';

export function currentDilemma(session: WouldRatherSession) {
  return session.deck[session.index] ?? null;
}

export function createWouldRatherSession(setup: WouldRatherSetup): WouldRatherSession | { error: string } {
  if (!setup.categoryIds.length) return { error: 'Pick at least one category.' };
  if (!setup.contentLevels.length) return { error: 'Pick at least one content level.' };
  const deck = pickWouldRatherDeck({ ...setup, count: Math.max(1, setup.cardCount) });
  if (!deck.length) return { error: 'No dilemmas available for these filters.' };
  return { sessionId: createId('sess'), setup, phase: 'choice', deck, index: 0, playedCount: 0, countdownValue: null };
}

export function beginCountdown(session: WouldRatherSession): WouldRatherSession {
  return session.phase === 'choice' ? { ...session, phase: 'countdown', countdownValue: 3 } : session;
}

export function tickCountdown(session: WouldRatherSession): WouldRatherSession {
  if (session.phase !== 'countdown' || session.countdownValue === null) return session;
  if (session.countdownValue === 0) return { ...session, phase: 'discuss', countdownValue: null };
  return { ...session, countdownValue: (session.countdownValue - 1) as 2 | 1 | 0 };
}

function advance(session: WouldRatherSession, played: boolean): WouldRatherSession {
  const index = session.index + 1;
  const playedCount = session.playedCount + (played ? 1 : 0);
  return index >= session.deck.length
    ? { ...session, phase: 'ended', index, playedCount, countdownValue: null }
    : { ...session, phase: 'choice', index, playedCount, countdownValue: null };
}

export function skipDilemma(session: WouldRatherSession) {
  return session.phase === 'choice' || session.phase === 'discuss' ? advance(session, false) : session;
}

export function nextDilemma(session: WouldRatherSession) {
  return session.phase === 'discuss' ? advance(session, true) : session;
}

export function endSession(session: WouldRatherSession): WouldRatherSession {
  return { ...session, phase: 'ended', countdownValue: null };
}

export function rematchSession(session: WouldRatherSession): WouldRatherSession | { error: string } {
  const created = createWouldRatherSession(session.setup);
  return 'error' in created ? created : { ...created, sessionId: session.sessionId };
}
