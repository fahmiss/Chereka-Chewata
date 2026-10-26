import type { ContentLanguage } from '../settings/types';

export type { ContentLanguage };

export type ContentLevel = 'family' | 'friends' | 'spicy';

export type Player = {
  id: string;
  displayName: string;
};

/** Fields every named-player setup shares, so one setup surface serves them all. */
export type BasePlayerSetup = {
  players: Player[];
  categoryIds: string[];
  contentLevels: ContentLevel[];
  spicyAcknowledged: boolean;
};

export type TeamId = 'a' | 'b';
