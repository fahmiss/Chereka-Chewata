import { useRef } from 'react';
import type { ReactNode } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
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
  onPressOut,
  onPress,
  disabled,
  children,
  ...rest
}: Props) {
  const scale = useRef(new Animated.Value(1)).current;
  const reduced = useReducedMotion();
  const flat = StyleSheet.flatten(style) ?? {};
  const outer: ViewStyle = {};
  const inner = { ...flat };
  const layoutKeys = ['flex', 'flexGrow', 'flexShrink', 'flexBasis', 'alignSelf', 'width', 'minWidth', 'maxWidth', 'height', 'minHeight', 'maxHeight', 'margin', 'marginHorizontal', 'marginVertical', 'marginTop', 'marginBottom', 'marginLeft', 'marginRight', 'marginStart', 'marginEnd', 'position', 'top', 'bottom', 'left', 'right', 'zIndex', 'aspectRatio'] as const;
  for (const key of layoutKeys) {
    if (flat[key] !== undefined) {
      Object.assign(outer, { [key]: flat[key] });
      delete inner[key];
    }
  }

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
      style={outer}
      disabled={disabled}
      onPressIn={(event) => {
        if (!reduced) spring(scaleTo);
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        if (!reduced) spring(1);
        else scale.setValue(1);
        onPressOut?.(event);
      }}
      onPress={(event) => {
        if (haptic !== 'none') hapticImpact(haptic);
        onPress?.(event);
      }}
      {...rest}
    >
      <Animated.View style={[{ flexGrow: 1 }, inner, { transform: [{ scale }] }]}>{children}</Animated.View>
    </Pressable>
  );
}
