import { preload } from 'expo-audio';
import { router } from 'expo-router';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  Animated,
  AppState,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { GIMBAR_TILT_SUPPORTED, useGimbarSession } from '../../domain/gimbar/context';
import {
  beginTurn,
  cardText,
  confirmSummary,
  currentGuesserId,
  currentRound,
  expireTurn,
  getGimbarPlayerName,
  gimbarStandings,
  markCard,
  pauseTurn,
  resumeTurn,
  togglePlay,
  turnCorrectCount,
} from '../../domain/gimbar/machine';
import type { GimbarResult, GimbarSession } from '../../domain/gimbar/types';
import { hapticImpact, hapticSuccess } from '../../theme/haptics';
import { useEnterAnimation } from '../../theme/motion';
import { alpha, color, mix, overlay, radius, space } from '../../theme/tokens';
import { family, type } from '../../theme/typography';
import { SOUND_VOLUME } from '../../theme/soundLevels';
import { useSoundEffect } from '../../theme/useSoundEffect';
import { ResultHero } from '../session/ResultHero';
import { leaders, Standings } from '../session/Scoreboards';
import { SessionShell } from '../session/SessionShell';
import { useCountdown, useSessionKeepAwake } from '../session/useCountdown';
import { Dialog } from '../ui/Dialog';
import { Icon } from '../ui/Icon';
import { PressableScale } from '../ui/PressableScale';
import { PrimaryButton } from '../ui/PrimaryButton';
import { SecondaryButton } from '../ui/SecondaryButton';
import { Surface } from '../ui/Surface';
import { useMotionAvailable, useTilt } from './useTilt';
import { GlyphDisk } from '../ui/GlyphDisk';

const ACCENT = color.gameGimbar;
const STAGES = ['ready', 'play', 'summary', 'result'] as const;
const FLASH_MS = 650;
const CORRECT_SOUND = require('../../../assets/sounds/taboo-correct.wav');
const PASS_SOUND = require('../../../assets/sounds/gimbar-pass.wav');
const COUNT_SOUND = require('../../../assets/sounds/most-likely-count.wav');
const GO_SOUND = require('../../../assets/sounds/most-likely-point.wav');
const TICK_SOUND = require('../../../assets/sounds/taboo-last-three.wav');
const TIME_UP_SOUND = require('../../../assets/sounds/taboo-time-up.wav');

void preload(CORRECT_SOUND);
void preload(PASS_SOUND);
void preload(COUNT_SOUND);
void preload(GO_SOUND);
void preload(TICK_SOUND);
void preload(TIME_UP_SOUND);

function endGame(clearSession: () => void) {
  router.replace('/home');
  clearSession();
}

function useTiltActive(session: GimbarSession): boolean {
  const wantsTilt = session.setup.control === 'tilt' && GIMBAR_TILT_SUPPORTED;
  return useMotionAvailable(wantsTilt) === true;
}

/**
 * Lays its children out landscape. On a portrait phone the block is turned a
 * quarter clockwise, so the room reads it with the phone held sideways.
 */
function LandscapeStage({ background, children }: { background: string; children: ReactNode }) {
  const { width, height } = useWindowDimensions();
  const rotate = height > width;
  return (
    <View style={[styles.stage, { backgroundColor: background }]}>
      <View
        style={
          rotate
            ? { width: height, height: width, transform: [{ rotate: '90deg' }] }
            : { width, height }
        }
      >
        {children}
      </View>
    </View>
  );
}

function ControlsHint({ tilt }: { tilt: boolean }) {
  return (
    <View style={styles.hintRow}>
      <View style={styles.hintItem}>
        <Icon name={tilt ? 'chevronDown' : 'chevronRight'} size={18} color={color.success} />
        <Text style={[type.bodySm, styles.hintText]}>
          {tilt ? 'Tilt screen down: got it' : 'Tap the right half: got it'}
        </Text>
      </View>
      <View style={styles.hintItem}>
        <Icon name={tilt ? 'chevronUp' : 'arrowLeft'} size={18} color={color.brandPrimary} />
        <Text style={[type.bodySm, styles.hintText]}>
          {tilt ? 'Tilt screen up: pass' : 'Tap the left half: pass'}
        </Text>
      </View>
    </View>
  );
}

