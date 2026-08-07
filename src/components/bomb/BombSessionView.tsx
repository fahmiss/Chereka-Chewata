import { router } from 'expo-router';
import { useAudioPlayer } from 'expo-audio';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import { Animated, ScrollView, StyleSheet, Text, View } from 'react-native';
import { localizeText } from '../../content/localize';
import { currentBombCard, getBombPlayerName } from '../../domain/bomb/machine';
import { useBombSession } from '../../domain/bomb/SessionContext';
import type { BombSession } from '../../domain/bomb/types';
import { useSettings } from '../../domain/settings/SettingsContext';
import { prepareGameAudio } from '../../theme/audio';
import { hapticImpact } from '../../theme/haptics';
import { easeInOut, easeOut, useEnterAnimation, useReducedMotion } from '../../theme/motion';
import { alpha, color, glow, radius, space } from '../../theme/tokens';
import { family, type } from '../../theme/typography';
import { MoonFace } from '../brand/MoonFace';
import { ReportCardButton } from '../session/ReportCardButton';
import { SessionShell } from '../session/SessionShell';
import { Icon } from '../ui/Icon';
import { PrimaryButton } from '../ui/PrimaryButton';
import { SecondaryButton } from '../ui/SecondaryButton';
import { Surface } from '../ui/Surface';

const ACCENT = color.gameBomb;
const STAGES = ['ready', 'pass', 'boom'] as const;
const FUSE_SOUND = require('../../../assets/sounds/bomb-fuse.wav');
const EXPLOSION_SOUND = require('../../../assets/sounds/bomb-explosion.wav');
const EXPLOSION_ART = require('../../../assets/mascot/moon-bomb-explosion.png');

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
    mascot: {
      transform: [
        { translateX: tremble.interpolate({ inputRange: [-1, 1], outputRange: [-2.5, 2.5] }) },
        { rotate: tremble.interpolate({ inputRange: [-1, 1], outputRange: ['-1deg', '1deg'] }) },
      ],
    },
  };
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
    artwork: {
      opacity: impact,
      transform: [
        { scale: impact.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1] }) },
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
            <MoonFace expression="bomb" size={86} />
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
  const { settings } = useSettings();
  const starter = getBombPlayerName(session, session.startingPlayerId);
  const enter = useEnterAnimation(1, 12);
  const fuseAnimation = useFuseAnimation();
  const fusePlayer = useAudioPlayer(FUSE_SOUND, { updateInterval: 1_000 });

  useEffect(() => {
    let active = true;
    // The bundled track is longer than every possible fuse, avoiding the
    // audible restart seam some native players add to looped WAV files.
    fusePlayer.loop = false;
    fusePlayer.volume = 0.34;

    if (settings.soundEnabled) {
      void prepareGameAudio()
        .then(async () => {
          await fusePlayer.seekTo(0);
          if (active) fusePlayer.play();
        })
        .catch(() => undefined);
    } else {
      fusePlayer.pause();
      void fusePlayer.seekTo(0);
    }

    return () => {
      active = false;
      fusePlayer.pause();
      void fusePlayer.seekTo(0);
    };
  }, [fusePlayer, settings.soundEnabled]);

  useEffect(() => {
    if (!session.fuseEndsAt) return;
    const delay = Math.max(0, session.fuseEndsAt - Date.now());
    const timer = setTimeout(dispatch.explodeBomb, delay);
    return () => clearTimeout(timer);
  }, [session.fuseEndsAt, dispatch]);

  return (
    <SessionShell
      eyebrow="Live round"
      stage="pass"
      stages={STAGES}
      accent={ACCENT}
      onEndGame={() => endGame(clearSession)}
      footer={
        <SecondaryButton label="Pause fuse" icon="clock" onPress={dispatch.pauseBomb} />
      }
    >
      <Animated.View style={[styles.playingBody, enter]}>
        <View style={styles.fuseHero}>
          <Animated.View style={[styles.fuseRing, fuseAnimation.ring]} />
          <Animated.View style={fuseAnimation.mascot}>
            <MoonFace expression="bomb" size={174} />
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

function PausedPhase(_: { session: BombSession }) {
  const { dispatch, clearSession } = useBombSession();

  return (
    <SessionShell
      eyebrow="Paused"
      title="Fuse paused"
      subtitle="Keep the phone where it is."
      stage="pass"
      stages={STAGES}
      accent={ACCENT}
      onEndGame={() => endGame(clearSession)}
      footer={
        <PrimaryButton label="Resume fuse" icon="chevronRight" onPress={dispatch.resumeBomb} />
      }
    >
      <View style={styles.centeredBody}>
        <MoonFace expression="timer" size={104} />
        <Text style={[type.body, styles.passHint]}>
          Resume when everyone is ready. The hidden timer continues from where it stopped.
        </Text>
      </View>
    </SessionShell>
  );
}

function ExplodedPhase(_: { session: BombSession }) {
  const { dispatch, clearSession } = useBombSession();
  const { settings } = useSettings();
  const copyEnter = useEnterAnimation(2, 8);
  const explosionAnimation = useExplosionAnimation();
  const explosionPlayer = useAudioPlayer(EXPLOSION_SOUND);

  useEffect(() => {
    hapticImpact('medium');
    if (!settings.soundEnabled) return;

    let active = true;
    explosionPlayer.volume = 0.9;
    void prepareGameAudio()
      .then(async () => {
        await explosionPlayer.seekTo(0);
        if (active) explosionPlayer.play();
      })
      .catch(() => undefined);
    return () => {
      active = false;
      explosionPlayer.pause();
    };
  }, [explosionPlayer, settings.soundEnabled]);

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
          <View style={[styles.explosionShadow, glow(color.dangerUrgency, 0.38, 30)]}>
            <View style={styles.explosionClip}>
              <Animated.Image
                source={EXPLOSION_ART}
                resizeMode="cover"
                style={[styles.explosionArtwork, explosionAnimation.artwork]}
                accessibilityLabel="The Chereka moon surprised by an explosion"
              />
              <LinearGradient
                pointerEvents="none"
                colors={['transparent', alpha(color.void, 0.08), alpha(color.void, 0.82)]}
                locations={[0.48, 0.7, 1]}
                style={StyleSheet.absoluteFill}
              />
              <Animated.View
                pointerEvents="none"
                style={[styles.explosionFlash, explosionAnimation.flash]}
              />
              <View style={styles.boomOverlay}>
                <Text style={styles.boomText}>BOOM!</Text>
              </View>
            </View>
          </View>

          <Animated.View style={[styles.explosionCopy, copyEnter]}>
            <Text style={[type.displayMd, styles.explosionTitle]}>Who had the phone?</Text>
            <Text style={[type.body, styles.passHint]}>That player loses this round.</Text>
          </Animated.View>
        </View>
      </ScrollView>
    </SessionShell>
  );
}

