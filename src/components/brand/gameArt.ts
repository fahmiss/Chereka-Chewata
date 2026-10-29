import type { ImageSourcePropType } from 'react-native';
import type { GameId } from '../../domain/games';

export type GameArt = {
  source: ImageSourcePropType;
  /** width / height of the bitmap, so cards can size it without measuring. */
  aspect: number;
};

/**
 * Illustrated scene per game — the "game moment", drawn in the shared cast
 * style. Games without an entry fall back to their MoonFace mascot.
 *
 * Placeholder crops from the 2026-10-29 home mockup; replace each with a
 * text-free @3x export when the final illustrations land.
 */
export const GAME_ART: Partial<Record<GameId, GameArt>> = {
  impostor: { source: require('../../../assets/illustrations/impostor.jpg'), aspect: 375 / 224 },
  mizan: { source: require('../../../assets/illustrations/mizan.jpg'), aspect: 396 / 212 },
  whos_the_liar: {
    source: require('../../../assets/illustrations/whos_the_liar.jpg'),
    aspect: 161 / 184,
  },
  taboo: { source: require('../../../assets/illustrations/taboo.jpg'), aspect: 166 / 184 },
  most_likely: {
    source: require('../../../assets/illustrations/most_likely.jpg'),
    aspect: 153 / 194,
  },
  bomb: { source: require('../../../assets/illustrations/bomb.jpg'), aspect: 171 / 193 },
};

export const HERO_CAST: GameArt = {
  source: require('../../../assets/illustrations/hero-cast.jpg'),
  aspect: 710 / 190,
};

export const WORDMARK: GameArt = {
  source: require('../../../assets/illustrations/wordmark.png'),
  aspect: 360 / 178,
};
