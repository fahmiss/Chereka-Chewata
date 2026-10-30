/**
 * Type scale — binds the locked type roles (spec §16 / tokens.font) to the
 * actual loaded font files.
 *
 * RN rule: when a family ships one file per weight, set `fontFamily` only.
 * Adding `fontWeight` on top makes Android synthesise a second bold and the
 * type goes muddy — that is why no preset below carries a weight.
 */

import type { TextStyle } from 'react-native';

/**
 * Bricolage Grotesque carries both the display and body roles since the
 * 2026-10-29 redesign (Outfit / Plus Jakarta Sans retired). The role names
 * stay so every screen picks the new face up without call-site changes.
 * Bricolage tops out at 800, so `black` maps to ExtraBold.
 */
const BRICOLAGE = {
  regular: 'BricolageGrotesque_400Regular',
  medium: 'BricolageGrotesque_500Medium',
  semibold: 'BricolageGrotesque_600SemiBold',
  bold: 'BricolageGrotesque_700Bold',
  extrabold: 'BricolageGrotesque_800ExtraBold',
} as const;

export const family = {
  display: { ...BRICOLAGE, black: BRICOLAGE.extrabold },
  body: BRICOLAGE,
  mono: {
    regular: 'SpaceMono_400Regular',
    bold: 'SpaceMono_700Bold',
  },
  /** Brush caps — logo voice, game titles and big reveal moments only. */
  brush: {
    regular: 'Knewave_400Regular',
  },
  grotesque: BRICOLAGE,
  ethiopic: {
    regular: 'NotoSansEthiopic_400Regular',
    medium: 'NotoSansEthiopic_500Medium',
    bold: 'NotoSansEthiopic_700Bold',
    black: 'NotoSansEthiopic_900Black',
  },
} as const;

type Preset = Pick<
  TextStyle,
  'fontFamily' | 'fontSize' | 'lineHeight' | 'letterSpacing' | 'textTransform'
>;

/**
 * Display sizes get progressively tighter tracking — the optical correction
 * that separates set type from default-rendered type.
 */
export const type = {
  displayXl: {
    fontFamily: family.display.black,
    fontSize: 44,
    lineHeight: 46,
    letterSpacing: -1.8,
  },
  displayLg: {
    fontFamily: family.display.extrabold,
    fontSize: 34,
    lineHeight: 38,
    letterSpacing: -1.2,
  },
  displayMd: {
    fontFamily: family.display.bold,
    fontSize: 26,
    lineHeight: 30,
    letterSpacing: -0.7,
  },
  titleLg: {
    fontFamily: family.display.bold,
    fontSize: 21,
    lineHeight: 26,
    letterSpacing: -0.4,
  },
  titleMd: {
    fontFamily: family.display.semibold,
    fontSize: 17,
    lineHeight: 22,
    letterSpacing: -0.2,
  },
  body: {
    fontFamily: family.body.regular,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: -0.1,
  },
  bodyStrong: {
    fontFamily: family.body.semibold,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: -0.1,
  },
  bodySm: {
    fontFamily: family.body.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  label: {
    fontFamily: family.body.semibold,
    fontSize: 14,
    lineHeight: 18,
  },
  button: {
    fontFamily: family.display.bold,
    fontSize: 17,
    lineHeight: 22,
    letterSpacing: -0.2,
  },
  /** Tracked-out caps for section labels — same voice as the home screen. */
  eyebrow: {
    fontFamily: family.grotesque.semibold,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  mono: {
    fontFamily: family.mono.regular,
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0.2,
  },
  /**
   * Brush caps for the word the whole table reads (Taboo target, Bomb
   * category, Gimbar card). Knewave leans right — give it a little
   * horizontal padding where it sits flush.
   */
  brushHero: {
    fontFamily: family.brush.regular,
    fontSize: 44,
    lineHeight: 52,
    textTransform: 'uppercase',
  },
  /** Brush caps for in-round headlines (prompt lead-ins, turns, spectrum ends). */
  brushTitle: {
    fontFamily: family.brush.regular,
    fontSize: 24,
    lineHeight: 30,
    textTransform: 'uppercase',
  },
  numeric: {
    fontFamily: family.mono.bold,
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: 0.4,
  },
  amharic: {
    fontFamily: family.ethiopic.medium,
    fontSize: 15,
    lineHeight: 22,
  },
} satisfies Record<string, Preset>;

export type TypePreset = keyof typeof type;
