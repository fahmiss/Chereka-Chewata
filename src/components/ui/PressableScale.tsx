import { useRef } from 'react';
import type { ReactNode } from 'react';
import {
  Animated,
  Pressable,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { hapticImpact } from '../../theme/haptics';
import { useReducedMotion } from '../../theme/motion';

type Props = Omit<PressableProps, 'style' | 'children'> & {
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
  /** How far the element sinks under a finger. Subtle: 0.95–0.98. */
  scaleTo?: number;
  haptic?: 'light' | 'medium' | 'selection' | 'none';
};

/**
 * Instant press feedback. High stiffness, low bounce — the finger should feel
 * the surface move in ~100–160ms, not wait for a soft spring to catch up.
 */
export function PressableScale({
  style,
  scaleTo = 0.97,
  haptic = 'light',
  onPressIn,
  onPress,
  disabled,
  children,
  ...rest
}: Props) {
  const scale = useRef(new Animated.Value(1)).current;
  const reduced = useReducedMotion();

  const spring = (toValue: number) =>
    Animated.spring(scale, {
      toValue,
      useNativeDriver: true,
      stiffness: 520,
      damping: 38,
      mass: 0.7,
    }).start();

  return (
    <Pressable
      disabled={disabled}
      onPressIn={(event) => {
        if (!reduced) spring(scaleTo);
        onPressIn?.(event);
      }}
      onPressOut={() => {
        if (!reduced) spring(1);
        else scale.setValue(1);
      }}
      onPress={(event) => {
        if (haptic !== 'none') hapticImpact(haptic);
        onPress?.(event);
      }}
      {...rest}
    >
      <Animated.View style={[style, { transform: [{ scale }] }]}>{children}</Animated.View>
    </Pressable>
  );
}
