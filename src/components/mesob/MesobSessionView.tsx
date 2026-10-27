import { preload } from 'expo-audio';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  Animated,
  AppState,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useMesobSession } from '../../domain/mesob/context';
import {
  beginEntry,
  beginTurn,
  confirmTurn,
  currentDescriberId,
  currentWriterId,
  expireTurn,
  fillFromDeck,
  getMesobPlayerName,
  isDuplicateSlip,
  markCorrect,
  markSkip,
  MESOB_SLIP_MAX_LENGTH,
  normalizeSlip,
  pauseTurn,
  resumeTurn,
  slipById,
  startRound,
  submitSlips,
  undoGuess,
} from '../../domain/mesob/machine';
import { MESOB_ROUND_RULES, type MesobSession } from '../../domain/mesob/types';
import { teamLabel } from '../../domain/shared/utils';
import { hapticSuccess } from '../../theme/haptics';
import { useEnterAnimation } from '../../theme/motion';
import { alpha, color, glow, overlay, radius, space } from '../../theme/tokens';
import { family, type } from '../../theme/typography';
import { useSoundEffect } from '../../theme/useSoundEffect';
import { MoonFace } from '../brand/MoonFace';
import { PassPhoneHandoff } from '../session/PassPhoneHandoff';
import { TeamRoster, TeamScoreStrip } from '../session/Scoreboards';
import { SessionShell } from '../session/SessionShell';
import { useCountdown, useSessionKeepAwake } from '../session/useCountdown';
import { Icon } from '../ui/Icon';
import { PressableScale } from '../ui/PressableScale';
import { PrimaryButton } from '../ui/PrimaryButton';
import { SecondaryButton } from '../ui/SecondaryButton';
import { Surface } from '../ui/Surface';

const ACCENT = color.gameMesob;
const STAGES = ['fill', 'play', 'summary', 'result'] as const;
const CORRECT_SOUND = require('../../../assets/sounds/taboo-correct.wav');
const TICK_SOUND = require('../../../assets/sounds/taboo-last-three.wav');
const TIME_UP_SOUND = require('../../../assets/sounds/taboo-time-up.wav');
const WIN_SOUND = require('../../../assets/sounds/result-win.wav');

void preload(CORRECT_SOUND);
void preload(TICK_SOUND);
void preload(TIME_UP_SOUND);
void preload(WIN_SOUND);

function endGame(clearSession: () => void) {
  router.replace('/home');
  clearSession();
}

function EntryHandoff({ session }: { session: MesobSession }) {
  const { apply, clearSession } = useMesobSession();
  const writerId = currentWriterId(session);
  return (
    <PassPhoneHandoff
      name={writerId ? getMesobPlayerName(session, writerId) : 'Player'}
      index={session.entryIndex + 1}
      total={session.entryOrder.length}
      accent={ACCENT}
      eyebrow="Fill the mesob"
      stage="fill"
      stages={STAGES}
      note="You'll write a few slips in private. Keep them secret until the game."
      onReady={() => apply(beginEntry)}
      onEndGame={() => endGame(clearSession)}
    />
  );
}

function EntryPhase({ session }: { session: MesobSession }) {
  const { apply, clearSession } = useMesobSession();
  const count = session.setup.wordsPerPlayer;
  const [texts, setTexts] = useState<string[]>(() => Array.from({ length: count }, () => ''));
  const writerId = currentWriterId(session);
  const name = writerId ? getMesobPlayerName(session, writerId) : 'Player';

  const problems = useMemo(() => {
    const keys = texts.map((text) => normalizeSlip(text).toLowerCase());
    return texts.map((text, index) => {
      const key = keys[index]!;
      if (!key) return null;
      if (keys.indexOf(key) !== index) return 'You already wrote this one.';
      if (isDuplicateSlip(session, text)) return 'Already in the mesob. Try another.';
      return null;
    });
  }, [session, texts]);

  const filled = texts.filter((text) => normalizeSlip(text)).length;
  const ready = filled === count && problems.every((problem) => !problem);

  return (
    <SessionShell
      eyebrow={`Slips · ${session.entryIndex + 1}/${session.entryOrder.length}`}
      stage="fill"
      stages={STAGES}
      title={`${name}, add ${count}`}
      subtitle="Names, places or things the whole room could guess. Famous people, family jokes, foods."
      accent={ACCENT}
      onEndGame={() => endGame(clearSession)}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.entryList}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {texts.map((text, index) => (
            <View key={index} style={styles.entryItem}>
              <View
                style={[
                  styles.inputRow,
                  problems[index] ? { borderColor: alpha(color.dangerUrgency, 0.6) } : null,
                ]}
              >
                <Text style={[type.numeric, styles.inputIndex]}>
                  {String(index + 1).padStart(2, '0')}
                </Text>
                <TextInput
                  value={text}
                  onChangeText={(value) =>
                    setTexts((current) =>
                      current.map((item, itemIndex) => (itemIndex === index ? value : item)),
                    )
                  }
                  placeholder={index === 0 ? 'e.g. Abebe Bikila' : 'Another slip'}
                  placeholderTextColor={color.textMuted}
                  maxLength={MESOB_SLIP_MAX_LENGTH}
                  autoCapitalize="words"
                  autoCorrect={false}
                  returnKeyType={index === count - 1 ? 'done' : 'next'}
                  style={[type.titleMd, styles.input]}
                  accessibilityLabel={`Slip ${index + 1}`}
                />
              </View>
              {problems[index] ? (
                <Text style={[type.bodySm, styles.problem]}>{problems[index]}</Text>
              ) : null}
            </View>
          ))}

          <PrimaryButton
            label="Drop them in"
            icon="box"
            disabled={!ready}
            onPress={() => apply((current) => submitSlips(current, texts))}
          />
          <SecondaryButton
            label="Let the deck pick for me"
            quiet
            onPress={() => apply(fillFromDeck)}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SessionShell>
  );
}