function ReadyPhase({ session }: { session: GimbarSession }) {
  const { apply, clearSession } = useGimbarSession();
  const [placing, setPlacing] = useState(false);
  const tilt = useTiltActive(session);
  const name = getGimbarPlayerName(session, currentGuesserId(session));
  const rounds = session.setup.roundsPerPlayer;
  const enter = useEnterAnimation(1, 16);
  const standings = gimbarStandings(session);
  const wantedTilt = session.setup.control === 'tilt' && GIMBAR_TILT_SUPPORTED;

  if (placing) {
    return <PlacingCountdown name={name} onDone={() => apply(beginTurn)} />;
  }

  return (
    <SessionShell
      eyebrow={
        rounds > 1
          ? `Round ${currentRound(session)}/${rounds} · Turn ${session.turnIndex + 1}/${session.totalTurns}`
          : `Turn ${session.turnIndex + 1}/${session.totalTurns}`
      }
      stage="ready"
      stages={STAGES}
      title={`${name} guesses`}
      subtitle="Hold the phone sideways on your forehead, screen facing the room. Everyone else acts, hums and describes."
      accent={ACCENT}
      onEndGame={() => endGame(clearSession)}
      footer={
        <PrimaryButton
          label={`Start ${session.setup.turnSeconds}s`}
          icon="clock"
          onPress={() => setPlacing(true)}
        />
      }
    >
      <Animated.View style={[styles.readyBody, enter]}>
        <Surface accent={ACCENT} active contentStyle={styles.readyCard}>
          <Text style={[type.eyebrow, { color: ACCENT }]}>Controls</Text>
          <ControlsHint tilt={tilt} />
          {wantedTilt && !tilt ? (
            <Text style={[type.bodySm, styles.muted]}>
              Motion sensor unavailable, so this turn uses taps.
            </Text>
          ) : null}
          <Text style={[type.bodySm, styles.muted]}>
            Turn the phone so the words read upright for the room.
          </Text>
        </Surface>
        {session.turnIndex > 0 ? (
          <ScrollView showsVerticalScrollIndicator={false}>
            <Standings rows={standings} accent={ACCENT} />
          </ScrollView>
        ) : null}
      </Animated.View>
    </SessionShell>
  );
}

/** "Put it on your forehead" 3-2-1, shown sideways before the first card. */
function PlacingCountdown({ name, onDone }: { name: string; onDone: () => void }) {
  const [count, setCount] = useState(3);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;
  const playCount = useSoundEffect(COUNT_SOUND, SOUND_VOLUME.cue);
  const playGo = useSoundEffect(GO_SOUND, SOUND_VOLUME.result);
  useSessionKeepAwake();

  useEffect(() => {
    if (count <= 0) {
      playGo();
      onDoneRef.current();
      return;
    }
    playCount();
    hapticImpact(count === 1 ? 'medium' : 'light');
    const id = setTimeout(() => setCount((value) => value - 1), 1000);
    return () => clearTimeout(id);
  }, [count, playCount, playGo]);

  return (
    <LandscapeStage background={color.background}>
      <View style={styles.centerFill}>
        <Text style={[type.eyebrow, { color: ACCENT }]}>On your forehead, {name}</Text>
        <Text style={styles.countdown}>{Math.max(count, 1)}</Text>
        <Text style={[type.body, styles.muted]}>Screen facing the room</Text>
      </View>
    </LandscapeStage>
  );
}

