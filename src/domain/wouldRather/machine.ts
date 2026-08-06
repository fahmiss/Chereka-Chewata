import { pickWouldRatherDeck } from '../../content/wouldRather';
import {
  createId,
  type WouldRatherSession,
  type WouldRatherSetup,
  type WouldRatherSide,
} from './types';
import { recordPlayed } from '../../storage/contentHistory';

export function currentDilemma(session: WouldRatherSession) {
  return session.deck[session.index] ?? null;
}

export function createWouldRatherSession(setup: WouldRatherSetup): WouldRatherSession | { error: string } {
  if (!setup.categoryIds.length) return { error: 'Pick at least one category.' };
  if (!setup.contentLevels.length) return { error: 'Pick at least one content level.' };
  const deck = pickWouldRatherDeck({ ...setup, count: Math.max(1, setup.cardCount) });
  if (!deck.length) return { error: 'No dilemmas available for these filters.' };
  recordPlayed('would_you_rather', deck[0]!.id);
  return { sessionId: createId('sess'), setup, phase: 'choice', deck, index: 0, playedCount: 0, chosen: null };
}

/**
 * Records the option the room agreed on. Re-tapping the other side changes the
 * verdict, so a misread of the table is one tap to fix rather than a dead end.
 */
export function chooseSide(session: WouldRatherSession, side: WouldRatherSide): WouldRatherSession {
  if (session.phase !== 'choice' && session.phase !== 'discuss') return session;
  return { ...session, phase: 'discuss', chosen: side };
}

function advance(session: WouldRatherSession, played: boolean): WouldRatherSession {
  const index = session.index + 1;
  const playedCount = session.playedCount + (played ? 1 : 0);
  if (index >= session.deck.length) {
    return { ...session, phase: 'ended', index, playedCount, chosen: null };
  }
  recordPlayed('would_you_rather', session.deck[index]!.id);
  return { ...session, phase: 'choice', index, playedCount, chosen: null };
}

export function skipDilemma(session: WouldRatherSession) {
  return session.phase === 'choice' || session.phase === 'discuss' ? advance(session, false) : session;
}

export function nextDilemma(session: WouldRatherSession) {
  return session.phase === 'discuss' ? advance(session, true) : session;
}

export function endSession(session: WouldRatherSession): WouldRatherSession {
  return { ...session, phase: 'ended', chosen: null };
}

export function rematchSession(session: WouldRatherSession): WouldRatherSession | { error: string } {
  const created = createWouldRatherSession(session.setup);
  return 'error' in created ? created : { ...created, sessionId: session.sessionId };
}
