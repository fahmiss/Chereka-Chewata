import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { duration, easeOut, useReducedMotion } from '../../theme/motion';
import { alpha, color, radius } from '../../theme/tokens';

type Props = {
  /** 0-based active index. Segments at or before this are filled. */
  activeIndex: number;
  count: number;
  accent: string;
};

/**
 * Stage / setup progress. Past and current segments light up with a short
 * ease-out so the rail feels like it advanced — not like the colour flipped.
 */
export function ProgressRail({ activeIndex, count, accent }: Props) {
  const reduced = useReducedMotion();
  const fills = useRef(
    Array.from({ length: Math.max(count, 1) }, (_, index) =>
      new Animated.Value(index <= activeIndex ? 1 : 0),
    ),
  ).current;

  useEffect(() => {
    while (fills.length < count) {
      fills.push(new Animated.Value(0));
    }

    fills.slice(0, count).forEach((value, index) => {
      const next = index <= activeIndex ? 1 : 0;
      if (reduced) {
        value.setValue(next);
        return;
      }
      Animated.timing(value, {
        toValue: next,
        duration: duration.control,
        delay: index <= activeIndex ? Math.min(index, 4) * 30 : 0,
        easing: easeOut,
        useNativeDriver: false,
      }).start();
    });
  }, [activeIndex, count, fills, reduced]);

  return (
    <View
      style={styles.rail}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 1, max: count, now: activeIndex + 1 }}
    >
      {Array.from({ length: count }, (_, index) => (
        <Animated.View
          key={index}
          style={[
            styles.seg,
            {
              backgroundColor: fills[index]?.interpolate({
                inputRange: [0, 1],
                outputRange: [alpha(color.textPrimary, 0.1), accent],
              }),
              opacity: fills[index]?.interpolate({
                inputRange: [0, 1],
                outputRange: [1, index === activeIndex ? 1 : 0.5],
              }),
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  rail: {
    flexDirection: 'row',
    gap: 4,
  },
  seg: {
    flex: 1,
    height: 3,
    borderRadius: radius.pill,
  },
});
