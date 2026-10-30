import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, AppState, ScrollView, StyleSheet, Text, View } from 'react-native';
import { localizeText } from '../../content/localize';
import { currentBombCard, getBombPlayerName } from '../../domain/bomb/machine';
import { useBombSession } from '../../domain/bomb/SessionContext';
import type { BombSession } from '../../domain/bomb/types';
import { useSettings } from '../../domain/settings/SettingsContext';
import { hapticHeavy } from '../../theme/haptics';
import { SOUND_VOLUME } from '../../theme/soundLevels';
import { useLoopingSound, useSoundEffect } from '../../theme/useSoundEffect';
import { easeInOut, easeOut, useEnterAnimation, useReducedMotion } from '../../theme/motion';
import { alpha, color, glow, radius, space } from '../../theme/tokens';
import { family, type } from '../../theme/typography';
import Svg, { Circle, Defs, Path, RadialGradient, Stop } from 'react-native-svg';
import { ReportCardButton } from '../session/ReportCardButton';
import { SessionShell } from '../session/SessionShell';
import { Icon } from '../ui/Icon';
import { PrimaryButton } from '../ui/PrimaryButton';
import { SecondaryButton } from '../ui/SecondaryButton';
import { Surface } from '../ui/Surface';
import { GlyphDisk } from '../ui/GlyphDisk';

const ACCENT = color.gameBomb;
const STAGES = ['ready', 'pass', 'boom'] as const;
const FUSE_SOUND = require('../../../assets/sounds/bomb-fuse.wav');
const EXPLOSION_SOUND = require('../../../assets/sounds/bomb-explosion.wav');

function endGame(clearSession: () => void) {
  router.replace('/home');
  clearSession();
}

function localizedPrompt(session: BombSession): string {
  const card = currentBombCard(session);
  if (!card) return '';
  return localizeText(session.contentLanguage, { en: card.prompt_en, am: card.prompt_am });
}

function useFuseAnimation() {
  const reducedMotion = useReducedMotion();
  const pulse = useRef(new Animated.Value(0)).current;
  const tremble = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reducedMotion) {
      pulse.setValue(0.45);
      tremble.setValue(0);
      return;
    }

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 620,
          easing: easeInOut,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 620,
          easing: easeInOut,
          useNativeDriver: true,
        }),
      ]),
    );
    const trembleLoop = Animated.loop(
      Animated.sequence([
        Animated.delay(900),
        Animated.timing(tremble, { toValue: 1, duration: 70, useNativeDriver: true }),
        Animated.timing(tremble, { toValue: -1, duration: 90, useNativeDriver: true }),
        Animated.timing(tremble, { toValue: 0.6, duration: 75, useNativeDriver: true }),
        Animated.timing(tremble, { toValue: 0, duration: 85, useNativeDriver: true }),
      ]),
    );

    pulseLoop.start();
    trembleLoop.start();
    return () => {
      pulseLoop.stop();
      trembleLoop.stop();
    };
  }, [pulse, reducedMotion, tremble]);

  return {
    ring: {
      opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.18, 0.52] }),
      transform: [
        { scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1.08] }) },
      ],
    },
    bomb: {
      transform: [
        { translateX: tremble.interpolate({ inputRange: [-1, 1], outputRange: [-2.5, 2.5] }) },
        { rotate: tremble.interpolate({ inputRange: [-1, 1], outputRange: ['-1deg', '1deg'] }) },
      ],
    },
  };
}

/** Twelve spark rays, alternating long and short, around the centre. */
const RAYS = Array.from({ length: 12 }, (_, i) => {
  const a = (i / 12) * Math.PI * 2;
  const inner = 0.24;
  const outer = i % 2 ? 0.42 : 0.49;
  const spread = 0.09;
  const pt = (r: number, d: number) =>
    `${(0.5 + Math.cos(a + d) * r).toFixed(3)} ${(0.5 + Math.sin(a + d) * r).toFixed(3)}`;
  return `M${pt(inner, -spread)} L${pt(outer, 0)} L${pt(inner, spread)} Z`;
});

