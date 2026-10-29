import type { ImageSourcePropType } from 'react-native';
import type { GameId } from '../../domain/games';

export type GameArt = {
  source: ImageSourcePropType;
  /** width / height of the bitmap, so cards can size it without measuring. */
  aspect: number;
};

/**
 * One scene per game, cut two ways: `wide` for full-row cards (action in the
 * right two-thirds, title on the dark left) and `half` for the two-up grid
 * (square window under the title). Either cut stands in for the other; games
 * with neither fall back to their MoonFace mascot.
 */
export type GameArtSet = {
  wide?: GameArt;
  half?: GameArt;
};

const WIDE = 1200 / 675;

export const GAME_ART: Partial<Record<GameId, GameArtSet>> = {
  impostor: {
    wide: { source: require('../../../assets/illustrations/impostor.jpg'), aspect: WIDE },
  },
  mizan: {
    wide: { source: require('../../../assets/illustrations/mizan.jpg'), aspect: 1104 / 883 },
  },
  taboo: {
    wide: { source: require('../../../assets/illustrations/taboo.jpg'), aspect: WIDE },
    half: { source: require('../../../assets/illustrations/taboo-half.jpg'), aspect: 1 },
  },
  most_likely: {
    wide: { source: require('../../../assets/illustrations/most_likely.jpg'), aspect: WIDE },
    half: { source: require('../../../assets/illustrations/most_likely-half.jpg'), aspect: 1 },
  },
  bomb: {
    wide: { source: require('../../../assets/illustrations/bomb.jpg'), aspect: WIDE },
    half: { source: require('../../../assets/illustrations/bomb-half.jpg'), aspect: 1 },
  },
  gimbar: {
    half: { source: require('../../../assets/illustrations/gimbar-half.jpg'), aspect: 1 },
  },
  // Placeholder crop from the 2026-10-29 mockup until the real scene lands.
  whos_the_liar: {
    half: {
      source: require('../../../assets/illustrations/whos_the_liar.jpg'),
      aspect: 161 / 184,
    },
  },
};

export const HERO_CAST: GameArt = {
  source: require('../../../assets/illustrations/hero-cast.jpg'),
  aspect: 1090 / 234,
};

export const WORDMARK: GameArt = {
  source: require('../../../assets/illustrations/wordmark.png'),
  aspect: 360 / 178,
};
