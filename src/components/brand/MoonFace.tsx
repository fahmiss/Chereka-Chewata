import { Image, StyleSheet, View } from 'react-native';

/**
 * Soft 3D Chereka nightcap mascot — PRODUCT_SPEC §18.8.
 * Hero, home catalog, empty, loading, result, and pass-the-phone moments.
 * Primary logo remains flat MoonMark.
 */
export type MoonExpression =
  | 'ready'
  | 'secret'
  | 'caught'
  | 'delighted'
  | 'impostor'
  | 'detective'
  | 'pointing'
  | 'thinking'
  | 'bomb'
  | 'loading'
  | 'comingSoon'
  | 'timer';

type Props = {
  expression?: MoonExpression;
  size?: number;
  /** Kept for API compatibility; 3D art carries its own light. */
  glow?: boolean;
  /** Unused for 3D bitmaps — kept so existing call sites typecheck. */
  fill?: string;
};

const SOURCES: Record<MoonExpression, number> = {
  ready: require('../../../assets/mascot/moon-ready.png'),
  secret: require('../../../assets/mascot/moon-secret.png'),
  caught: require('../../../assets/mascot/moon-caught.png'),
  delighted: require('../../../assets/mascot/moon-delighted.png'),
  impostor: require('../../../assets/mascot/moon-impostor.png'),
  detective: require('../../../assets/mascot/moon-detective.png'),
  pointing: require('../../../assets/mascot/moon-pointing.png'),
  thinking: require('../../../assets/mascot/moon-thinking.png'),
  bomb: require('../../../assets/mascot/moon-bomb-user.png'),
  loading: require('../../../assets/mascot/moon-loading.png'),
  comingSoon: require('../../../assets/mascot/moon-coming-soon.png'),
  timer: require('../../../assets/mascot/moon-timer.png'),
};

export function MoonFace({ expression = 'ready', size = 96 }: Props) {
  return (
    <View
      style={[styles.frame, { width: size, height: size }]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Image
        source={SOURCES[expression]}
        style={{ width: size, height: size }}
        resizeMode="contain"
        accessibilityIgnoresInvertColors
      />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
