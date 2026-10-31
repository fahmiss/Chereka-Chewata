import type { BasePlayerSetup, ContentLanguage, ContentLevel, Player } from '../shared/types';

export type { ContentLanguage, ContentLevel, Player };

export type EwnetQuestion = {
  id: string;
  question_en: string;
  answer_en: string;
  explanation_en: string;
  category_id: string;
  content_level: ContentLevel;
  source_name?: string;
  source_url?: string;
  active: boolean;
};

export type EwnetSetup = BasePlayerSetup & {
  roundCount: 5 | 7 | 10;
};

export type EwnetPhase =
  | 'round_intro'
  | 'bluff_handoff'
  | 'bluff_entry'
  | 'vote_handoff'
  | 'vote_select'
  | 'round_result'
  | 'final';

export type EwnetAnswer = {
  id: string;
  text: string;
  authorId: string | null;
  isTruth: boolean;
};

export type EwnetSession = {
  sessionId: string;
  setup: EwnetSetup;
  contentLanguage: ContentLanguage;
  phase: EwnetPhase;
  deck: EwnetQuestion[];
  roundIndex: number;
  bluffOrder: string[];
  bluffIndex: number;
  bluffs: Record<string, string>;
  answers: EwnetAnswer[];
  voteOrder: string[];
  voteIndex: number;
  votes: Record<string, string>;
  scores: Record<string, number>;
};

export const EWNET_MIN_PLAYERS = 3;
export const EWNET_MAX_PLAYERS = 8;
