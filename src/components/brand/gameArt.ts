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
    wide: { source: require('../../../assets/illustrations/gimbar.jpg'), aspect: WIDE },
    half: { source: require('../../../assets/illustrations/gimbar-half.jpg'), aspect: 1 },
  },
  would_you_rather: {
    wide: {
      source: require('../../../assets/illustrations/would_you_rather.jpg'),
      aspect: 1050 / 591,
    },
    half: {
      source: require('../../../assets/illustrations/would_you_rather-half.jpg'),
      aspect: 1,
    },
  },
  whos_the_liar: {
    wide: { source: require('../../../assets/illustrations/whos_the_liar.jpg'), aspect: WIDE },
    half: { source: require('../../../assets/illustrations/whos_the_liar-half.jpg'), aspect: 1 },
  },
  quiz: {
    wide: { source: require('../../../assets/illustrations/quiz.jpg'), aspect: WIDE },
    half: { source: require('../../../assets/illustrations/quiz-half.jpg'), aspect: 1 },
  },
  mesob: {
    wide: { source: require('../../../assets/illustrations/mesob.jpg'), aspect: WIDE },
    half: { source: require('../../../assets/illustrations/mesob-half.jpg'), aspect: 1 },
  },
  wink_killer: {
    wide: { source: require('../../../assets/illustrations/wink_killer.jpg'), aspect: WIDE },
    half: { source: require('../../../assets/illustrations/wink_killer-half.jpg'), aspect: 1 },
  },
  insider: {
    wide: { source: require('../../../assets/illustrations/insider.jpg'), aspect: WIDE },
    half: { source: require('../../../assets/illustrations/insider-half.jpg'), aspect: 1 },
  },
};

export const HERO_CAST: GameArt = {
  source: require('../../../assets/illustrations/hero-cast.jpg'),
  aspect: 1090 / 234,
};

/** Primary logo (2026-10-30 final art), transparent PNG. */
export const WORDMARK: GameArt = {
  source: require('../../../assets/illustrations/wordmark.png'),
  aspect: 1154 / 609,
};

/** Crescent + sparks brand mark on transparent — the app icon's symbol. */
export const BRAND_MARK: GameArt = {
  source: require('../../../assets/splash-logo.png'),
  aspect: 1,
};
