import type { BasePlayerSetup, ContentLanguage, Player } from '../shared/types';

export type { ContentLanguage, Player };

export type WinkRole = 'killer' | 'citizen' | 'detective';

export type WinkKillerSetup = BasePlayerSetup & {
  killerCount: 1 | 2;
  /** A public Detective is the only one who may accuse, with three guesses. */
  detective: boolean;
};

export type WinkOutReason = 'winked' | 'wrong_accusation' | 'caught';

export type WinkPhase =
  | 'handoff'
  | 'reveal'
  | 'detective_announce'
  | 'play'
  | 'mark_out'
  | 'accuse_accuser'
  | 'accuse_target'
  | 'accuse_result'
  | 'result';

export type WinkAccusation = {
  accuserId: string | null;
  accusedId: string;
  correct: boolean;
};

/** In-memory only — roles are never persisted. */
export type WinkKillerSession = {
  sessionId: string;
  setup: WinkKillerSetup;
  contentLanguage: ContentLanguage;
  phase: WinkPhase;
  roles: Record<string, WinkRole>;
  revealOrder: string[];
  revealIndex: number;
  /** Players out of the game, in the order they went out. */
  outIds: string[];
  outReasons: Record<string, WinkOutReason>;
  detectiveGuessesLeft: number;
  accuserId: string | null;
  lastAccusation: WinkAccusation | null;
  winner: 'citizens' | 'killers' | null;
};

export const WINK_MIN_PLAYERS = 4;
export const WINK_MAX_PLAYERS = 30;
export const WINK_DETECTIVE_MIN_PLAYERS = 5;
export const WINK_TWO_KILLERS_MIN_PLAYERS = 8;
export const WINK_DETECTIVE_GUESSES = 3;
