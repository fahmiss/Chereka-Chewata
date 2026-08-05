export type ContentLevel = 'family' | 'friends' | 'spicy';

export type TabooCard = {
  id: string;
  target_en: string;
  target_am?: string;
  forbidden_en: string[];
  forbidden_am?: string[];
  category_id: string;
  content_level: ContentLevel;
  difficulty: 'easy' | 'medium' | 'hard';
  active: boolean;
};

export type TabooCategory = {
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

export type TeamId = 'a' | 'b';

export type TabooSetup = {
  players: Player[];
  categoryIds: string[];
  contentLevels: ContentLevel[];
  roundSeconds: number;
  pointsToWin: number;
  maxSkips: number;
  skipPenalty: boolean;
  spicyAcknowledged: boolean;
};

export type TabooPhase =
  | 'round_ready'
  | 'playing'
  | 'paused'
  | 'turn_summary'
  | 'final';

/** In-memory only — never persist cards mid-reveal or scores-as-secrets. */
export type TabooSession = {
  sessionId: string;
  setup: TabooSetup;
  phase: TabooPhase;
  teamA: string[];
  teamB: string[];
  scores: Record<TeamId, number>;
  activeTeam: TeamId;
  describerIndex: Record<TeamId, number>;
  turnsCompleted: Record<TeamId, number>;
  currentCard: TabooCard | null;
  turnCorrect: number;
  turnSkips: number;
  turnViolations: number;
  turnScore: number;
  excludedCardIds: string[];
  isSuddenDeath: boolean;
  winner: TeamId | 'tie' | null;
};

export const TABOO_MIN_PLAYERS = 4;
export const TABOO_MAX_PLAYERS = 20;

export function defaultTabooSetup(players?: Player[]): TabooSetup {
  return {
    players: players ?? defaultPlayers(4),
    categoryIds: [],
    contentLevels: ['family'],
    roundSeconds: 60,
    pointsToWin: 15,
    maxSkips: 3,
    skipPenalty: false,
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
