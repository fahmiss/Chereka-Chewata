import { pickBombDeck } from '../../content/bomb';
import { recordPlayed } from '../../storage/contentHistory';
import {
  BOMB_MAX_PLAYERS,
  BOMB_MIN_PLAYERS,
  createId,
  type BombSession,
  type BombSetup,
  type ContentLanguage,
} from './types';

const FUSE_MIN_MS = 18_000;
const FUSE_MAX_MS = 32_000;

function randomFuseMs(): number {
  return Math.floor(FUSE_MIN_MS + Math.random() * (FUSE_MAX_MS - FUSE_MIN_MS + 1));
}

export function currentBombCard(session: BombSession) {
  return session.deck[session.cardIndex] ?? null;
}

export function getBombPlayerName(session: BombSession, playerId: string): string {
  return session.setup.players.find((player) => player.id === playerId)?.displayName ?? 'Player';
}

export function createBombSession(
  setup: BombSetup,
  contentLanguage: ContentLanguage = 'en',
): BombSession | { error: string } {
  if (setup.players.length < BOMB_MIN_PLAYERS || setup.players.length > BOMB_MAX_PLAYERS) {
    return { error: `Who's Got the Bomb needs ${BOMB_MIN_PLAYERS}–${BOMB_MAX_PLAYERS} players.` };
  }
  if (setup.players.some((player) => !player.displayName.trim())) {
    return { error: 'Every player needs a name.' };
  }
  if (setup.categoryIds.length === 0 || setup.contentLevels.length === 0) {
    return { error: 'Pick at least one category and content level.' };
  }

  const deck = pickBombDeck({
    categoryIds: setup.categoryIds,
    contentLevels: setup.contentLevels,
    contentLanguage,
  });
  if (deck.length === 0) return { error: 'No category cards match this setup.' };

  recordPlayed('bomb', deck[0]!.id);

  return {
    sessionId: createId('sess'),
    setup,
    contentLanguage,
    phase: 'ready',
    deck,
    cardIndex: 0,
    startingPlayerId: setup.players[Math.floor(Math.random() * setup.players.length)]!.id,
    fuseEndsAt: null,
    fuseRemainingMs: null,
    roundNumber: 1,
  };
}

export function startBomb(session: BombSession, now = Date.now()): BombSession {
  if (session.phase !== 'ready') return session;
  return {
    ...session,
    phase: 'playing',
    fuseEndsAt: now + randomFuseMs(),
    fuseRemainingMs: null,
  };
}

export function pauseBomb(session: BombSession, now = Date.now()): BombSession {
  if (session.phase !== 'playing' || !session.fuseEndsAt) return session;
  if (session.fuseEndsAt <= now) return explodeBomb(session);
  return {
    ...session,
    phase: 'paused',
    fuseRemainingMs: session.fuseEndsAt - now,
    fuseEndsAt: null,
  };
}

export function resumeBomb(session: BombSession, now = Date.now()): BombSession {
  if (session.phase !== 'paused' || !session.fuseRemainingMs) return session;
  return {
    ...session,
    phase: 'playing',
    fuseEndsAt: now + session.fuseRemainingMs,
    fuseRemainingMs: null,
  };
}

export function explodeBomb(session: BombSession): BombSession {
  if (session.phase !== 'playing') return session;
  return {
    ...session,
    phase: 'exploded',
    fuseEndsAt: null,
    fuseRemainingMs: null,
  };
}

export function continueAfterExplosion(session: BombSession): BombSession {
  if (session.phase !== 'exploded') return session;

  const cardIndex = (session.cardIndex + 1) % session.deck.length;
  recordPlayed('bomb', session.deck[cardIndex]!.id);
  return {
    ...session,
    phase: 'ready',
    cardIndex,
    startingPlayerId:
      session.setup.players[Math.floor(Math.random() * session.setup.players.length)]!.id,
    roundNumber: session.roundNumber + 1,
  };
}

export function skipBombCard(session: BombSession): BombSession {
  if (session.phase !== 'ready') return session;
  const cardIndex = (session.cardIndex + 1) % session.deck.length;
  recordPlayed('bomb', session.deck[cardIndex]!.id);
  return { ...session, cardIndex };
}
