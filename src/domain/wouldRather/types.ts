export type ContentLevel = 'family' | 'friends' | 'spicy';

export type WouldRatherDilemma = {
  id: string;
  option_a_en: string;
  option_b_en: string;
  category_id: string;
  content_level: ContentLevel;
  intensity?: string;
  active: boolean;
};

export type WouldRatherCategory = {
  id: string;
  name_en: string;
  name_am?: string;
  sort_order: number;
  active: boolean;
};

export type WouldRatherSetup = {
  /** Compatibility with shared setup chrome; this game never collects names. */
  players: { id: string; displayName: string }[];
  categoryIds: string[];
  contentLevels: ContentLevel[];
  cardCount: number;
  spicyAcknowledged: boolean;
};

export type WouldRatherPhase = 'choice' | 'discuss' | 'ended';

/** Which option the room agreed on — a verdict, not a per-player vote. */
export type WouldRatherSide = 'a' | 'b';

export type WouldRatherSession = {
  sessionId: string;
  setup: WouldRatherSetup;
  phase: WouldRatherPhase;
  deck: WouldRatherDilemma[];
  index: number;
  playedCount: number;
  chosen: WouldRatherSide | null;
};

export function defaultWouldRatherSetup(): WouldRatherSetup {
  return { players: [], categoryIds: [], contentLevels: ['family'], cardCount: 20, spicyAcknowledged: false };
}

export function createId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}