/** The blast drawn in Bomb's colours — no art, so it can't go stale. */
function Blast() {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 1 1" preserveAspectRatio="xMidYMid slice">
      <Defs>
        <RadialGradient id="blastCore" cx="0.5" cy="0.5" r="0.5">
          <Stop offset="0" stopColor="#FFF2D6" stopOpacity={1} />
          <Stop offset="0.28" stopColor={color.brandPrimary} stopOpacity={1} />
          <Stop offset="0.6" stopColor={ACCENT} stopOpacity={0.85} />
          <Stop offset="1" stopColor={color.void} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      {RAYS.map((d, i) => (
        <Path key={i} d={d} fill={i % 2 ? color.brandPrimary : ACCENT} opacity={0.9} />
      ))}
      <Circle cx={0.5} cy={0.5} r={0.36} fill="url(#blastCore)" />
    </Svg>
  );
}

function useExplosionAnimation() {
  const reducedMotion = useReducedMotion();
  const impact = useRef(new Animated.Value(0)).current;
  const flash = useRef(new Animated.Value(0.72)).current;

  useEffect(() => {
    if (reducedMotion) {
      impact.setValue(1);
      flash.setValue(0);
      return;
    }

    const animation = Animated.parallel([
      Animated.timing(impact, {
        toValue: 1,
        duration: 260,
        easing: easeOut,
        useNativeDriver: true,
      }),
      Animated.timing(flash, {
        toValue: 0,
        duration: 220,
        easing: easeOut,
        useNativeDriver: true,
      }),
    ]);
    animation.start();
    return () => animation.stop();
  }, [flash, impact, reducedMotion]);

  return {
    blast: {
      opacity: impact,
      transform: [
        { scale: impact.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }) },
      ],
    },
    word: {
      opacity: impact,
      transform: [
        { scale: impact.interpolate({ inputRange: [0, 0.7, 1], outputRange: [2.2, 0.92, 1] }) },
        { rotate: '-6deg' },
      ],
    },
    shake: {
      transform: [
        {
          translateX: impact.interpolate({
            inputRange: [0, 0.2, 0.4, 0.6, 0.8, 1],
            outputRange: [0, -10, 8, -5, 3, 0],
          }),
        },
      ],
    },
    flash: { opacity: flash },
  };
}

function ReadyPhase({ session }: { session: BombSession }) {
  const { dispatch, clearSession } = useBombSession();
  const starter = getBombPlayerName(session, session.startingPlayerId);
  const card = currentBombCard(session);
  const enter = useEnterAnimation(1, 16);

  return (
    <SessionShell
      eyebrow={`Round ${session.roundNumber}`}
      title={`${starter} starts`}
      subtitle="Read the category, then start the hidden fuse."
      stage="ready"
      stages={STAGES}
      accent={ACCENT}
      onEndGame={() => endGame(clearSession)}
      footer={
        <>
          <PrimaryButton label="Light the fuse" icon="flame" onPress={dispatch.startBomb} />
          <SecondaryButton label="Skip category" onPress={dispatch.skipCard} />
          {card ? <ReportCardButton game="bomb" cardId={card.id} onReported={dispatch.skipCard} /> : null}
        </>
      }
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.readyBody}>
        <Animated.View style={enter}>
          <Surface accent={ACCENT} active contentStyle={styles.categoryCard}>
            <GlyphDisk icon="bomb" accent={ACCENT} size={86} />
            <Text style={[type.eyebrow, { color: ACCENT }]}>Category</Text>
            <Text
              style={[
                styles.category,
                session.contentLanguage !== 'en' ? { fontFamily: family.ethiopic.bold } : null,
              ]}
              numberOfLines={3}
              adjustsFontSizeToFit
            >
              {localizedPrompt(session)}
            </Text>
          </Surface>
        </Animated.View>
      </ScrollView>
    </SessionShell>
  );
}

