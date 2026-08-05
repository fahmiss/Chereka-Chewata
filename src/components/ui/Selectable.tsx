import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { hapticImpact } from '../../theme/haptics';
import { duration, easeInOut, useReducedMotion } from '../../theme/motion';
import { alpha, color, overlay, radius, space, touchTarget } from '../../theme/tokens';
import { type } from '../../theme/typography';
import { Icon, type IconName } from './Icon';
import { PressableScale } from './PressableScale';

const SEG_PAD = 3;
const SEG_GAP = 4;

/* ------------------------------------------------------------------ *
 * Option row — checkbox / radio card used across every setup step.
 * ------------------------------------------------------------------ */

type OptionRowProps = {
  title: string;
  description?: string;
  meta?: string;
  icon?: IconName;
  selected: boolean;
  onPress: () => void;
  accent?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function OptionRow({
  title,
  description,
  meta,
  icon,
  selected,
  onPress,
  accent = color.brandPrimary,
  disabled,
  style,
}: OptionRowProps) {
  return (
    <PressableScale
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected, disabled: !!disabled }}
      accessibilityLabel={description ? `${title}. ${description}` : title}
      disabled={disabled}
      onPress={onPress}
      haptic="selection"
      scaleTo={0.98}
      style={[
        styles.row,
        {
          borderColor: selected ? alpha(accent, 0.55) : color.borderSubtle,
          backgroundColor: selected ? alpha(accent, 0.1) : overlay.glass,
        },
        disabled && styles.disabled,
        style,
      ]}
    >
      {icon ? (
        <View
          style={[
            styles.rowIcon,
            {
              backgroundColor: alpha(accent, selected ? 0.2 : 0.1),
              borderColor: alpha(accent, selected ? 0.4 : 0.18),
            },
          ]}
        >
          <Icon name={icon} size={20} color={selected ? accent : color.textSecondary} />
        </View>
      ) : null}

      <View style={styles.rowCopy}>
        <Text style={[type.titleMd, styles.rowTitle]}>{title}</Text>
        {description ? (
          <Text style={[type.bodySm, styles.rowBody]}>{description}</Text>
        ) : null}
        {meta ? <Text style={[type.mono, styles.rowMeta]}>{meta}</Text> : null}
      </View>

      <View
        style={[
          styles.box,
          selected
            ? { backgroundColor: accent, borderColor: accent }
            : { borderColor: alpha(color.textPrimary, 0.28) },
        ]}
      >
        {selected ? <Icon name="check" size={15} color={color.void} strokeWidth={3} /> : null}
      </View>
    </PressableScale>
  );
}

/* ------------------------------------------------------------------ *
 * Segmented control — mutually exclusive choices.
 * ------------------------------------------------------------------ */

type SegmentedProps<T extends string | number> = {
  options: { value: T; label: string; disabled?: boolean }[];
  value: T;
  onChange: (value: T) => void;
  accent?: string;
};

/**
 * Sliding thumb — the active fill moves between options instead of each
 * button flashing its own border. Feels like one control, not N buttons.
 */
export function Segmented<T extends string | number>({
  options,
  value,
  onChange,
  accent = color.brandPrimary,
}: SegmentedProps<T>) {
  const reduced = useReducedMotion();
  const activeIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );
  const [width, setWidth] = useState(0);
  const thumb = useRef(new Animated.Value(activeIndex)).current;
  const count = options.length;
  const inner = Math.max(width - SEG_PAD * 2, 0);
  const thumbWidth = count > 0 && inner > 0 ? (inner - SEG_GAP * (count - 1)) / count : 0;

  useEffect(() => {
    if (reduced) {
      thumb.setValue(activeIndex);
      return;
    }
    Animated.timing(thumb, {
      toValue: activeIndex,
      duration: duration.control,
      easing: easeInOut,
      useNativeDriver: true,
    }).start();
  }, [activeIndex, reduced, thumb]);

  const onLayout = (event: LayoutChangeEvent) => {
    setWidth(event.nativeEvent.layout.width);
  };

  return (
    <View style={styles.segment} onLayout={onLayout}>
      {thumbWidth > 0 ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.segThumb,
            {
              width: thumbWidth,
              backgroundColor: alpha(accent, 0.2),
              borderColor: alpha(accent, 0.5),
              transform: [
                {
                  translateX: thumb.interpolate({
                    inputRange: options.map((_, index) => index),
                    outputRange: options.map((_, index) => index * (thumbWidth + SEG_GAP)),
                  }),
                },
              ],
            },
          ]}
        />
      ) : null}
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={String(option.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected: active, disabled: !!option.disabled }}
            disabled={option.disabled}
            onPress={() => {
              hapticImpact('selection');
              onChange(option.value);
            }}
            style={[styles.segButton, option.disabled && styles.disabled]}
          >
            <Text
              style={[type.label, { color: active ? accent : color.textSecondary }]}
              numberOfLines={1}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/* ------------------------------------------------------------------ *
 * Toggle — animated switch with a labelled hit area.
 * ------------------------------------------------------------------ */

