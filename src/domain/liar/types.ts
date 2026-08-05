export type ContentLevel = 'family' | 'friends' | 'spicy';

export type LiarPair = {
  id: string;
  main_question_en: string;
  liar_question_en: string;
  main_question_am?: string;
  liar_question_am?: string;
  category_id: string;
  content_level: ContentLevel;
  difficulty: 'easy' | 'medium' | 'hard';
  active: boolean;
};

export type LiarCategory = {
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

export type LiarSetup = {
  players: Player[];
  categoryIds: string[];
  contentLevels: ContentLevel[];
  randomAnswerOrder: boolean;
  answerTimerSeconds: number | null;
  discussionTimerSeconds: number | null;
  scoringEnabled: boolean;
  spicyAcknowledged: boolean;
};

export type LiarPhase =
  | 'handoff'
  | 'reveal'
  | 'answer_order'
  | 'answers'
  | 'discussion'
  | 'voting_handoff'
  | 'voting_select'
  | 'result';

/** In-memory only — never persist roles, questions, or votes. */
export type LiarSession = {
  sessionId: string;
  setup: LiarSetup;
  phase: LiarPhase;
  pair: LiarPair;
  liarPlayerId: string;
  revealOrder: string[];
  revealIndex: number;
  answerOrder: string[];
  answerIndex: number;
  voteOrder: string[];
  voteIndex: number;
  votes: Record<string, string>;
  eligibleSuspectIds: string[] | null;
  runoffRound: number;
  winner: 'group' | 'liar' | null;
  accusedPlayerId: string | null;
  excludedPairIds: string[];
  previousLiarPlayerId: string | null;
};

export const LIAR_MIN_PLAYERS = 3;
export const LIAR_MAX_PLAYERS = 15;

export function defaultLiarSetup(players?: Player[]): LiarSetup {
  return {
    players: players ?? defaultPlayers(3),
    categoryIds: [],
    contentLevels: ['family'],
    randomAnswerOrder: true,
    answerTimerSeconds: null,
    discussionTimerSeconds: null,
    scoringEnabled: false,
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
