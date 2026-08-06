import type { ContentLanguage } from '../settings/types';

export type { ContentLanguage };

export type ContentLevel = 'family' | 'friends' | 'spicy';

export type ImpostorWord = {
  id: string;
  word_en: string;
  word_am?: string;
  category_id: string;
  hint_en: string;
  hint_am?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  content_level: ContentLevel;
  active: boolean;
};

export type ImpostorCategory = {
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

/** group = decide in the room, tap accused. private = anonymous pass-the-phone votes. */
export type VotingMode = 'group' | 'private';

export type ImpostorSetup = {
  players: Player[];
  categoryIds: string[];
  contentLevels: ContentLevel[];
  /**
   * Kept at 1 for MVP — see TWO_IMPOSTOR_ENABLED. The type still allows 2 so
   * role assignment needs no change when the mode returns.
   */
  impostorCount: 1 | 2;
  showCategoryToImpostor: boolean;
  discussionTimerSeconds: number | null;
  randomStartPlayer: boolean;
  votingMode: VotingMode;
  spicyAcknowledged: boolean;
};

export type ImpostorPhase =
  | 'handoff'
  | 'reveal'
  | 'starting_player'
  | 'clues'
  | 'discussion'
  | 'group_accuse'
  | 'voting_handoff'
  | 'voting_select'
  | 'accusation'
  | 'final_guess'
  | 'result';

export type RoleAssignment =
  | { playerId: string; role: 'crew' }
  | { playerId: string; role: 'impostor' };

/** In-memory only — never persist roles or secret words. */
export type ImpostorSession = {
  sessionId: string;
  setup: ImpostorSetup;
  /** Frozen at start so rematch keeps the same card language. */
  contentLanguage: ContentLanguage;
  phase: ImpostorPhase;
  word: ImpostorWord;
  roles: RoleAssignment[];
  revealOrder: string[];
  revealIndex: number;
  clueOrder: string[];
  clueIndex: number;
  voteOrder: string[];
  voteIndex: number;
  votes: Record<string, string>;
  eligibleSuspectIds: string[] | null;
  runoffRound: number;
  accusedPlayerId: string | null;
  accusedIsImpostor: boolean | null;
  winner: 'crew' | 'impostor' | null;
  excludedWordIds: string[];
};

/**
 * Two-Impostor mode is out of MVP scope (README "Out of scope"; spec §3.6
 * defers it until one-Impostor is stable). The rules gap is real: §3.6 requires
 * a second clue-and-vote cycle after a caught Impostor guesses wrong, and the
 * machine resolves the round instead.
 *
 * Flip to `true` once that cycle exists, and restore the 1/2 control on the
 * Impostor quick setup. Nothing else needs to change.
 */
export const TWO_IMPOSTOR_ENABLED = false;

export const IMPOSTOR_MIN_PLAYERS = 3;
export const IMPOSTOR_MAX_PLAYERS = 15;

export function defaultImpostorSetup(players?: Player[]): ImpostorSetup {
  return {
    players: players ?? defaultPlayers(3),
    categoryIds: [],
    contentLevels: ['family'],
    impostorCount: 1,
    showCategoryToImpostor: true,
    discussionTimerSeconds: null,
    randomStartPlayer: true,
    votingMode: 'group',
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
