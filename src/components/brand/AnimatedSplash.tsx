import { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { useReducedMotion } from '../../theme/motion';
import { color } from '../../theme/tokens';
import { MoonFace } from './MoonFace';

type Props = {
  /** Fonts + first content are ready — fade the overlay out. */
  ready: boolean;
};

const GLOW_SIZE = 320;
// Matches the native launch screen's imageWidth (app.json expo-splash-screen
// config) so the JS overlay lands on an identical frame — no pop-in flash.
const MASCOT_SIZE = 150;

// Scattered across the full screen (percent-based), not just around the mascot —
// reads as a night sky rather than a decoration stuck to the logo.
const STARS = [
  { top: '10%', left: '18%', size: 4, fill: color.brandMystery, delay: 900 },
  { top: '16%', left: '82%', size: 3, fill: color.brandPrimary, delay: 1400 },
  { top: '24%', left: '48%', size: 3, fill: color.info, delay: 1100 },
  { top: '30%', left: '12%', size: 5, fill: color.success, delay: 600 },
  { top: '34%', left: '88%', size: 4, fill: color.dangerUrgency, delay: 1700 },
  { top: '66%', left: '10%', size: 4, fill: color.brandPrimary, delay: 1250 },
  { top: '70%', left: '90%', size: 3, fill: color.brandMystery, delay: 800 },
  { top: '80%', left: '30%', size: 3, fill: color.info, delay: 1550 },
  { top: '84%', left: '70%', size: 5, fill: color.success, delay: 1000 },
] as const;

/**
 * JS overlay shown the instant the native launch screen hides. The native
 * storyboard can only ever be a static frame (it renders before JS starts),
 * so it's configured to land on the exact same navy-background-plus-mascot
 * frame this component opens on — no flash, no pop-in from nothing. From
 * there this component does what the native screen can't: a night-sky
 * vignette, a slow dual-tone breathing glow, an arrival ring pulse, a settle
 * bounce, and a gentle idle float/sway — then fades out once `ready` flips,
 * handing off to the real app underneath.
 */
export function AnimatedSplash({ ready }: Props) {
  const reduced = useReducedMotion();

  const bounce = useRef(new Animated.Value(1)).current;
  const sway = useRef(new Animated.Value(0)).current;
  const breathe = useRef(new Animated.Value(0)).current;
  const ringScale = useRef(new Animated.Value(0.6)).current;
  const ringOpacity = useRef(new Animated.Value(0)).current;
  const overlayOpacity = useRef(new Animated.Value(1)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;
  const starValues = useMemo(() => STARS.map(() => new Animated.Value(reduced ? 0.35 : 0)), [reduced]);

  useEffect(() => {
    Animated.timing(glowOpacity, {
      toValue: 1,
      duration: 550,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();

    if (reduced) return;

    const bounceAnim = Animated.sequence([
      Animated.delay(120),
      Animated.spring(bounce, { toValue: 1.08, friction: 4, tension: 140, useNativeDriver: true }),
      Animated.spring(bounce, { toValue: 1, friction: 5, tension: 120, useNativeDriver: true }),
    ]);
    bounceAnim.start();

    const ringAnim = Animated.sequence([
      Animated.delay(160),
      Animated.parallel([
        Animated.timing(ringOpacity, {
          toValue: 0.5,
          duration: 40,
          useNativeDriver: true,
        }),
        Animated.timing(ringScale, {
          toValue: 1.6,
          duration: 760,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(ringOpacity, {
        toValue: 0,
        duration: 380,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]);
    ringAnim.start();

    const swayLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(sway, {
          toValue: 1,
          duration: 1900,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(sway, {
          toValue: 0,
          duration: 1900,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    swayLoop.start();

    const breatheLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, {
          toValue: 1,
          duration: 2600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(breathe, {
          toValue: 0,
          duration: 2600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    breatheLoop.start();

    const starLoops = starValues.map((value, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(STARS[index].delay),
          Animated.timing(value, {
            toValue: 1,
            duration: 1100,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(value, {
            toValue: 0.15,
            duration: 1100,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      ),
    );
    starLoops.forEach((loop) => loop.start());

    return () => {
      swayLoop.stop();
      breatheLoop.stop();
      starLoops.forEach((loop) => loop.stop());
    };
  }, [reduced, bounce, sway, breathe, ringScale, ringOpacity, glowOpacity, starValues]);

  useEffect(() => {
    if (!ready) return;
    Animated.timing(overlayOpacity, {
      toValue: 0,
      duration: 340,
      delay: 140,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [ready, overlayOpacity]);

  const translateY = sway.interpolate({ inputRange: [0, 1], outputRange: [0, -12] });
  const rotate = sway.interpolate({ inputRange: [0, 1], outputRange: ['-2.5deg', '2.5deg'] });
  const glowScale = breathe.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] });
  const glowPulse = breathe.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] });

  return (
    <Animated.View
      pointerEvents={ready ? 'none' : 'auto'}
      style={[styles.overlay, { opacity: overlayOpacity }]}
    >
      <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
        <Defs>
          <RadialGradient id="vignette" cx="0.5" cy="0.42" r="0.75">
            <Stop offset="0" stopColor={color.surface} stopOpacity={0.9} />
            <Stop offset="0.55" stopColor={color.background} stopOpacity={1} />
            <Stop offset="1" stopColor={color.void} stopOpacity={1} />
          </RadialGradient>
        </Defs>
        <Rect x={0} y={0} width="100%" height="100%" fill="url(#vignette)" />
      </Svg>

      {STARS.map((star, index) => (
        <Animated.View
          key={index}
          style={[
            styles.star,
            {
              top: star.top,
              left: star.left,
              width: star.size,
              height: star.size,
              borderRadius: star.size / 2,
              backgroundColor: star.fill,
              opacity: starValues[index],
            },
          ]}
        />
      ))}

      <View style={styles.stage}>
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            { opacity: Animated.multiply(glowOpacity, glowPulse), transform: [{ scale: glowScale }] },
          ]}
        >
          <Svg width={GLOW_SIZE} height={GLOW_SIZE}>
            <Defs>
              <RadialGradient id="splashGlowGold" cx="0.5" cy="0.5" r="0.5">
                <Stop offset="0" stopColor={color.brandPrimary} stopOpacity={0.34} />
                <Stop offset="0.55" stopColor={color.brandPrimary} stopOpacity={0.1} />
                <Stop offset="1" stopColor={color.brandPrimary} stopOpacity={0} />
              </RadialGradient>
              <RadialGradient id="splashGlowMystery" cx="0.5" cy="0.5" r="0.36">
                <Stop offset="0" stopColor={color.brandMystery} stopOpacity={0.3} />
                <Stop offset="1" stopColor={color.brandMystery} stopOpacity={0} />
              </RadialGradient>
            </Defs>
            <Circle cx={GLOW_SIZE / 2} cy={GLOW_SIZE / 2} r={GLOW_SIZE / 2} fill="url(#splashGlowGold)" />
            <Circle cx={GLOW_SIZE / 2} cy={GLOW_SIZE / 2} r={GLOW_SIZE / 2.6} fill="url(#splashGlowMystery)" />
          </Svg>
        </Animated.View>

        <Animated.View
          style={[
            styles.ring,
            { opacity: ringOpacity, transform: [{ scale: ringScale }] },
          ]}
        />

        <Animated.View style={{ transform: [{ translateY }, { rotate }, { scale: bounce }] }}>
          <MoonFace expression="ready" size={MASCOT_SIZE} />
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: color.background,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
  },
  stage: {
    width: GLOW_SIZE,
    height: GLOW_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: MASCOT_SIZE + 24,
    height: MASCOT_SIZE + 24,
    borderRadius: (MASCOT_SIZE + 24) / 2,
    borderWidth: 1.5,
    borderColor: color.brandPrimary,
  },
  star: {
    position: 'absolute',
  },
});