function PlayingPhase({ session }: { session: GimbarSession }) {
  const { apply, clearSession } = useGimbarSession();
  const paused = session.phase === 'paused';
  const tilt = useTiltActive(session);
  const [flash, setFlash] = useState<GimbarResult | null>(null);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const playCorrect = useSoundEffect(CORRECT_SOUND, SOUND_VOLUME.cue);
  const playPass = useSoundEffect(PASS_SOUND, SOUND_VOLUME.soft);
  const playTick = useSoundEffect(TICK_SOUND, SOUND_VOLUME.soft);
  const name = getGimbarPlayerName(session, currentGuesserId(session));

  useSessionKeepAwake(!paused);

  const { leftSeconds } = useCountdown({
    durationMs: session.setup.turnSeconds * 1000,
    running: !paused,
    resetKey: session.turnIndex,
    onExpire: () => apply(expireTurn),
  });

  useEffect(() => {
    if (paused) return;
    if (leftSeconds > 0 && leftSeconds <= 3) playTick();
  }, [leftSeconds, paused, playTick]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state !== 'active') apply(pauseTurn);
    });
    return () => subscription.remove();
  }, [apply]);

  useEffect(
    () => () => {
      if (flashTimer.current) clearTimeout(flashTimer.current);
    },
    [],
  );

  const mark = (result: GimbarResult) => {
    if (flash || paused || !session.currentCard) return;
    if (result === 'correct') {
      playCorrect();
      hapticSuccess();
    } else {
      playPass();
      hapticImpact('medium');
    }
    setFlash(result);
    apply((current) => markCard(current, result));
    flashTimer.current = setTimeout(() => setFlash(null), FLASH_MS);
  };

  useTilt(tilt && !paused && !flash, mark);

  if (paused) {
    return (
      <SessionShell
        eyebrow="Paused"
        stage="play"
        stages={STAGES}
        title={`${name}'s turn is paused`}
        subtitle={`${leftSeconds}s left · ${turnCorrectCount(session)} guessed so far`}
        accent={ACCENT}
        onEndGame={() => endGame(clearSession)}
        footer={
          <>
            <PrimaryButton label="Resume" icon="clock" onPress={() => apply(resumeTurn)} />
            <SecondaryButton label="End this turn" onPress={() => apply(expireTurn)} />
          </>
        }
      >
        <View style={styles.centerFill}>
          <GlyphDisk icon="pause" accent={ACCENT} size={96} />
          <Text style={[type.body, styles.muted]}>The card stays hidden until you resume.</Text>
        </View>
      </SessionShell>
    );
  }

  const background =
    flash === 'correct'
      ? alpha(color.success, 0.92)
      : flash === 'pass'
        ? alpha(color.brandPrimary, 0.92)
        : mix(color.background, ACCENT, 0.2);
  const urgent = leftSeconds <= 10;
  const text = session.currentCard ? cardText(session, session.currentCard) : '';

  return (
    <LandscapeStage background={background}>
      <View style={styles.playFill}>
        {!tilt ? (
          <View style={styles.tapLayer} pointerEvents={flash ? 'none' : 'auto'}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Pass"
              onPress={() => mark('pass')}
              style={styles.tapZone}
            >
              <View style={[styles.tapLabel, styles.tapPass]}>
                <Icon name="arrowLeft" size={20} color={color.brandPrimary} />
                <Text style={[type.button, { color: color.brandPrimary }]}>Pass</Text>
              </View>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Got it"
              onPress={() => mark('correct')}
              style={styles.tapZone}
            >
              <View style={[styles.tapLabel, styles.tapCorrect]}>
                <Text style={[type.button, { color: color.success }]}>Got it</Text>
                <Icon name="check" size={20} color={color.success} />
              </View>
            </Pressable>
          </View>
        ) : null}

        <View style={styles.playTop} pointerEvents="box-none">
          <Text style={[styles.timer, urgent && !flash && { color: color.dangerUrgency }]}>
            {String(leftSeconds).padStart(2, '0')}
          </Text>
          <Text style={[type.eyebrow, styles.score]}>{turnCorrectCount(session)} got</Text>
          <PressableScale
            accessibilityRole="button"
            accessibilityLabel="Pause turn"
            onPress={() => apply(pauseTurn)}
            haptic="selection"
            scaleTo={0.92}
            style={styles.pauseButton}
          >
            <Icon name="pause" size={20} color={color.textPrimary} strokeWidth={2.4} />
          </PressableScale>
        </View>

        <View style={styles.cardArea} pointerEvents="none">
          {flash ? (
            <Text style={styles.flashText}>{flash === 'correct' ? 'Got it!' : 'Pass'}</Text>
          ) : (
            <Text
              style={[
                styles.cardText,
                session.contentLanguage !== 'en' ? { fontFamily: family.ethiopic.bold } : null,
              ]}
              numberOfLines={3}
              adjustsFontSizeToFit
              minimumFontScale={0.4}
            >
              {text}
            </Text>
          )}
        </View>

        {tilt ? (
          <Text style={[type.eyebrow, styles.tiltNote]}>Tilt down: got it · Tilt up: pass</Text>
        ) : null}
      </View>
    </LandscapeStage>
  );
}