function RoundIntroPhase({ session }: { session: MesobSession }) {
  const { apply, clearSession } = useMesobSession();
  const rule = MESOB_ROUND_RULES[session.round];
  const enter = useEnterAnimation(1, 16);
  const describerId = currentDescriberId(session);
  const carrySeconds = session.carryMs ? Math.ceil(session.carryMs / 1000) : null;

  return (
    <SessionShell
      eyebrow={`Round ${session.round} of 3`}
      stage="play"
      stages={STAGES}
      title={rule.title}
      subtitle={rule.rule}
      accent={ACCENT}
      onEndGame={() => endGame(clearSession)}
      footer={<PrimaryButton label="Start round" icon="chevronRight" onPress={() => apply(startRound)} />}
    >
      <Animated.View style={[styles.stack, enter]}>
        {session.round > 1 ? (
          <TeamScoreStrip scores={session.scores} activeTeam={null} accent={ACCENT} />
        ) : null}
        <Surface accent={ACCENT} active contentStyle={styles.card}>
          <Text style={[type.eyebrow, { color: ACCENT }]}>
            {session.slips.length} slips in the mesob
          </Text>
          <Text style={[type.body, styles.secondary]}>
            {session.round === 1
              ? 'Same slips all game. Remember them: they come back in rounds 2 and 3.'
              : 'Every slip goes back in. Same slips, harder rule.'}
          </Text>
          {carrySeconds && describerId ? (
            <Text style={[type.bodyStrong, { color: ACCENT }]}>
              {getMesobPlayerName(session, describerId)} keeps going with {carrySeconds}s.
            </Text>
          ) : null}
        </Surface>
      </Animated.View>
    </SessionShell>
  );
}

function TurnReadyPhase({ session }: { session: MesobSession }) {
  const { apply, clearSession } = useMesobSession();
  const describerId = currentDescriberId(session);
  const name = describerId ? getMesobPlayerName(session, describerId) : 'Player';
  const seconds = Math.ceil(session.turnMs / 1000);
  const rule = MESOB_ROUND_RULES[session.round];
  const enter = useEnterAnimation(1, 16);

  return (
    <SessionShell
      eyebrow={`Round ${session.round} · ${rule.title}`}
      stage="play"
      stages={STAGES}
      title={`${teamLabel(session.activeTeam)}: ${name}`}
      subtitle={`${rule.rule} Only ${name} looks at the phone.`}
      accent={ACCENT}
      onEndGame={() => endGame(clearSession)}
      footer={<PrimaryButton label={`Start ${seconds}s`} icon="clock" onPress={() => apply(beginTurn)} />}
    >
      <Animated.View style={[styles.stack, enter]}>
        <TeamScoreStrip scores={session.scores} activeTeam={session.activeTeam} accent={ACCENT} />
        <Text style={[type.mono, styles.secondary]}>{session.basket.length} slips left this round</Text>
        <TeamRoster
          teams={{ a: session.teamA, b: session.teamB }}
          nameOf={(id) => getMesobPlayerName(session, id)}
          highlightId={describerId}
          accent={ACCENT}
        />
      </Animated.View>
    </SessionShell>
  );
}