function PlayingPhase({ session }: { session: BombSession }) {
  const { dispatch, clearSession } = useBombSession();
  const starter = getBombPlayerName(session, session.startingPlayerId);
  const enter = useEnterAnimation(1, 12);
  const fuseAnimation = useFuseAnimation();

  useEffect(() => {
    if (!session.fuseEndsAt) return;
    const endsAt = session.fuseEndsAt;

    const arm = () => {
      const delay = endsAt - Date.now();
      if (delay <= 0) {
        dispatch.explodeBomb();
        return undefined;
      }
      return setTimeout(dispatch.explodeBomb, delay);
    };

    let timer = arm();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state !== 'active') return;
      if (timer) clearTimeout(timer);
      timer = arm();
    });

    return () => {
      if (timer) clearTimeout(timer);
      subscription.remove();
    };
  }, [session.fuseEndsAt, dispatch]);

  return (
    <SessionShell
      eyebrow="Live round"
      stage="pass"
      stages={STAGES}
      accent={ACCENT}
      onEndGame={() => endGame(clearSession)}
    >
      <Animated.View style={[styles.playingBody, enter]}>
        <View style={styles.fuseHero}>
          <Animated.View style={[styles.fuseRing, fuseAnimation.ring]} />
          <Animated.View style={fuseAnimation.bomb}>
            <GlyphDisk icon="bomb" accent={ACCENT} size={160} />
          </Animated.View>
          <View style={styles.liveBadge}>
            <Animated.View style={[styles.liveDot, { opacity: fuseAnimation.ring.opacity }]} />
            <Text style={[type.mono, styles.liveBadgeText]}>FUSE LIT</Text>
          </View>
        </View>

        <Surface accent={ACCENT} active style={styles.promptSurface} contentStyle={styles.promptCard}>
          <Text style={[type.eyebrow, styles.promptLabel]}>Your category</Text>
          <Text
            style={[
              styles.playingCategory,
              session.contentLanguage !== 'en' ? { fontFamily: family.ethiopic.bold } : null,
            ]}
            numberOfLines={3}
            adjustsFontSizeToFit
          >
            {localizedPrompt(session)}
          </Text>
        </Surface>

        <View style={styles.passRule}>
          <Text style={styles.passRuleStrong}>ONE ANSWER</Text>
          <Icon name="chevronRight" size={18} color={ACCENT} strokeWidth={2.5} />
          <Text style={styles.passRuleStrong}>PASS IT</Text>
        </View>
        <Text style={[type.label, styles.starterLabel]}>STARTED WITH {starter.toUpperCase()} · NO REPEATS</Text>
      </Animated.View>
    </SessionShell>
  );
}

function ExplodedPhase(_: { session: BombSession }) {
  const { dispatch, clearSession } = useBombSession();
  const copyEnter = useEnterAnimation(2, 8);
  const explosionAnimation = useExplosionAnimation();

  useEffect(() => {
    hapticHeavy();
  }, []);

  return (
    <SessionShell
      eyebrow="Round over"
      stage="boom"
      stages={STAGES}
      accent={color.dangerUrgency}
      onEndGame={() => endGame(clearSession)}
      footer={
        <PrimaryButton
          label="New round"
          icon="refresh"
          onPress={dispatch.continueAfterExplosion}
        />
      }
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.explodedScroll}>
        <View style={styles.explodedBody}>
          <Animated.View
            style={[styles.explosionShadow, glow(ACCENT, 0.45, 34), explosionAnimation.shake]}
          >
            <View style={styles.explosionClip}>
              <Animated.View style={[StyleSheet.absoluteFill, explosionAnimation.blast]}>
                <Blast />
              </Animated.View>
              <Animated.View
                pointerEvents="none"
                style={[styles.explosionFlash, explosionAnimation.flash]}
              />
              <Animated.View style={[styles.boomOverlay, explosionAnimation.word]}>
                <Text style={styles.boomText} accessibilityRole="header">
                  BOOM!
                </Text>
              </Animated.View>
            </View>
          </Animated.View>

          <Animated.View style={[styles.explosionCopy, copyEnter]}>
            <Text style={[type.displayMd, styles.explosionTitle]}>Who had the phone?</Text>
            <Text style={[type.body, styles.passHint]}>That player loses this round.</Text>
          </Animated.View>
        </View>
      </ScrollView>
    </SessionShell>
  );
}

