import type { ContentLanguage } from '../settings/types';

export type { ContentLanguage };

export type ContentLevel = 'family' | 'friends' | 'spicy';

export type BombCard = {
  id: string;
  prompt_en: string;
  prompt_am?: string;
  category_id: string;
  content_level: ContentLevel;
  active: boolean;
};

export type BombCategory = {
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

export type BombSetup = {
  players: Player[];
  categoryIds: string[];
  contentLevels: ContentLevel[];
  spicyAcknowledged: boolean;
};

export type BombPhase = 'ready' | 'playing' | 'paused' | 'exploded';

export type BombSession = {
  sessionId: string;
  setup: BombSetup;
  contentLanguage: ContentLanguage;
  phase: BombPhase;
  deck: BombCard[];
  cardIndex: number;
  startingPlayerId: string;
  fuseEndsAt: number | null;
  fuseRemainingMs: number | null;
  roundNumber: number;
};

export const BOMB_MIN_PLAYERS = 2;
export const BOMB_MAX_PLAYERS = 15;

export function createId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function defaultPlayers(count: number): Player[] {
  return Array.from({ length: count }, (_, index) => ({
    id: createId('p'),
    displayName: `Player ${index + 1}`,
  }));
}

export function defaultBombSetup(players?: Player[]): BombSetup {
  return {
    players: players ?? defaultPlayers(3),
    categoryIds: [],
    contentLevels: ['family'],
    spicyAcknowledged: false,
  };
}
