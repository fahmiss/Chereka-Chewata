import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { alpha, color, overlay, radius } from '../../theme/tokens';

type Props = {
  children: ReactNode;
  /** Adds a restrained tint; pass the active game accent. */
  accent?: string;
  /** Emphasised card: brighter fill and clearer edge. */
  active?: boolean;
  radiusToken?: keyof typeof radius;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
};

/**
 * A quiet panel. Accent light is reserved for selected or important content.
 */
export function Surface({
  children,
  accent,
  active = false,
  radiusToken = 'large',
  style,
  contentStyle,
}: Props) {
  const corner = radius[radiusToken];
  const border = active && accent ? alpha(accent, 0.55) : color.borderSubtle;

  return (
    <View style={[{ borderRadius: corner }, style]}>
      <View style={[styles.clip, { borderRadius: corner, borderColor: border }]}>
        <LinearGradient
          colors={
            active ? [color.surfaceRaised, color.surface] : [overlay.glass, color.surface]
          }
          start={{ x: 0.1, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        {accent ? (
          <LinearGradient
            colors={[alpha(accent, active ? 0.12 : 0.035), 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0.85, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        ) : null}
        {active ? (
          <View
            style={[
              styles.hairline,
              { backgroundColor: accent ? alpha(accent, 0.4) : overlay.hairlineTop },
            ]}
          />
        ) : null}
        <View style={contentStyle}>{children}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  clip: {
    overflow: 'hidden',
    borderWidth: 1,
    backgroundColor: color.surface,
  },
  hairline: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
    height: 1,
  },
});