/**
 * Fuse and explosion live here rather than in their phases, so both sounds
 * are loaded before the round starts: the fuse ticks the instant it is lit
 * and the boom is ready the moment the hidden timer runs out.
 */
function useBombSounds(phase: BombSession['phase']) {
  const { settings } = useSettings();
  const fuse = useLoopingSound(FUSE_SOUND, SOUND_VOLUME.ambient);
  const playExplosion = useSoundEffect(EXPLOSION_SOUND, SOUND_VOLUME.result);

  useEffect(() => {
    if (phase !== 'playing') return;
    fuse.start();
    return () => fuse.stop();
  }, [fuse, phase, settings.soundEnabled]);

  useEffect(() => {
    if (phase !== 'exploded') return;
    return playExplosion();
  }, [phase, playExplosion]);
}

export function BombSessionView({ session }: { session: BombSession }) {
  useBombSounds(session.phase);
  switch (session.phase) {
    case 'ready': return <ReadyPhase session={session} />;
    case 'playing': return <PlayingPhase session={session} />;
    case 'exploded': return <ExplodedPhase session={session} />;
  }
}

const styles = StyleSheet.create({
  readyBody: { gap: space[5], paddingBottom: space[4] },
  categoryCard: { minHeight: 250, padding: space[6], alignItems: 'center', justifyContent: 'center', gap: space[3] },
  category: { ...type.brushHero, fontSize: 36, lineHeight: 44, color: ACCENT, textAlign: 'center', paddingHorizontal: 4 },
  playingBody: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space[4] },
  fuseHero: { width: 190, height: 184, alignItems: 'center', justifyContent: 'center' },
  fuseRing: { position: 'absolute', width: 156, height: 156, borderRadius: radius.pill, backgroundColor: alpha(color.dangerUrgency, 0.22), borderWidth: 1, borderColor: alpha(color.dangerUrgency, 0.6) },
  liveBadge: { position: 'absolute', bottom: 0, flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 12, paddingVertical: 7, borderRadius: radius.pill, backgroundColor: color.surfaceRaised, borderWidth: 1, borderColor: alpha(color.dangerUrgency, 0.45) },
  liveDot: { width: 9, height: 9, borderRadius: radius.pill, backgroundColor: color.dangerUrgency },
  liveBadgeText: { color: color.dangerUrgency, fontSize: 11, letterSpacing: 1.2 },
  promptSurface: { width: '100%' },
  promptCard: { minHeight: 142, paddingHorizontal: space[5], paddingVertical: space[4], alignItems: 'center', justifyContent: 'center', gap: space[2] },
  promptLabel: { color: ACCENT },
  playingCategory: { ...type.brushHero, fontSize: 36, lineHeight: 44, color: ACCENT, textAlign: 'center', paddingHorizontal: 4 },
  passRule: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space[3] },
  passRuleStrong: { ...type.brushTitle, fontSize: 20, lineHeight: 26, color: color.textPrimary, paddingRight: 3 },
  starterLabel: { color: color.textMuted, textAlign: 'center', fontSize: 11, letterSpacing: 0.7 },
  passHint: { color: color.textSecondary, textAlign: 'center' },
  explodedScroll: { flexGrow: 1, justifyContent: 'center', paddingBottom: space[4] },
  explodedBody: { alignItems: 'center', justifyContent: 'center', gap: space[5] },
  explosionShadow: { width: '100%', aspectRatio: 1, borderRadius: radius.extraLarge },
  explosionClip: { flex: 1, overflow: 'hidden', borderRadius: radius.extraLarge, borderWidth: 1, borderColor: alpha(ACCENT, 0.58), backgroundColor: color.void },
  explosionFlash: { ...StyleSheet.absoluteFill, backgroundColor: '#FFF2D6' },
  boomOverlay: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center' },
  boomText: { ...type.brushHero, fontSize: 84, lineHeight: 96, color: color.textPrimary, paddingHorizontal: 8, textShadowColor: alpha(color.void, 0.9), textShadowOffset: { width: 0, height: 4 }, textShadowRadius: 14 },
  explosionCopy: { alignItems: 'center', gap: space[2] },
  explosionTitle: { color: color.textPrimary, textAlign: 'center' },
});