type ToggleProps = {
  label: string;
  hint?: string;
  value: boolean;
  onPress: () => void;
  accent?: string;
};

const TRACK_WIDTH = 52;
const KNOB = 24;

export function Toggle({ label, hint, value, onPress, accent = color.brandPrimary }: ToggleProps) {
  const progress = useRef(new Animated.Value(value ? 1 : 0)).current;
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) {
      progress.setValue(value ? 1 : 0);
      return;
    }
    Animated.spring(progress, {
      toValue: value ? 1 : 0,
      useNativeDriver: false,
      speed: 24,
      bounciness: 6,
    }).start();
  }, [value, progress, reduced]);

  return (
    <PressableScale
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      accessibilityLabel={hint ? `${label}. ${hint}` : label}
      onPress={onPress}
      haptic="selection"
      scaleTo={0.99}
      style={styles.toggleRow}
    >
      <View style={styles.rowCopy}>
        <Text style={[type.bodyStrong, styles.rowTitle]}>{label}</Text>
        {hint ? <Text style={[type.bodySm, styles.rowBody]}>{hint}</Text> : null}
      </View>
      <Animated.View
        style={[
          styles.track,
          {
            backgroundColor: progress.interpolate({
              inputRange: [0, 1],
              outputRange: [overlay.glassStrong, accent],
            }),
            borderColor: progress.interpolate({
              inputRange: [0, 1],
              outputRange: [color.borderSubtle, accent],
            }),
          },
        ]}
      >
        <Animated.View
          style={[
            styles.knob,
            {
              backgroundColor: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [color.textMuted, color.void],
              }),
              transform: [
                {
                  translateX: progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, TRACK_WIDTH - KNOB - 8],
                  }),
                },
              ],
            },
          ]}
        />
      </Animated.View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 64,
    borderRadius: radius.medium,
    borderWidth: 1,
    paddingHorizontal: space[4],
    paddingVertical: space[4],
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.small,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowCopy: {
    flex: 1,
    gap: 3,
  },
  rowTitle: {
    color: color.textPrimary,
  },
  rowBody: {
    color: color.textSecondary,
  },
  rowMeta: {
    color: color.textMuted,
    marginTop: 2,
  },
  box: {
    width: 26,
    height: 26,
    borderRadius: 9,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.4,
  },
  segment: {
    flexDirection: 'row',
    gap: SEG_GAP,
    minHeight: 48,
    borderRadius: radius.medium,
    backgroundColor: overlay.glass,
    borderWidth: 1,
    borderColor: color.borderSubtle,
    padding: SEG_PAD,
    position: 'relative',
    overflow: 'hidden',
  },
  segThumb: {
    position: 'absolute',
    top: SEG_PAD,
    bottom: SEG_PAD,
    left: SEG_PAD,
    borderRadius: radius.small,
    borderWidth: 1,
  },
  segButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: radius.small,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space[2],
    zIndex: 1,
  },
  toggleRow: {
    minHeight: touchTarget.minimum,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[4],
    paddingVertical: space[1],
  },
  track: {
    width: TRACK_WIDTH,
    height: 32,
    borderRadius: radius.pill,
    borderWidth: 1,
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  knob: {
    width: KNOB,
    height: KNOB,
    borderRadius: radius.pill,
  },
});
