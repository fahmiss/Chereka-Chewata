import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { color, overlay, radius, touchTarget } from '../../theme/tokens';
import { type } from '../../theme/typography';
import { Icon, type IconName } from './Icon';
import { PressableScale } from './PressableScale';

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  icon?: IconName;
  /** Borderless variant for tertiary actions stacked under a primary. */
  quiet?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function SecondaryButton({
  label,
  onPress,
  disabled,
  icon,
  quiet = false,
  style,
}: Props) {
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      haptic="light"
      scaleTo={0.975}
      style={[styles.button, quiet && styles.quiet, disabled && styles.disabled, style]}
    >
      {!quiet ? <View style={styles.sheen} /> : null}
      <View style={styles.row}>
        {icon ? <Icon name={icon} size={18} color={color.textPrimary} /> : null}
        <Text
          style={[type.button, styles.label, quiet && styles.quietLabel]}
          numberOfLines={1}
        >
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
    backgroundColor: overlay.glass,
    borderWidth: 1,
    borderColor: color.borderSubtle,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  quiet: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    minHeight: touchTarget.minimum,
  },
  sheen: {
    position: 'absolute',
    top: 0,
    left: 14,
    right: 14,
    height: 1,
    backgroundColor: overlay.hairlineTop,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  label: {
    color: color.textPrimary,
  },
  quietLabel: {
    color: color.textSecondary,
    fontSize: 15,
  },
  disabled: {
    opacity: 0.35,
  },
});
