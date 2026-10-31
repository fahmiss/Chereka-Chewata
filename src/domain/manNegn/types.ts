import type { BasePlayerSetup, ContentLanguage } from '../shared/types';

export type ManNegnSetup = BasePlayerSetup;

export type ManNegnIdentity = {
  id: string;
  name_en: string;
  category_id: string;
  facts_en: string[];
  content_level: 'family' | 'friends' | 'spicy';
  active: boolean;
};

export type ManNegnStatus = 'playing' | 'solved' | 'out';
export type ManNegnPhase = 'handoff' | 'reveal' | 'play' | 'guess' | 'result';

export type ManNegnSession = {
  sessionId: string;
  setup: ManNegnSetup;
  contentLanguage: ContentLanguage;
  phase: ManNegnPhase;
  assignments: Record<string, ManNegnIdentity>;
  revealIndex: number;
  activePlayerId: string;
  lives: Record<string, number>;
  statuses: Record<string, ManNegnStatus>;
  finishOrder: string[];
  excludedIdentityIds: string[];
};

export const MAN_NEGN_MIN_PLAYERS = 2;
export const MAN_NEGN_MAX_PLAYERS = 5;
