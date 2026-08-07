import { pickMostLikelyDeck } from '../../content/mostLikely';
import {
  createId,
  type ContentLanguage,
  type MostLikelySession,
  type MostLikelySetup,
} from './types';
import { recordPlayed } from '../../storage/contentHistory';

export function currentPrompt(session: MostLikelySession) {
  return session.deck[session.index] ?? null;
}

export function createMostLikelySession(
  setup: MostLikelySetup,
  contentLanguage: ContentLanguage = 'en',
): MostLikelySession | { error: string } {
  if (setup.categoryIds.length === 0) {
    return { error: 'Pick at least one category.' };
  }
  if (setup.contentLevels.length === 0) {
    return { error: 'Pick at least one content level.' };
  }

  const deck = pickMostLikelyDeck({
    categoryIds: setup.categoryIds,
    contentLevels: setup.contentLevels,
    contentLanguage,
    count: Math.max(1, setup.cardCount),
  });

  if (deck.length === 0) {
    return { error: 'No prompts left for these categories and content levels.' };
  }
  recordPlayed('most_likely', deck[0]!.id);

  return {
    sessionId: createId('sess'),
    setup,
    contentLanguage,
    phase: 'prompt',
    deck,
    index: 0,
    playedCount: 0,
    countdownValue: null,
  };
}

export function beginCountdown(session: MostLikelySession): MostLikelySession {
  if (session.phase !== 'prompt') return session;
  return { ...session, phase: 'countdown', countdownValue: 3 };
}

export function tickCountdown(session: MostLikelySession): MostLikelySession {
  if (session.phase !== 'countdown' || session.countdownValue === null) return session;
  if (session.countdownValue === 0) {
    return { ...session, phase: 'discuss', countdownValue: null };
  }
  const next = (session.countdownValue - 1) as 3 | 2 | 1 | 0;
  return { ...session, countdownValue: next };
}

export function skipPrompt(session: MostLikelySession): MostLikelySession {
  if (session.phase !== 'prompt' && session.phase !== 'discuss') return session;
  return advance(session, false);
}

export function nextPrompt(session: MostLikelySession): MostLikelySession {
  if (session.phase !== 'discuss') return session;
  return advance(session, true);
}

function advance(session: MostLikelySession, countPlayed: boolean): MostLikelySession {
  const playedCount = countPlayed ? session.playedCount + 1 : session.playedCount;
  const nextIndex = session.index + 1;
  if (nextIndex >= session.deck.length) {
    return {
      ...session,
      phase: 'ended',
      index: nextIndex,
      playedCount,
      countdownValue: null,
    };
  }
  recordPlayed('most_likely', session.deck[nextIndex]!.id);
  return {
    ...session,
    phase: 'prompt',
    index: nextIndex,
    playedCount,
    countdownValue: null,
  };
}

export function endSession(session: MostLikelySession): MostLikelySession {
  return {
    ...session,
    phase: 'ended',
    countdownValue: null,
  };
}

export function rematchSession(session: MostLikelySession): MostLikelySession | { error: string } {
  const created = createMostLikelySession(session.setup, session.contentLanguage);
  if ('error' in created) return created;
  return { ...created, sessionId: session.sessionId };
}
