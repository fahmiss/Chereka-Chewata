import type { ContentLanguage } from '../settings/types';

export type { ContentLanguage };

export type ContentLevel = 'family' | 'friends' | 'spicy';

export type MostLikelyPrompt = {
  id: string;
  prompt_en: string;
  prompt_am?: string;
  category_id: string;
  /** Optional sub-topic markers (e.g. Friends, Family, Addis) — not a second category. */
  tags?: string[];
  content_level: ContentLevel;
  intensity?: string;
  active: boolean;
};

export type MostLikelyCategory = {
  id: string;
  name_en: string;
  name_am?: string;
  sort_order: number;
  active: boolean;
};

export type Player = {
  id: string;
  displayName: string;
};

export type MostLikelySetup = {
  /** Optional — physical pointing needs no names. */
  players: Player[];
  categoryIds: string[];
  contentLevels: ContentLevel[];
  cardCount: number;
  spicyAcknowledged: boolean;
};

export type MostLikelyPhase = 'prompt' | 'countdown' | 'discuss' | 'ended';

export type MostLikelySession = {
  sessionId: string;
  setup: MostLikelySetup;
  contentLanguage: ContentLanguage;
  phase: MostLikelyPhase;
  deck: MostLikelyPrompt[];
  index: number;
  playedCount: number;
  countdownValue: 3 | 2 | 1 | 0 | null;
};

export const MOST_LIKELY_MAX_PLAYERS = 20;

export function defaultMostLikelySetup(): MostLikelySetup {
  return {
    players: [],
    categoryIds: [],
    contentLevels: ['family'],
    cardCount: 20,
    spicyAcknowledged: false,
  };
}

export function defaultPlayers(count: number): Player[] {
  return Array.from({ length: count }, (_, index) => ({
    id: createId('p'),
    displayName: `Player ${index + 1}`,
  }));
}

export function createId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}