function PlayingPhase({ session }: { session: MesobSession }) {
  const { apply, clearSession } = useMesobSession();
  const paused = session.phase === 'paused';
  const playCorrect = useSoundEffect(CORRECT_SOUND, 0.62);
  const playTick = useSoundEffect(TICK_SOUND, 0.58);
  const rule = MESOB_ROUND_RULES[session.round];
  const slip = slipById(session, session.currentSlipId);

  useSessionKeepAwake(!paused);

  const { leftMs, leftSeconds, getLeftMs } = useCountdown({
    durationMs: session.turnMs,
    running: !paused,
    resetKey: 0,
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

  const urgent = leftSeconds <= 10;
  const progress = `${Math.max(0, Math.min(100, (leftMs / session.turnMs) * 100))}%` as const;

  return (
    <SessionShell
      eyebrow={paused ? 'Paused' : `Round ${session.round} · ${rule.title}`}
      stage="play"
      stages={STAGES}
      accent={urgent ? color.dangerUrgency : ACCENT}
      onEndGame={() => endGame(clearSession)}
      footer={
        <>
          <PressableScale
            accessibilityRole="button"
            accessibilityLabel="Got it"
            disabled={paused || !slip}
            onPress={() => {
              playCorrect();
              hapticSuccess();
              apply((current) => markCorrect(current, getLeftMs()));
            }}
            haptic="none"
            scaleTo={0.97}
            style={[styles.correctButton, paused && styles.dim]}
          >
            <Icon name="check" size={22} color={color.void} strokeWidth={2.8} />
            <Text style={[type.button, styles.correctLabel]}>Got it</Text>
          </PressableScale>
          <View style={styles.row}>
            <View style={styles.half}>
              <SecondaryButton
                label="Skip"
                icon="shuffle"
                disabled={paused || session.basket.length < 2}
                onPress={() => apply(markSkip)}
              />
            </View>
            <View style={styles.half}>
              <SecondaryButton
                label={paused ? 'Resume' : 'Pause'}
                onPress={() => apply(paused ? resumeTurn : pauseTurn)}
              />
            </View>
          </View>
        </>
      }
    >
      <View style={styles.timerRow}>
        <Text style={[styles.timerDigits, urgent && { color: color.dangerUrgency }]}>
          {String(leftSeconds).padStart(2, '0')}
        </Text>
        <Text style={[type.mono, styles.secondary]}>
          +{session.turnGuessed.length} · {session.basket.length} left
        </Text>
      </View>
      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            { width: progress, backgroundColor: urgent ? color.dangerUrgency : ACCENT },
          ]}
        />
      </View>

      <View style={styles.slipArea}>
        <Surface accent={ACCENT} active contentStyle={styles.slipCard}>
          {paused ? (
            <Text style={[type.body, styles.secondary]}>Paused. The slip is hidden.</Text>
          ) : (
            <>
              <Text style={[type.eyebrow, { color: ACCENT }]}>{rule.title}</Text>
              <Text style={styles.slipText} numberOfLines={3} adjustsFontSizeToFit>
                {slip?.text ?? ''}
              </Text>
            </>
          )}
        </Surface>
      </View>
    </SessionShell>
  );
}

function TurnSummaryPhase({ session }: { session: MesobSession }) {
  const { apply, clearSession } = useMesobSession();
  const playTimeUp = useSoundEffect(TIME_UP_SOUND, 0.78);
  const team = teamLabel(session.activeTeam);

  useEffect(() => playTimeUp(), [playTimeUp]);

  return (
    <SessionShell
      eyebrow="Time"
      stage="summary"
      stages={STAGES}
      title={`${team} got ${session.turnGuessed.length}`}
      subtitle={
        session.turnGuessed.length
          ? 'Tap a slip to put it back if it was not really guessed.'
          : 'Nothing guessed this turn.'
      }
      accent={ACCENT}
      onEndGame={() => endGame(clearSession)}
      footer={<PrimaryButton label="Next team" icon="chevronRight" onPress={() => apply(confirmTurn)} />}
    >
      <TeamScoreStrip scores={session.scores} activeTeam={session.activeTeam} accent={ACCENT} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.guessList}>
        {session.turnGuessed.map((slipId) => (
          <PressableScale
            key={slipId}
            accessibilityRole="button"
            accessibilityLabel={`${slipById(session, slipId)?.text ?? ''}. Tap to put back.`}
            onPress={() => apply((current) => undoGuess(current, slipId))}
            haptic="selection"
            scaleTo={0.98}
            style={styles.guessRow}
          >
            <Icon name="checkCircle" size={20} color={color.success} />
            <Text style={[type.titleMd, styles.guessText]} numberOfLines={2}>
              {slipById(session, slipId)?.text ?? ''}
            </Text>
            <Text style={[type.label, styles.secondary]}>Undo</Text>
          </PressableScale>
        ))}
      </ScrollView>
    </SessionShell>
  );
}

