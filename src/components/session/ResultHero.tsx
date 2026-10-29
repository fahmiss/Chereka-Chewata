import { LinearGradient } from 'expo-linear-gradient';
import { Image, StyleSheet, Text, View } from 'react-native';
import { alpha, color, glow, overlay, radius, space } from '../../theme/tokens';
import { family } from '../../theme/typography';

export type ResultScene = 'caught' | 'celebrate';

const SCENES: Record<ResultScene, number> = {
  caught: require('../../../assets/illustrations/result-caught.jpg'),
  celebrate: require('../../../assets/illustrations/result-celebrate.jpg'),
};

type Props = {
  /** `caught` when the group exposes someone, `celebrate` for any win. */
  scene: ResultScene;
  accent: string;
  title: string;
};

/**
 * End-of-round header shared by every game: the cast scene as a lit band,
 * washed in the game's colour from below, then a brush headline. Seen once
 * per round, so it can be loud — in-round screens stay type-led.
 */
export function ResultHero({ scene, accent, title }: Props) {
  return (
    <View style={styles.root}>
      {/* Glow on the outer view: iOS clips shadows on a view that crops. */}
      <View
        style={[styles.bandShell, glow(accent, 0.3, 22)]}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <View style={[styles.band, { borderColor: alpha(accent, 0.3) }]}>
          <Image source={SCENES[scene]} style={styles.image} resizeMode="cover" />
          <LinearGradient
            colors={[alpha(accent, 0), alpha(accent, 0.22), alpha(color.void, 0.55)]}
            locations={[0.35, 0.75, 1]}
            style={StyleSheet.absoluteFill}
          />
        </View>
      </View>
      <Text style={styles.title} accessibilityRole="header">
        {title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    // Stretch even inside the centred column each results screen uses.
    alignSelf: 'stretch',
    alignItems: 'center',
    gap: space[3],
  },
  bandShell: {
    width: '100%',
    borderRadius: radius.large,
  },
  band: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: radius.large,
    borderWidth: 1,
    borderTopColor: overlay.hairlineTop,
    overflow: 'hidden',
    backgroundColor: color.surface,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  title: {
    color: color.textPrimary,
    fontFamily: family.brush.regular,
    fontSize: 38,
    lineHeight: 44,
    textAlign: 'center',
    textTransform: 'uppercase',
    // Knewave leans right; the slack keeps the last glyph from clipping.
    paddingHorizontal: 6,
    marginTop: space[2],
  },
});
