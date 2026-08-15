/**
 * Locked design tokens — product spec §16 / §18 (Step 7 wins).
 * Do not replace palette, type roles, or logo construction without a TASKS note.
 */

export const color = {
  void: '#080714',
  background: '#0D0B1C',
  surface: '#1B1533',
  surfaceRaised: '#241C43',
  textPrimary: '#F6EFE2',
  textSecondary: 'rgba(246,239,226,0.72)',
  textMuted: 'rgba(246,239,226,0.52)',
  borderSubtle: 'rgba(246,239,226,0.10)',
  brandPrimary: '#FFB646',
  brandMystery: '#8C6BFF',
  dangerUrgency: '#F0563C',
  success: '#3FD6A8',
  info: '#4FA3FF',
  gameImpostor: '#8C6BFF',
  gameLiar: '#F0563C',
  gameTaboo: '#FFB646',
  gameMostLikely: '#3FD6A8',
  gameWouldRather: '#4FA3FF',
  gameBomb: '#FF7A59',
  gameQuiz: '#E06FD1',
} as const;

export const font = {
  displayLatin: 'Outfit',
  bodyLatin: 'PlusJakartaSans',
  ethiopic: 'NotoSansEthiopic',
  utility: 'SpaceMono',
} as const;

export const radius = {
  small: 12,
  medium: 18,
  large: 24,
  extraLarge: 28,
  pill: 999,
} as const;

export const space = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
} as const;

export const motion = {
  fastMs: 140,
  standardMs: 200,
  revealMs: 220,
  /** Rare moments only — result / celebration. Keep under daily UI. */
  celebrationMs: 520,
} as const;

export const touchTarget = {
  minimum: 44,
  primaryButtonHeight: 56,
} as const;

/**
 * Additive depth layer (does not change the locked palette).
 * The brand is lit by lamplight from above, so surfaces carry a warm top
 * hairline and cast a coloured — never black — shadow.
 */
export const overlay = {
  /** Top edge catching the lamp. */
  hairlineTop: 'rgba(255,255,255,0.14)',
  hairline: 'rgba(255,255,255,0.06)',
  /** Glass fills, layered over the backdrop rather than painted flat. */
  glass: 'rgba(255,255,255,0.045)',
  glassStrong: 'rgba(255,255,255,0.08)',
  scrim: 'rgba(8,7,20,0.72)',
} as const;

/** Hex + alpha → rgba string. Accepts the 6-digit hexes in this file. */
export function alpha(hex: string, value: number): string {
  const int = parseInt(hex.replace('#', ''), 16);
  const r = (int >> 16) & 255;
  const g = (int >> 8) & 255;
  const b = int & 255;
  return `rgba(${r},${g},${b},${value})`;
}

/** Coloured bloom under a raised element — reads as light, not as a drop shadow. */
export function glow(hex: string, opacity = 0.4, radius = 20) {
  return {
    shadowColor: hex,
    shadowOpacity: opacity,
    shadowRadius: radius,
    shadowOffset: { width: 0, height: radius / 2.5 },
    elevation: Math.round(radius / 2),
  };
}

export const elevation = {
  card: glow('#050310', 0.5, 18),
  raised: glow('#050310', 0.6, 26),
} as const;

export type GameAccentKey =
  | 'impostor'
  | 'whos_the_liar'
  | 'taboo'
  | 'most_likely'
  | 'would_you_rather'
  | 'bomb'
  | 'quiz';

export const gameAccent: Record<GameAccentKey, string> = {
  impostor: color.gameImpostor,
  whos_the_liar: color.gameLiar,
  taboo: color.gameTaboo,
  most_likely: color.gameMostLikely,
  would_you_rather: color.gameWouldRather,
  bomb: color.gameBomb,
  quiz: color.gameQuiz,
};
