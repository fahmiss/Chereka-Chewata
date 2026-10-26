import type { BasePlayerSetup, ContentLanguage, Player, TeamId } from '../shared/types';

export type { ContentLanguage, Player, TeamId };

export type MesobSetup = BasePlayerSetup & {
  turnSeconds: number;
  /** Slips each player writes privately. */
  wordsPerPlayer: number;
  /** Adds two deck cards per player, for groups short on ideas. */
  deckTopUp: boolean;
};

/** One slip in the basket. `authorId` is null for deck cards. */
export type MesobSlip = {
  id: string;
  text: string;
  authorId: string | null;
};

export type MesobRound = 1 | 2 | 3;

export type MesobPhase =
  | 'entry_handoff'
  | 'entry'
  | 'round_intro'
  | 'turn_ready'
  | 'playing'
  | 'paused'
  | 'turn_summary'
  | 'final';

/** In-memory only — players' slips are never stored. */
export type MesobSession = {
  sessionId: string;
  setup: MesobSetup;
  contentLanguage: ContentLanguage;
  phase: MesobPhase;
  teamA: string[];
  teamB: string[];
  scores: Record<TeamId, number>;
  activeTeam: TeamId;
  describerIndex: Record<TeamId, number>;
  /** Players in slip-writing order. */
  entryOrder: string[];
  entryIndex: number;
  slips: MesobSlip[];
  round: MesobRound;
  /** Slip ids still in the basket this round, in draw order. */
  basket: string[];
  currentSlipId: string | null;
  /** Slips guessed in the current turn. */
  turnGuessed: string[];
  turnSkips: number;
  /**
   * Time the describer had left when the basket emptied. They carry it into
   * the next round instead of losing it.
   */
  carryMs: number | null;
  /** Turn length for the turn about to start or in progress. */
  turnMs: number;
  winner: TeamId | 'tie' | null;
};

export const MESOB_MIN_PLAYERS = 4;
export const MESOB_MAX_PLAYERS = 20;
/** Carried time shorter than this ends the turn instead. */
export const MESOB_MIN_CARRY_MS = 5000;

export const MESOB_ROUND_RULES: Record<MesobRound, { title: string; rule: string }> = {
  1: { title: 'Describe', rule: 'Say anything except the words on the slip.' },
  2: { title: 'One word', rule: 'Give exactly one word per slip. No gestures.' },
  3: { title: 'Act it out', rule: 'No words, no sounds. Gestures only.' },
};