function SummaryPhase({ session }: { session: GimbarSession }) {
  const { apply, clearSession } = useGimbarSession();
  const playTimeUp = useSoundEffect(TIME_UP_SOUND, SOUND_VOLUME.result);
  const name = getGimbarPlayerName(session, currentGuesserId(session));
  const last = session.turnIndex + 1 >= session.totalTurns;
  const correct = turnCorrectCount(session);

  useEffect(() => playTimeUp(), [playTimeUp]);

  return (
    <SessionShell
      eyebrow="Time"
      stage="summary"
      stages={STAGES}
      title={`${name} got ${correct}`}
      subtitle={
        session.plays.length ? 'Tap a card to fix a mistake.' : 'No cards this turn.'
      }
      accent={ACCENT}
      onEndGame={() => endGame(clearSession)}
      footer={
        <PrimaryButton
          label={last ? 'See results' : 'Next player'}
          icon="chevronRight"
          onPress={() => apply(confirmSummary)}
        />
      }
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.playList}>
        {session.plays.map((play, index) => {
          const ok = play.result === 'correct';
          return (
            <PressableScale
              key={`${play.cardId}-${index}`}
              accessibilityRole="button"
              accessibilityLabel={`${play.text}, ${ok ? 'got it' : 'passed'}. Tap to change.`}
              onPress={() => apply((current) => togglePlay(current, index))}
              haptic="selection"
              scaleTo={0.98}
              style={[
                styles.playRow,
                ok && { borderColor: alpha(color.success, 0.45), backgroundColor: alpha(color.success, 0.1) },
              ]}
            >
              <Icon
                name={ok ? 'checkCircle' : 'close'}
                size={20}
                color={ok ? color.success : color.textMuted}
              />
              <Text
                style={[type.titleMd, ok ? styles.playText : styles.playTextMuted]}
                numberOfLines={2}
              >
                {play.text}
              </Text>
            </PressableScale>
          );
        })}
      </ScrollView>
    </SessionShell>
  );
}

function FinalPhase({ session }: { session: GimbarSession }) {
  const { rematch, clearSession } = useGimbarSession();
  const [deckError, setDeckError] = useState(false);
  const rows = gimbarStandings(session);
  const top = leaders(rows);
  const enter = useEnterAnimation(1, 16);
  const headline =
    top.length === 0
      ? 'No points this time'
      : top.length === 1
        ? `${top[0]!.name} wins`
        : `${top.map((row) => row.name).join(' & ')} tie`;

  return (
    <SessionShell
      eyebrow="Final"
      stage="result"
      stages={STAGES}
      accent={ACCENT}
      footer={
        <>
          <PrimaryButton
            label="Play again"
            icon="refresh"
            onPress={() => {
              if (!rematch()) setDeckError(true);
            }}
          />
          <View style={styles.row}>
            <View style={styles.half}>
              <SecondaryButton
                label="Change setup"
                onPress={() => {
                  clearSession();
                  router.replace('/game/gimbar/setup/review');
                }}
              />
            </View>
            <View style={styles.half}>
              <SecondaryButton label="Home" onPress={() => endGame(clearSession)} />
            </View>
          </View>
        </>
      }
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.finalScroll}>
        <Animated.View style={[styles.finalHead, enter]}>
          <ResultHero scene="celebrate" accent={ACCENT} title={headline} />
        </Animated.View>
        <Standings rows={rows} accent={ACCENT} />
      </ScrollView>

      <Dialog
        visible={deckError}
        moon="caught"
        accent={color.brandPrimary}
        title="Could not rematch"
        message="No cards match these categories and levels."
        confirmLabel="Got it"
        confirmTone="honey"
        onConfirm={() => setDeckError(false)}
      />
    </SessionShell>
  );
}