export function BombSessionView({ session }: { session: BombSession }) {
  switch (session.phase) {
    case 'ready': return <ReadyPhase session={session} />;
    case 'playing': return <PlayingPhase session={session} />;
    case 'paused': return <PausedPhase session={session} />;
    case 'exploded': return <ExplodedPhase session={session} />;
  }
}

const styles = StyleSheet.create({
  readyBody: { gap: space[5], paddingBottom: space[4] },
  categoryCard: { minHeight: 250, padding: space[6], alignItems: 'center', justifyContent: 'center', gap: space[3] },
  category: { color: color.textPrimary, fontFamily: family.display.black, fontSize: 34, lineHeight: 40, textAlign: 'center' },
  playingBody: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space[4] },
  fuseHero: { width: 190, height: 184, alignItems: 'center', justifyContent: 'center' },
  fuseRing: { position: 'absolute', width: 156, height: 156, borderRadius: radius.pill, backgroundColor: alpha(color.dangerUrgency, 0.22), borderWidth: 1, borderColor: alpha(color.dangerUrgency, 0.6) },
  liveBadge: { position: 'absolute', bottom: 0, flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 12, paddingVertical: 7, borderRadius: radius.pill, backgroundColor: color.surfaceRaised, borderWidth: 1, borderColor: alpha(color.dangerUrgency, 0.45) },
  liveDot: { width: 9, height: 9, borderRadius: radius.pill, backgroundColor: color.dangerUrgency },
  liveBadgeText: { color: color.dangerUrgency, fontSize: 11, letterSpacing: 1.2 },
  promptSurface: { width: '100%' },
  promptCard: { minHeight: 142, paddingHorizontal: space[5], paddingVertical: space[4], alignItems: 'center', justifyContent: 'center', gap: space[2] },
  promptLabel: { color: ACCENT },
  playingCategory: { color: color.textPrimary, fontFamily: family.display.black, fontSize: 34, lineHeight: 39, textAlign: 'center' },
  passRule: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space[3] },
  passRuleStrong: { color: color.textPrimary, fontFamily: family.display.black, fontSize: 18, lineHeight: 22, letterSpacing: 0.7 },
  starterLabel: { color: color.textMuted, textAlign: 'center', fontSize: 11, letterSpacing: 0.7 },
  passHint: { color: color.textSecondary, textAlign: 'center' },
  explodedScroll: { flexGrow: 1, justifyContent: 'center', paddingBottom: space[4] },
  explodedBody: { alignItems: 'center', justifyContent: 'center', gap: space[5] },
  explosionShadow: { width: '100%', aspectRatio: 1, borderRadius: radius.extraLarge },
  explosionClip: { flex: 1, overflow: 'hidden', borderRadius: radius.extraLarge, borderWidth: 1, borderColor: alpha(color.dangerUrgency, 0.58), backgroundColor: color.surface },
  explosionArtwork: { width: '100%', height: '100%' },
  explosionFlash: { ...StyleSheet.absoluteFillObject, backgroundColor: '#FFF2D6' },
  boomOverlay: { position: 'absolute', left: 0, right: 0, bottom: space[5], alignItems: 'center' },
  boomText: { color: color.dangerUrgency, fontFamily: family.display.black, fontSize: 48, lineHeight: 52, letterSpacing: 2.4, textShadowColor: alpha(color.void, 0.95), textShadowOffset: { width: 0, height: 3 }, textShadowRadius: 12 },
  explosionCopy: { alignItems: 'center', gap: space[2] },
  explosionTitle: { color: color.textPrimary, textAlign: 'center' },
  centeredBody: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space[4] },
});
