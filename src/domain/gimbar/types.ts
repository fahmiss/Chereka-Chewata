import type { BasePlayerSetup, ContentLanguage, ContentLevel, Player } from '../shared/types';

export type { ContentLanguage, ContentLevel, Player };

export type GimbarCard = {
  id: string;
  text_en: string;
  text_am?: string;
  category_id: string;
  /** Optional sub-topic markers (e.g. Act it out) — not a second category. */
  tags?: string[];
  content_level: ContentLevel;
  active: boolean;
};

export type GimbarCategory = {
  id: string;
  name_en: string;
  name_am?: string;
  sort_order: number;
  active: boolean;
};

/** Tilt reads the phone's motion sensor; tap uses two big screen halves. */
export type GimbarControl = 'tilt' | 'tap';

export type GimbarSetup = BasePlayerSetup & {
  turnSeconds: number;
  roundsPerPlayer: number;
  control: GimbarControl;
};

export type GimbarResult = 'correct' | 'pass';

export type GimbarPlay = {
  cardId: string;
  text: string;
  result: GimbarResult;
};

export type GimbarPhase = 'ready' | 'playing' | 'paused' | 'summary' | 'final';

/** In-memory only. */
export type GimbarSession = {
  sessionId: string;
  setup: GimbarSetup;
  contentLanguage: ContentLanguage;
  phase: GimbarPhase;
  /** Player ids in turn order; every player guesses once per round. */
  turnOrder: string[];
  turnIndex: number;
  totalTurns: number;
  scores: Record<string, number>;
  deck: GimbarCard[];
  deckIndex: number;
  currentCard: GimbarCard | null;
  /** Cards shown in the current turn, newest last. */
  plays: GimbarPlay[];
};

export const GIMBAR_MIN_PLAYERS = 2;
export const GIMBAR_MAX_PLAYERS = 20;