export function GimbarSessionView({ session }: { session: GimbarSession }) {
  switch (session.phase) {
    case 'ready':
      return <ReadyPhase session={session} />;
    case 'playing':
    case 'paused':
      return <PlayingPhase session={session} />;
    case 'summary':
      return <SummaryPhase session={session} />;
    case 'final':
      return <FinalPhase session={session} />;
    default:
      return null;
  }
}

const styles = StyleSheet.create({
  stage: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  centerFill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space[3],
    padding: space[6],
  },
  countdown: {
    color: color.textPrimary,
    fontFamily: family.display.black,
    fontSize: 140,
    lineHeight: 150,
  },
  muted: {
    color: color.textMuted,
    textAlign: 'center',
  },
  readyBody: {
    flex: 1,
    gap: space[4],
  },
  readyCard: {
    padding: space[5],
    gap: space[3],
  },
  hintRow: {
    gap: space[2],
  },
  hintItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
  },
  hintText: {
    color: color.textSecondary,
    flex: 1,
  },
  playFill: {
    flex: 1,
    paddingHorizontal: space[10],
    paddingVertical: space[5],
  },
  playTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[4],
  },
  timer: {
    color: color.textPrimary,
    fontFamily: family.mono.bold,
    fontSize: 36,
    lineHeight: 40,
  },
  score: {
    color: color.textPrimary,
    flex: 1,
  },
  pauseButton: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: overlay.glassStrong,
    borderWidth: 1,
    borderColor: color.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space[4],
  },
  cardText: {
    ...type.brushHero,
    color: color.textPrimary,
    fontSize: 76,
    lineHeight: 88,
    textAlign: 'center',
    paddingHorizontal: 6,
    textShadowColor: alpha(ACCENT, 0.45),
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 18,
  },
  flashText: {
    ...type.brushHero,
    color: color.void,
    fontSize: 84,
    lineHeight: 96,
    textAlign: 'center',
    paddingHorizontal: 6,
  },
  tapLayer: {
    ...StyleSheet.absoluteFill,
    flexDirection: 'row',
  },
  tapZone: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: space[5],
  },
  tapLabel: {
    minHeight: 48,
    paddingHorizontal: space[5],
    borderRadius: radius.pill,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
  },
  tapPass: {
    borderColor: alpha(color.brandPrimary, 0.4),
    backgroundColor: alpha(color.brandPrimary, 0.1),
  },
  tapCorrect: {
    borderColor: alpha(color.success, 0.45),
    backgroundColor: alpha(color.success, 0.12),
  },
  tiltNote: {
    color: color.textMuted,
    textAlign: 'center',
  },
  playList: {
    gap: space[2],
    paddingBottom: space[4],
  },
  playRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    padding: space[4],
    borderRadius: radius.medium,
    borderWidth: 1,
    borderColor: color.borderSubtle,
    backgroundColor: overlay.glass,
  },
  playText: {
    color: color.textPrimary,
    flex: 1,
  },
  playTextMuted: {
    color: color.textMuted,
    flex: 1,
    textDecorationLine: 'line-through',
  },
  finalScroll: {
    gap: space[5],
    paddingBottom: space[4],
  },
  finalHead: {
    alignItems: 'center',
    gap: space[3],
    paddingTop: space[2],
  },
  title: {
    color: color.textPrimary,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    gap: space[3],
  },
  half: {
    flex: 1,
  },
});
