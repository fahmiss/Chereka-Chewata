import { LinearGradient } from 'expo-linear-gradient';
import { Animated, Image, StyleSheet, Text, View } from 'react-native';
import { useResultReveal } from '../../theme/motion';
import { alpha, color, glow, overlay, radius, space } from '../../theme/tokens';
import { family, type } from '../../theme/typography';

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
  detail?: string;
  /** Ethiopic UI font when the supplied title/detail are localized. */
  uiFont?: string;
};

/**
 * Outcome and explanation are immediately readable, followed by the existing
 * cast artwork with a brief reveal. No score/count-up animation lives here.
 */
export function ResultHero({ scene, accent, title, detail, uiFont }: Props) {
  const reveal = useResultReveal();
  return (
    <View style={styles.root}>
      <Text style={[styles.title, uiFont ? { fontFamily: uiFont } : null]} accessibilityRole="header">{title}</Text>
      {detail ? <Text style={[type.body, styles.detail, uiFont ? { fontFamily: uiFont } : null]}>{detail}</Text> : null}
      {/* Glow on the outer view: iOS clips shadows on a view that crops. */}
      <Animated.View
        style={[styles.bandShell, glow(accent, 0.3, 22), reveal]}
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
      </Animated.View>
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
  detail: { color: color.textSecondary, textAlign: 'center' },
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
    paddingVertical: space[1],
  },
});
