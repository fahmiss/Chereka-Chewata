import { LinearGradient } from 'expo-linear-gradient';
import { preload } from 'expo-audio';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Animated, AppState, Easing, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { hapticImpact, hapticSuccess } from '../../theme/haptics';
import { duration, easeOut, useReducedMotion } from '../../theme/motion';
import { alpha, color, glow, radius, space } from '../../theme/tokens';
import { type } from '../../theme/typography';
import { SOUND_VOLUME } from '../../theme/soundLevels';
import { useSoundEffect } from '../../theme/useSoundEffect';
import { MoonFace } from '../brand/MoonFace';
import { AnimatedSvgCircle } from '../ui/AnimatedSvgCircle';
import { Icon } from '../ui/Icon';
import { PressableScale } from '../ui/PressableScale';

const REVEAL_SOUND = require('../../../assets/sounds/secret-reveal.wav');
void preload(REVEAL_SOUND);

const HOLD_RING = 168;
const HOLD_STROKE = 7;
const HOLD_RADIUS = (HOLD_RING - HOLD_STROKE) / 2;
const HOLD_CIRC = 2 * Math.PI * HOLD_RADIUS;

/**
 * Private reveal state for one player. Resets whenever `resetKey` changes and
 * hides the secret again the moment the app leaves the foreground.
 */
export function useHoldReveal(resetKey: string | number) {
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    setUnlocked(false);
  }, [resetKey]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state !== 'active') setUnlocked(false);
    });
    return () => sub.remove();
  }, []);

  return { unlocked, unlock: () => setUnlocked(true) };
}

type Props = {
  accent: string;
  unlocked: boolean;
  onUnlock: () => void;
  /** Changes per player so a half-filled ring never carries over. */
  resetKey: string | number;
  /** What the hidden card says to the holder. */
  label?: string;
  /** Plays the shared reveal chime; Impostor-style silent games pass false. */
  sound?: boolean;
  children: ReactNode;
};

/** Press-and-hold secret card shared by the role-reveal games. */
export function HoldToReveal({
  accent,
  unlocked,
  onUnlock,
  resetKey,
  label = 'Hold to reveal',
  sound = true,
  children,
}: Props) {
  const hold = useRef(new Animated.Value(0)).current;
  const holdAnim = useRef<Animated.CompositeAnimation | null>(null);
  const fade = useRef(new Animated.Value(0)).current;
  const revealScale = useRef(new Animated.Value(0.96)).current;
  const reduced = useReducedMotion();
  const playReveal = useSoundEffect(REVEAL_SOUND, SOUND_VOLUME.soft);

  useEffect(() => {
    holdAnim.current?.stop();
    hold.setValue(0);
    fade.setValue(0);
    revealScale.setValue(0.96);
  }, [resetKey, hold, fade, revealScale]);

  useEffect(() => {
    if (unlocked) return;
    holdAnim.current?.stop();
    hold.setValue(0);
  }, [unlocked, hold]);

  useEffect(() => {
    if (!unlocked) return;
    if (reduced) {
      fade.setValue(1);
      revealScale.setValue(1);
      return;
    }
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 200, easing: easeOut, useNativeDriver: true }),
      Animated.timing(revealScale, {
        toValue: 1,
        duration: 220,
        easing: easeOut,
        useNativeDriver: true,
      }),
    ]).start();
  }, [unlocked, fade, revealScale, reduced]);

  useEffect(() => {
    if (!unlocked || !sound) return;
    return playReveal();
  }, [playReveal, sound, unlocked]);

  const startHold = () => {
    if (unlocked) return;
    holdAnim.current?.stop();
    if (reduced) {
      hold.setValue(1);
      onUnlock();
      hapticSuccess();
      return;
    }
    hold.setValue(0);
    hapticImpact('light');
    holdAnim.current = Animated.timing(hold, {
      toValue: 1,
      duration: duration.holdReveal,
      easing: Easing.linear,
      useNativeDriver: false,
    });
    holdAnim.current.start(({ finished }) => {
      if (finished) {
        onUnlock();
        hapticSuccess();
      }
    });
  };

  const cancelHold = () => {
    if (unlocked) return;
    holdAnim.current?.stop();
    Animated.timing(hold, {
      toValue: 0,
      duration: reduced ? 0 : 160,
      easing: easeOut,
      useNativeDriver: false,
    }).start();
  };

  const cardAccent = unlocked ? color.brandPrimary : accent;

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={unlocked ? 'Secret shown' : label}
      haptic="none"
      scaleTo={0.99}
      onPressIn={startHold}
      onPressOut={cancelHold}
      style={[
        styles.card,
        { borderColor: alpha(cardAccent, unlocked ? 0.55 : 0.22) },
        glow(cardAccent, unlocked ? 0.4 : 0.18, 28),
      ]}
    >
      <LinearGradient
        colors={[color.surfaceRaised, color.void]}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={[alpha(cardAccent, unlocked ? 0.3 : 0.12), 'transparent']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {!unlocked ? (
        <View style={styles.inner}>
          <View style={styles.holdWrap}>
            <Svg width={HOLD_RING} height={HOLD_RING}>
              <Circle
                cx={HOLD_RING / 2}
                cy={HOLD_RING / 2}
                r={HOLD_RADIUS}
                stroke={alpha(accent, 0.2)}
                strokeWidth={HOLD_STROKE}
                fill="none"
              />
              <AnimatedSvgCircle
                cx={HOLD_RING / 2}
                cy={HOLD_RING / 2}
                r={HOLD_RADIUS}
                stroke={accent}
                strokeWidth={HOLD_STROKE}
                strokeLinecap="round"
                fill="none"
                strokeDasharray={HOLD_CIRC}
                strokeDashoffset={hold.interpolate({
                  inputRange: [0, 1],
                  outputRange: [HOLD_CIRC, 0],
                })}
                transform={`rotate(-90 ${HOLD_RING / 2} ${HOLD_RING / 2})`}
              />
            </Svg>
            <View style={styles.holdCore} pointerEvents="none">
              <MoonFace expression="secret" size={110} />
            </View>
          </View>
          <Text style={[type.eyebrow, styles.eyebrow]}>{label}</Text>
        </View>
      ) : (
        <Animated.View
          style={[styles.inner, { opacity: fade, transform: [{ scale: revealScale }] }]}
        >
          {children}
        </Animated.View>
      )}
    </PressableScale>
  );
}

/** Footer line shown while the secret is still hidden. */
export function HoldHint({ text }: { text: string }) {
  return (
    <View style={styles.hintRow}>
      <Icon name="eye" size={15} color={color.textMuted} />
      <Text style={[type.bodySm, styles.hint]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 340,
    borderRadius: radius.extraLarge,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: space[2],
  },
  inner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: space[6],
    gap: space[4],
    width: '100%',
  },
  holdWrap: {
    width: HOLD_RING,
    height: HOLD_RING,
    alignItems: 'center',
    justifyContent: 'center',
  },
  holdCore: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyebrow: {
    color: color.textMuted,
    marginTop: space[2],
    fontSize: 13,
    letterSpacing: 2,
  },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
    paddingVertical: space[2],
  },
  hint: {
    color: color.textMuted,
    flex: 1,
  },
});
