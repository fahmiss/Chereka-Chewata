import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { alpha, color, radius, touchTarget } from '../../theme/tokens';
import { type } from '../../theme/typography';
import { Icon, type IconName } from './Icon';
import { PressableScale } from './PressableScale';

export type ButtonTone = 'honey' | 'violet' | 'danger';

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  tone?: ButtonTone;
  icon?: IconName;
  style?: StyleProp<ViewStyle>;
};

/** Each tone is a lit gradient, not a single flat fill. */
const TONES: Record<ButtonTone, { from: string; to: string; ink: string }> = {
  honey: { from: '#FFC96B', to: color.brandPrimary, ink: color.void },
  violet: { from: '#A48BFF', to: color.brandMystery, ink: color.void },
  danger: { from: '#FF7359', to: color.dangerUrgency, ink: color.void },
};

export function PrimaryButton({
  label,
  onPress,
  disabled,
  tone = 'honey',
  icon,
  style,
}: Props) {
  const palette = TONES[tone];

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      haptic="medium"
      scaleTo={0.975}
      style={[
        styles.button,
        disabled && styles.disabled,
        style,
      ]}
    >
      <LinearGradient
        colors={[palette.from, palette.to]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {/* Specular top edge — the light source is above. */}
      <View style={[styles.sheen, { backgroundColor: alpha('#FFFFFF', 0.45) }]} />
      <View style={styles.row}>
        {icon ? <Icon name={icon} size={19} color={palette.ink} strokeWidth={2.4} /> : null}
        <Text style={[type.button, { color: palette.ink }]} numberOfLines={1}>
          {label}
        </Text>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: touchTarget.primaryButtonHeight,
    borderRadius: radius.medium,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  sheen: {
    position: 'absolute',
    top: 0,
    left: 14,
    right: 14,
    height: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  disabled: {
    opacity: 0.35,
  },
});
