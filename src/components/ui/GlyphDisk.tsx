import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';
import { alpha, glow } from '../../theme/tokens';
import { Icon, type IconName } from './Icon';

type Props = {
  icon: IconName;
  accent: string;
  size?: number;
};

/**
 * A lit disk in the game colour with one line icon — the in-game stand-in
 * for the old mascot. Type, colour and light carry these moments; the cast
 * art is kept for the once-a-round results.
 */
export function GlyphDisk({ icon, accent, size = 110 }: Props) {
  return (
    <View
      style={[
        styles.disk,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderColor: alpha(accent, 0.45),
        },
        glow(accent, 0.35, size / 5),
      ]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <LinearGradient
        colors={[alpha(accent, 0.32), alpha(accent, 0.08)]}
        start={{ x: 0.3, y: 0 }}
        end={{ x: 0.7, y: 1 }}
        style={[StyleSheet.absoluteFill, { borderRadius: size / 2 }]}
      />
      <Icon name={icon} size={Math.round(size * 0.42)} color={accent} strokeWidth={1.9} />
    </View>
  );
}

const styles = StyleSheet.create({
  disk: {
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