function FinalPhase({ session }: { session: MesobSession }) {
  const { rematch, clearSession } = useMesobSession();
  const playWin = useSoundEffect(WIN_SOUND, 0.72);
  const enter = useEnterAnimation(1, 16);
  const headline =
    session.winner === 'tie'
      ? 'It’s a tie'
      : session.winner
        ? `${teamLabel(session.winner)} wins`
        : 'Game over';

  useEffect(() => playWin(), [playWin]);

  return (
    <SessionShell
      eyebrow="Mesob empty"
      stage="result"
      stages={STAGES}
      accent={ACCENT}
      footer={
        <>
          <PrimaryButton label="Play again (new slips)" icon="refresh" onPress={() => rematch()} />
          <View style={styles.row}>
            <View style={styles.half}>
              <SecondaryButton
                label="Change setup"
                onPress={() => {
                  clearSession();
                  router.replace('/game/mesob/setup/review');
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
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.stack}>
        <Animated.View style={[styles.finalHead, enter]}>
          <MoonFace expression={session.winner === 'tie' ? 'ready' : 'delighted'} size={96} />
          <Text style={[type.displayLg, styles.title]}>{headline}</Text>
        </Animated.View>
        <TeamScoreStrip scores={session.scores} activeTeam={null} accent={ACCENT} />
        <Surface contentStyle={styles.card}>
          <Text style={[type.eyebrow, styles.secondary]}>What was in the mesob</Text>
          <Text style={[type.body, styles.secondary]}>
            {session.slips.map((slip) => slip.text).join(' · ')}
          </Text>
        </Surface>
      </ScrollView>
    </SessionShell>
  );
}

export function MesobSessionView({ session }: { session: MesobSession }) {
  switch (session.phase) {
    case 'entry_handoff':
      return <EntryHandoff session={session} />;
    case 'entry':
      return <EntryPhase key={session.entryIndex} session={session} />;
    case 'round_intro':
      return <RoundIntroPhase session={session} />;
    case 'turn_ready':
      return <TurnReadyPhase session={session} />;
    case 'playing':
    case 'paused':
      return <PlayingPhase session={session} />;
    case 'turn_summary':
      return <TurnSummaryPhase session={session} />;
    case 'final':
      return <FinalPhase session={session} />;
    default:
      return null;
  }
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  stack: {
    gap: space[4],
    paddingBottom: space[4],
  },
  card: {
    padding: space[5],
    gap: space[3],
  },
  secondary: {
    color: color.textSecondary,
  },
  title: {
    color: color.textPrimary,
    textAlign: 'center',
  },
  entryList: {
    gap: space[3],
    paddingBottom: space[6],
  },
  entryItem: {
    gap: space[1],
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    borderRadius: radius.medium,
    borderWidth: 1,
    borderColor: color.borderSubtle,
    backgroundColor: overlay.glass,
    paddingHorizontal: space[3],
    minHeight: 60,
  },
  inputIndex: {
    color: color.textMuted,
    width: 28,
    textAlign: 'center',
  },
  input: {
    flex: 1,
    color: color.textPrimary,
    paddingVertical: space[3],
  },
  problem: {
    color: color.dangerUrgency,
    paddingHorizontal: space[2],
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  timerDigits: {
    color: color.textPrimary,
    fontFamily: family.mono.bold,
    fontSize: 48,
    lineHeight: 54,
  },
  track: {
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: alpha(color.textPrimary, 0.08),
    overflow: 'hidden',
    marginTop: space[2],
    marginBottom: space[4],
  },
  fill: {
    height: '100%',
    borderRadius: radius.pill,
  },
  slipArea: {
    flex: 1,
    justifyContent: 'center',
  },
  slipCard: {
    minHeight: 220,
    padding: space[6],
    gap: space[3],
    alignItems: 'center',
    justifyContent: 'center',
  },
  slipText: {
    color: color.textPrimary,
    fontFamily: family.display.black,
    fontSize: 44,
    lineHeight: 50,
    letterSpacing: -1.2,
    textAlign: 'center',
  },
  correctButton: {
    minHeight: 64,
    borderRadius: radius.medium,
    backgroundColor: color.success,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space[2],
    ...glow(color.success, 0.3, 16),
  },
  correctLabel: {
    color: color.void,
  },
  dim: {
    opacity: 0.4,
  },
  row: {
    flexDirection: 'row',
    gap: space[3],
  },
  half: {
    flex: 1,
  },
  guessList: {
    gap: space[2],
    paddingTop: space[4],
    paddingBottom: space[4],
  },
  guessRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    padding: space[4],
    borderRadius: radius.medium,
    borderWidth: 1,
    borderColor: alpha(color.success, 0.35),
    backgroundColor: alpha(color.success, 0.08),
  },
  guessText: {
    color: color.textPrimary,
    flex: 1,
  },
  finalHead: {
    alignItems: 'center',
    gap: space[3],
    paddingTop: space[2],
  },
});
