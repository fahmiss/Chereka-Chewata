import { pickGimbarDeck } from '../../content/gimbar';
import { localizeText } from '../../content/localize';
import { recordPlayed } from '../../storage/contentHistory';
import { createId, playerName, shuffle } from '../shared/utils';
import {
  GIMBAR_MAX_PLAYERS,
  GIMBAR_MIN_PLAYERS,
  type ContentLanguage,
  type GimbarCard,
  type GimbarResult,
  type GimbarSession,
  type GimbarSetup,
} from './types';

export function createGimbarSession(
  setup: GimbarSetup,
  contentLanguage: ContentLanguage = 'en',
  sessionId: string = createId('sess'),
): GimbarSession | { error: string } {
  if (setup.players.length < GIMBAR_MIN_PLAYERS || setup.players.length > GIMBAR_MAX_PLAYERS) {
    return { error: `Gimbar needs ${GIMBAR_MIN_PLAYERS}–${GIMBAR_MAX_PLAYERS} players.` };
  }
  if (setup.players.some((player) => !player.displayName.trim())) {
    return { error: 'Every player needs a name.' };
  }
  if (setup.categoryIds.length === 0) return { error: 'Pick at least one category.' };
  if (setup.contentLevels.length === 0) return { error: 'Pick at least one content level.' };

  const deck = pickGimbarDeck({
    categoryIds: setup.categoryIds,
    contentLevels: setup.contentLevels,
    contentLanguage,
  });
  if (deck.length === 0) return { error: 'No cards match these categories and levels.' };

  const rounds = Math.max(1, Math.round(setup.roundsPerPlayer));
  return {
    sessionId,
    setup,
    contentLanguage,
    phase: 'ready',
    turnOrder: setup.players.map((player) => player.id),
    turnIndex: 0,
    totalTurns: setup.players.length * rounds,
    scores: Object.fromEntries(setup.players.map((player) => [player.id, 0])),
    deck,
    deckIndex: 0,
    currentCard: null,
    plays: [],
  };
}

export function rematchGimbarSession(session: GimbarSession) {
  return createGimbarSession(session.setup, session.contentLanguage, session.sessionId);
}

export function currentGuesserId(session: GimbarSession): string {
  return session.turnOrder[session.turnIndex % session.turnOrder.length]!;
}

export function getGimbarPlayerName(session: GimbarSession, playerId: string): string {
  return playerName(session.setup.players, playerId);
}

export function cardText(session: GimbarSession, card: GimbarCard): string {
  return localizeText(session.contentLanguage, { en: card.text_en, am: card.text_am });
}

export function turnCorrectCount(session: GimbarSession): number {
  return session.plays.filter((play) => play.result === 'correct').length;
}

export function currentRound(session: GimbarSession): number {
  return Math.floor(session.turnIndex / session.turnOrder.length) + 1;
}

export function gimbarStandings(session: GimbarSession) {
  return session.setup.players
    .map((player) => ({ id: player.id, name: player.displayName, score: session.scores[player.id] ?? 0 }))
    .sort((a, b) => b.score - a.score);
}

/**
 * Next card from the shuffled deck. A spent deck reshuffles (spec §2.6 allows
 * repeats once exhausted) without showing the same card twice in a row.
 */
function withNextCard(session: GimbarSession): GimbarSession {
  let deck = session.deck;
  let deckIndex = session.deckIndex;
  if (deckIndex >= deck.length) {
    deck = shuffle(deck);
    deckIndex = 0;
    const last = session.currentCard;
    if (deck.length > 1 && last && deck[0]!.id === last.id) {
      [deck[0], deck[1]] = [deck[1]!, deck[0]!];
    }
  }
  const card = deck[deckIndex] ?? null;
  if (card) recordPlayed('gimbar', card.id);
  return { ...session, deck, deckIndex: deckIndex + 1, currentCard: card };
}

export function beginTurn(session: GimbarSession): GimbarSession {
  if (session.phase !== 'ready') return session;
  return withNextCard({ ...session, phase: 'playing', plays: [] });
}

export function markCard(session: GimbarSession, result: GimbarResult): GimbarSession {
  if (session.phase !== 'playing' || !session.currentCard) return session;
  const plays = [
    ...session.plays,
    {
      cardId: session.currentCard.id,
      text: cardText(session, session.currentCard),
      result,
    },
  ];
  return withNextCard({ ...session, plays });
}

/** Hide a reported card without counting it either way. */
export function discardCard(session: GimbarSession): GimbarSession {
  if (session.phase !== 'playing' || !session.currentCard) return session;
  return withNextCard(session);
}

export function pauseTurn(session: GimbarSession): GimbarSession {
  if (session.phase !== 'playing') return session;
  return { ...session, phase: 'paused' };
}

export function resumeTurn(session: GimbarSession): GimbarSession {
  if (session.phase !== 'paused') return session;
  return { ...session, phase: 'playing' };
}

/** Time is up. The card still on the forehead does not count. */
export function expireTurn(session: GimbarSession): GimbarSession {
  if (session.phase !== 'playing' && session.phase !== 'paused') return session;
  return { ...session, phase: 'summary', currentCard: null };
}

/** Fix a mis-read tilt on the summary screen. */
export function togglePlay(session: GimbarSession, index: number): GimbarSession {
  if (session.phase !== 'summary') return session;
  const play = session.plays[index];
  if (!play) return session;
  const plays = session.plays.map((item, itemIndex) =>
    itemIndex === index
      ? { ...item, result: item.result === 'correct' ? ('pass' as const) : ('correct' as const) }
      : item,
  );
  return { ...session, plays };
}

export function confirmSummary(session: GimbarSession): GimbarSession {
  if (session.phase !== 'summary') return session;
  const guesserId = currentGuesserId(session);
  const scores = {
    ...session.scores,
    [guesserId]: (session.scores[guesserId] ?? 0) + turnCorrectCount(session),
  };
  const turnIndex = session.turnIndex + 1;
  return {
    ...session,
    scores,
    turnIndex,
    plays: [],
    phase: turnIndex >= session.totalTurns ? 'final' : 'ready',
  };
}
