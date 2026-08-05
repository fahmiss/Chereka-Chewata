import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { color, overlay, radius, touchTarget } from '../../theme/tokens';
import { Backdrop } from './Backdrop';
import { Icon, type IconName } from './Icon';
import { PressableScale } from './PressableScale';

type ScreenProps = {
  children: ReactNode;
  /** Tints the lower bloom of the backdrop. */
  accent?: string;
  intensity?: number;
  style?: StyleProp<ViewStyle>;
};

/** Every screen sits on the same lit room so navigation feels continuous. */
export function Screen({ children, accent, intensity, style }: ScreenProps) {
  return (
    <View style={styles.root}>
      <Backdrop accent={accent} intensity={intensity} />
      <SafeAreaView style={[styles.safe, style]} edges={['top', 'bottom']}>
        {children}
      </SafeAreaView>
    </View>
  );
}

type IconButtonProps = {
  name: IconName;
  onPress: () => void;
  label: string;
  tint?: string;
  disabled?: boolean;
};

export function IconButton({ name, onPress, label, tint, disabled }: IconButtonProps) {
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      haptic="selection"
      scaleTo={0.92}
      style={[styles.iconButton, disabled && styles.iconButtonDisabled]}
    >
      <Icon name={name} size={20} color={tint ?? color.textSecondary} />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: color.background,
  },
  safe: {
    flex: 1,
  },
  iconButton: {
    width: touchTarget.minimum,
    height: touchTarget.minimum,
    borderRadius: radius.pill,
    backgroundColor: overlay.glass,
    borderWidth: 1,
    borderColor: color.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonDisabled: {
    opacity: 0.3,
  },
});
