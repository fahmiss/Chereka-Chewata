import type { ImpostorWord } from '../impostor/types';
import type { BasePlayerSetup, ContentLanguage, ContentLevel, Player } from '../shared/types';

export type { ContentLanguage, ContentLevel, Player };

export type InsiderVotingMode = 'group' | 'private';

export type InsiderSetup = BasePlayerSetup & {
  timerSeconds: number;
  votingMode: InsiderVotingMode;
};

export type InsiderRole = 'master' | 'insider' | 'common';

export type InsiderPhase =
  | 'master_intro'
  | 'handoff'
  | 'reveal'
  | 'quiz'
  | 'discussion'
  | 'group_accuse'
  | 'voting_handoff'
  | 'voting_select'
  | 'result';

/** In-memory only — the word and the Insider never leave session state. */
export type InsiderSession = {
  sessionId: string;
  setup: InsiderSetup;
  contentLanguage: ContentLanguage;
  phase: InsiderPhase;
  word: ImpostorWord;
  masterId: string;
  insiderId: string;
  revealOrder: string[];
  revealIndex: number;
  /** Seconds left on the quiz clock when the word was found. */
  solvedWithSeconds: number | null;
  voteOrder: string[];
  voteIndex: number;
  votes: Record<string, string>;
  eligibleSuspectIds: string[] | null;
  runoffRound: number;
  accusedPlayerId: string | null;
  /** `nobody` = the word was never found, so everyone loses. */
  winner: 'commons' | 'insider' | 'nobody' | null;
  excludedWordIds: string[];
};

export const INSIDER_MIN_PLAYERS = 4;
export const INSIDER_MAX_PLAYERS = 12;
