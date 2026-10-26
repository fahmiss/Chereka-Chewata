import type { BasePlayerSetup, ContentLanguage, ContentLevel, Player, TeamId } from '../shared/types';

export type { ContentLanguage, ContentLevel, Player, TeamId };

export type MizanSpectrum = {
  id: string;
  left_en: string;
  right_en: string;
  left_am?: string;
  right_am?: string;
  content_level: ContentLevel;
  active: boolean;
};

/** Teams race to a target; Together is one co-op score over fixed rounds. */
export type MizanMode = 'teams' | 'together';

export type MizanSetup = BasePlayerSetup & {
  mode: MizanMode;
  pointsToWin: number;
  rounds: number;
};

export type MizanCall = 'left' | 'right';

export type MizanPhase = 'handoff' | 'peek' | 'guess' | 'call' | 'reveal' | 'final';

export type MizanResult = {
  points: number;
  /** Teams mode: the other team read the miss correctly. */
  opponentPoint: boolean;
};

/** In-memory only — the target never leaves session state. */
export type MizanSession = {
  sessionId: string;
  setup: MizanSetup;
  contentLanguage: ContentLanguage;
  phase: MizanPhase;
  teamA: string[];
  teamB: string[];
  scores: Record<TeamId, number>;
  activeTeam: TeamId;
  /** Teams mode: next psychic per team. Together mode uses `turnNumber`. */
  psychicIndex: Record<TeamId, number>;
  turnNumber: number;
  deck: MizanSpectrum[];
  deckIndex: number;
  spectrum: MizanSpectrum;
  /** 0 (left end) to 100 (right end). */
  target: number;
  guess: number;
  call: MizanCall | null;
  result: MizanResult | null;
  winner: TeamId | 'tie' | 'together' | null;
};

export const MIZAN_MIN_PLAYERS = 2;
export const MIZAN_MAX_PLAYERS = 20;
export const MIZAN_TEAMS_MIN_PLAYERS = 4;

/** Half-widths of the scoring bands around the target, best first. */
export const MIZAN_BANDS = [
  { within: 3, points: 4 },
  { within: 9, points: 3 },
  { within: 15, points: 2 },
] as const;

export const MIZAN_MAX_POINTS = 4;
