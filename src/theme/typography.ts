/**
 * Type scale — binds the locked type roles (spec §16 / tokens.font) to the
 * actual loaded font files.
 *
 * RN rule: when a family ships one file per weight, set `fontFamily` only.
 * Adding `fontWeight` on top makes Android synthesise a second bold and the
 * type goes muddy — that is why no preset below carries a weight.
 */

import type { TextStyle } from 'react-native';

export const family = {
  display: {
    regular: 'Outfit_400Regular',
    medium: 'Outfit_500Medium',
    semibold: 'Outfit_600SemiBold',
    bold: 'Outfit_700Bold',
    extrabold: 'Outfit_800ExtraBold',
    black: 'Outfit_900Black',
  },
  body: {
    regular: 'PlusJakartaSans_400Regular',
    medium: 'PlusJakartaSans_500Medium',
    semibold: 'PlusJakartaSans_600SemiBold',
    bold: 'PlusJakartaSans_700Bold',
    extrabold: 'PlusJakartaSans_800ExtraBold',
  },
  mono: {
    regular: 'SpaceMono_400Regular',
    bold: 'SpaceMono_700Bold',
  },
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
  /** Tracked-out mono — the utility voice for eyebrows, steps, counts. */
  eyebrow: {
    fontFamily: family.mono.bold,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 2.4,
    textTransform: 'uppercase',
  },
  mono: {
    fontFamily: family.mono.regular,
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0.2,
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
