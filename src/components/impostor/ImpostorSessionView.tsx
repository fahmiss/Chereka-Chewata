import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Animated, AppState, Easing, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { getCategoryName } from '../../content/categories';
import { localizeText } from '../../content/localize';
import {
  currentRevealPlayerId,
  currentVoterId,
  getPlayerName,
  getRole,
  isImpostor,
  voteSuspectOptions,
  voteSummary,
} from '../../domain/impostor/machine';
import { useSession } from '../../domain/impostor/SessionContext';
import type { ImpostorSession } from '../../domain/impostor/types';
import { hapticImpact, hapticSuccess } from '../../theme/haptics';
import {
  duration,
  easeOut,
  useEnterAnimation,
  useReducedMotion,
} from '../../theme/motion';
import { alpha, color, glow, overlay, radius, space } from '../../theme/tokens';
import { family, type } from '../../theme/typography';
import { MoonFace } from '../brand/MoonFace';
import { ReportCardButton } from '../session/ReportCardButton';
import { SessionShell } from '../session/SessionShell';
import { AnimatedSvgCircle } from '../ui/AnimatedSvgCircle';
import { MetaChip } from '../ui/Chip';
import { Dialog } from '../ui/Dialog';
import { Icon, type IconName } from '../ui/Icon';
import { PressableScale } from '../ui/PressableScale';
import { PrimaryButton } from '../ui/PrimaryButton';
import { SecondaryButton } from '../ui/SecondaryButton';
import { Surface } from '../ui/Surface';

const ACCENT = color.gameImpostor;

/** Every phase hands this to SessionShell, which confirms before calling it. */
function endGame(clearSession: () => void) {
  // Navigate first — clearing session while still on `/session/[id]` flashes
  // the "unavailable" error screen before replace runs.
  router.replace('/home');
  clearSession();
}

/* ------------------------------------------------------------------ *
 * Shared pieces
 * ------------------------------------------------------------------ */

/** Centred instruction block with an icon — the recurring "table" screen. */
function Brief({
  icon,
  children,
  accent = ACCENT,
}: {
  icon: IconName;
  children: ReactNode;
  accent?: string;
}) {
  const enter = useEnterAnimation(1, 16);

  return (
    <Animated.View style={[styles.brief, enter]}>
      <View
        style={[
          styles.briefIcon,
          { backgroundColor: alpha(accent, 0.14), borderColor: alpha(accent, 0.3) },
        ]}
      >
        <Icon name={icon} size={26} color={accent} strokeWidth={1.8} />
      </View>
      {children}
    </Animated.View>
  );
}

function PlayerChoice({
  name,
  selected,
  onPress,
  index,
}: {
  name: string;
  selected: boolean;
  onPress: () => void;
  index: number;
}) {
  const enter = useEnterAnimation(index);
  const initial = name.trim().charAt(0).toUpperCase() || '?';

  return (
    <Animated.View style={enter}>
      <PressableScale
        accessibilityRole="radio"
        accessibilityState={{ selected }}
        accessibilityLabel={name}
        onPress={onPress}
        haptic="selection"
        scaleTo={0.98}
        style={[
          styles.choice,
          {
            borderColor: selected ? alpha(ACCENT, 0.6) : color.borderSubtle,
            backgroundColor: selected ? alpha(ACCENT, 0.12) : overlay.glass,
          },
          selected ? glow(ACCENT, 0.25, 14) : null,
        ]}
      >
        <View
          style={[
            styles.avatar,
            {
              backgroundColor: alpha(ACCENT, selected ? 0.24 : 0.12),
              borderColor: alpha(ACCENT, selected ? 0.5 : 0.2),
            },
          ]}
        >
          <Text style={[type.titleMd, { color: selected ? ACCENT : color.textSecondary }]}>
            {initial}
          </Text>
        </View>
        <Text style={[type.titleMd, styles.choiceName]} numberOfLines={1}>
          {name}
        </Text>
        <View
          style={[
            styles.radio,
            selected
              ? { backgroundColor: ACCENT, borderColor: ACCENT }
              : { borderColor: alpha(color.textPrimary, 0.26) },
          ]}
        >
          {selected ? <Icon name="check" size={14} color={color.void} strokeWidth={3} /> : null}
        </View>
      </PressableScale>
    </Animated.View>
  );
}

/* ------------------------------------------------------------------ *
 * Discussion timer — ring + digits
 * ------------------------------------------------------------------ */

const RING = 168;
const STROKE = 8;
const RADIUS = (RING - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function DiscussionTimer({
  seconds,
  onSkip,
  skipLabel,
}: {
  seconds: number;
  onSkip: () => void;
  skipLabel: string;
}) {
  const [left, setLeft] = useState(seconds);
  const progress = useRef(new Animated.Value(0)).current;
  const reduced = useReducedMotion();

  useEffect(() => {
    const id = setInterval(() => setLeft((value) => (value <= 0 ? 0 : value - 1)), 1000);
    return () => clearInterval(id);
  }, []);

  // One continuous sweep rather than a per-second jump.
  useEffect(() => {
    if (reduced) return;
    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: seconds * 1000,
      easing: Easing.linear,
      useNativeDriver: false,
    });
    animation.start();
    return () => animation.stop();
  }, [progress, seconds, reduced]);

  const mm = String(Math.floor(Math.max(left, 0) / 60)).padStart(2, '0');
  const ss = String(Math.max(left, 0) % 60).padStart(2, '0');
  const urgent = left <= 15;
  const tint = urgent ? color.dangerUrgency : color.brandPrimary;

  return (
    <View style={styles.timerBlock}>
      <View style={styles.ringWrap}>
        <Svg width={RING} height={RING}>
          <Circle
            cx={RING / 2}
            cy={RING / 2}
            r={RADIUS}
            stroke={alpha(color.textPrimary, 0.08)}
            strokeWidth={STROKE}
            fill="none"
          />
          <AnimatedSvgCircle
            cx={RING / 2}
            cy={RING / 2}
            r={RADIUS}
            stroke={tint}
            strokeWidth={STROKE}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={
              reduced
                ? CIRCUMFERENCE * (1 - Math.max(left, 0) / seconds)
                : progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, CIRCUMFERENCE],
                  })
            }
            // Start the sweep at 12 o'clock.
            transform={`rotate(-90 ${RING / 2} ${RING / 2})`}
          />
        </Svg>
        <View style={styles.ringCenter} pointerEvents="none">
          <MoonFace expression="timer" size={56} />
          <Text style={[styles.timerDigits, { color: tint }]}>
            {mm}:{ss}
          </Text>
          <Text style={[type.eyebrow, styles.timerCaption]}>
            {left <= 0 ? 'Time up' : 'Remaining'}
          </Text>
        </View>
      </View>
      <SecondaryButton
        label={left <= 0 ? skipLabel : 'End discussion early'}
        onPress={onSkip}
      />
    </View>
  );
}

/* ------------------------------------------------------------------ *
 * Phases
 * ------------------------------------------------------------------ */

function HandoffPhase({
  session,
  kind,
}: {
  session: ImpostorSession;
  kind: 'reveal' | 'vote';
}) {
  const { dispatch, clearSession } = useSession();
  const playerId =
    kind === 'reveal' ? currentRevealPlayerId(session) : currentVoterId(session);
  const name = playerId ? getPlayerName(session, playerId) : 'Player';
  const enter = useEnterAnimation(1, 20);
  const total = session.setup.players.length;
  const index =
    kind === 'reveal'
      ? session.revealIndex + 1
      : session.voteIndex + 1;
  return (
    <SessionShell
      eyebrow={kind === 'reveal' ? 'Pass the phone' : 'Private vote'}
      stage={kind === 'reveal' ? 'reveal' : 'vote'}
      onEndGame={() => endGame(clearSession)}
      footer={
        <PrimaryButton
          label="I'm ready"
          icon="checkCircle"
          onPress={() =>
            kind === 'reveal' ? dispatch.readyToReveal() : dispatch.beginVoteSelect()
          }
        />
      }
    >
      <Animated.View style={[styles.handoff, enter]}>
        <MoonFace expression="secret" size={72} glow={false} />
        <Text style={[type.numeric, styles.handoffCount]}>
          {String(index).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </Text>
        <Text style={[type.eyebrow, styles.handoffLabel]}>Hand the phone to</Text>
        <Text style={styles.handoffName} numberOfLines={2} adjustsFontSizeToFit>
          {name}
        </Text>
        <View style={styles.handoffNote}>
          <Icon name="eye" size={16} color={color.textMuted} />
          <Text style={[type.bodySm, styles.handoffNoteText]}>
            Face the screen away from the table. Nobody else should see.
          </Text>
        </View>
      </Animated.View>
    </SessionShell>
  );
}

const HOLD_RING = 168;
const HOLD_STROKE = 7;
const HOLD_RADIUS = (HOLD_RING - HOLD_STROKE) / 2;
const HOLD_CIRC = 2 * Math.PI * HOLD_RADIUS;

function RevealPhase({ session }: { session: ImpostorSession }) {
  const { dispatch, clearSession } = useSession();
  const [unlocked, setUnlocked] = useState(false);
  const playerId = currentRevealPlayerId(session);
  const name = playerId ? getPlayerName(session, playerId) : 'Player';
  const role = playerId ? getRole(session, playerId) : null;
  const categoryName = getCategoryName(session.word.category_id, session.contentLanguage);
  const secretWord = localizeText(session.contentLanguage, {
    en: session.word.word_en,
    am: session.word.word_am,
  });
  const secretHint = localizeText(session.contentLanguage, {
    en: session.word.hint_en,
    am: session.word.hint_am,
  });
  const secretFont =
    session.contentLanguage === 'en' ? undefined : { fontFamily: family.ethiopic.bold };
  const total = session.setup.players.length;

  const hold = useRef(new Animated.Value(0)).current;
  const holdAnim = useRef<Animated.CompositeAnimation | null>(null);
  const fade = useRef(new Animated.Value(0)).current;
  const revealScale = useRef(new Animated.Value(0.96)).current;
  const reduced = useReducedMotion();

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state !== 'active') {
        holdAnim.current?.stop();
        hold.setValue(0);
        setUnlocked(false);
      }
    });
    return () => sub.remove();
  }, [hold]);

  useEffect(() => {
    holdAnim.current?.stop();
    hold.setValue(0);
    setUnlocked(false);
    fade.setValue(0);
    revealScale.setValue(0.96);
  }, [session.revealIndex, hold, fade, revealScale]);

  useEffect(() => {
    if (!unlocked) return;
    if (reduced) {
      fade.setValue(1);
      revealScale.setValue(1);
      return;
    }
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 200,
        easing: easeOut,
        useNativeDriver: true,
      }),
      Animated.timing(revealScale, {
        toValue: 1,
        duration: 220,
        easing: easeOut,
        useNativeDriver: true,
      }),
    ]).start();
  }, [unlocked, fade, revealScale, reduced]);

  const startHold = () => {
    if (unlocked) return;
    holdAnim.current?.stop();
    if (reduced) {
      hold.setValue(1);
      setUnlocked(true);
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
        setUnlocked(true);
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

  const impostor = role?.role === 'impostor';
  const cardAccent = unlocked
    ? impostor
      ? color.dangerUrgency
      : color.brandPrimary
    : ACCENT;

  return (
    <SessionShell
      eyebrow={`Private reveal · ${session.revealIndex + 1}/${total}`}
      stage="reveal"
      title={name}
      accent={cardAccent}
      onEndGame={() => endGame(clearSession)}
      footer={
        unlocked ? (
          <PrimaryButton
            label="Hide and continue"
            icon="checkCircle"
            onPress={() => dispatch.hideRevealAndContinue()}
          />
        ) : (
          <View style={styles.footerHintRow}>
            <Icon name="eye" size={15} color={color.textMuted} />
            <Text style={[type.bodySm, styles.footerHint]}>
              Hold until the ring fills — then read your secret.
            </Text>
          </View>
        )
      }
    >
      <PressableScale
        accessibilityRole="button"
        accessibilityLabel={
          unlocked ? 'Secret shown' : 'Hold to reveal your secret role'
        }
        haptic="none"
        scaleTo={0.99}
        onPressIn={startHold}
        onPressOut={cancelHold}
        style={[
          styles.secretCard,
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
          <View style={styles.secretInner}>
            <View style={styles.holdWrap}>
              <Svg width={HOLD_RING} height={HOLD_RING}>
                <Circle
                  cx={HOLD_RING / 2}
                  cy={HOLD_RING / 2}
                  r={HOLD_RADIUS}
                  stroke={alpha(ACCENT, 0.2)}
                  strokeWidth={HOLD_STROKE}
                  fill="none"
                />
                <AnimatedSvgCircle
                  cx={HOLD_RING / 2}
                  cy={HOLD_RING / 2}
                  r={HOLD_RADIUS}
                  stroke={ACCENT}
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
              <View style={styles.holdCoreCenter} pointerEvents="none">
                <MoonFace expression="secret" size={110} />
              </View>
            </View>
            <Text style={[type.eyebrow, styles.secretEyebrow]}>Hold to reveal</Text>
          </View>
        ) : (
          <Animated.View
            style={[
              styles.secretInner,
              {
                opacity: fade,
                transform: [{ scale: revealScale }],
              },
            ]}
          >
            <Icon
              name={impostor ? 'mask' : 'users'}
              size={30}
              color={cardAccent}
              strokeWidth={1.8}
            />
            <Text style={[type.eyebrow, { color: alpha(cardAccent, 0.9) }]}>
              {impostor ? 'You are the' : 'Secret word'}
            </Text>
            <Text
              style={[styles.secretWord, { color: color.textPrimary }, !impostor && secretFont]}
              numberOfLines={2}
              adjustsFontSizeToFit
            >
              {impostor ? 'IMPOSTOR' : secretWord}
            </Text>
            <Text style={[type.body, styles.secretHint, !impostor && secretFont]}>
              {impostor
                ? session.setup.showCategoryToImpostor
                  ? `Category: ${categoryName}`
                  : 'Blend in. Find the word.'
                : secretHint}
            </Text>
          </Animated.View>
        )}
      </PressableScale>
    </SessionShell>
  );
}

function CluesPhase({ session }: { session: ImpostorSession }) {
  const { dispatch, clearSession } = useSession();
  const firstId = session.clueOrder[0];
  const name = firstId ? getPlayerName(session, firstId) : 'Player';

  return (
    <SessionShell
      eyebrow="Clues"
      stage="clues"
      title={`${name} starts`}
      subtitle="One short clue each, in order. Leave the phone on the table."
      onEndGame={() => endGame(clearSession)}
      footer={
        <PrimaryButton
          label="Start discussion"
          icon="megaphone"
          onPress={() => dispatch.nextClueOrDiscuss()}
        />
      }
    >
      <Text style={[type.body, styles.clueRule]}>
        Don’t say the secret word, spell it, translate it, or rhyme with it.
      </Text>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.orderList}>
        {session.clueOrder.map((playerId, index) => (
          <View
            key={playerId}
            style={[styles.orderRow, index === 0 && styles.orderRowFirst]}
          >
            <Text style={[type.numeric, { color: index === 0 ? ACCENT : color.textMuted }]}>
              {String(index + 1).padStart(2, '0')}
            </Text>
            <Text style={[type.titleMd, styles.orderName]} numberOfLines={1}>
              {getPlayerName(session, playerId)}
            </Text>
            {index === 0 ? (
              <Icon name="chevronRight" size={18} color={ACCENT} strokeWidth={2.4} />
            ) : null}
          </View>
        ))}
      </ScrollView>
    </SessionShell>
  );
}

function DiscussionPhase({ session }: { session: ImpostorSession }) {
  const { dispatch, clearSession } = useSession();
  const timer = session.setup.discussionTimerSeconds;
  const privateVotes = session.setup.votingMode === 'private';
  const nextLabel = privateVotes ? 'Start private voting' : 'Choose accused';

  return (
    <SessionShell
      eyebrow="Discussion"
      stage="discuss"
      title="Talk it out"
      onEndGame={() => endGame(clearSession)}
      footer={
        timer ? null : (
          <PrimaryButton label={nextLabel} icon="target" onPress={() => dispatch.startVoting()} />
        )
      }
    >
      {timer ? (
        <View style={styles.discussion}>
          <Text style={[type.body, styles.discussionText]}>
            {privateVotes
              ? 'When you’re ready, each player votes privately on this phone.'
              : 'Argue in the room. When the group agrees, tap who you’re accusing.'}
          </Text>
          <DiscussionTimer
            seconds={timer}
            onSkip={() => dispatch.startVoting()}
            skipLabel={nextLabel}
          />
        </View>
      ) : (
        <Brief icon="megaphone">
          <Text style={[type.body, styles.briefText]}>
            {privateVotes
              ? 'When you’re ready, each player votes privately on this phone.'
              : 'Argue in the room. When the group agrees, tap who you’re accusing.'}
          </Text>
        </Brief>
      )}
    </SessionShell>
  );
}

function GroupAccusePhase({ session }: { session: ImpostorSession }) {
  const { dispatch, clearSession } = useSession();
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <SessionShell
      eyebrow="Group decision"
      stage="vote"
      title="Who is the group accusing?"
      subtitle="Tap the player your group chose."
      onEndGame={() => endGame(clearSession)}
      footer={
        <>
          <PrimaryButton
            label="Accuse this player"
            icon="target"
            disabled={!selected}
            onPress={() => {
              if (selected) dispatch.accusePlayer(selected);
            }}
          />
          <SecondaryButton
            label="Deadlock — Impostor wins"
            quiet
            onPress={() => dispatch.resolveGroupDeadlock()}
          />
        </>
      }
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.choiceList}>
        {session.setup.players.map((player, index) => (
          <PlayerChoice
            key={player.id}
            index={index}
            name={player.displayName}
            selected={selected === player.id}
            onPress={() => setSelected(player.id)}
          />
        ))}
      </ScrollView>
    </SessionShell>
  );
}

function VotingSelectPhase({ session }: { session: ImpostorSession }) {
  const { dispatch, clearSession } = useSession();
  const voterId = currentVoterId(session);
  const name = voterId ? getPlayerName(session, voterId) : 'Player';
  const options = voteSuspectOptions(session);
  const [selected, setSelected] = useState<string | null>(null);
  const voteIndexRef = useRef(session.voteIndex);

  useEffect(() => {
    if (voteIndexRef.current !== session.voteIndex) {
      voteIndexRef.current = session.voteIndex;
      setSelected(null);
    }
  }, [session.voteIndex]);

  return (
    <SessionShell
      eyebrow={session.runoffRound > 0 ? 'Runoff vote' : 'Private vote'}
      stage="vote"
      title={`${name}, who is the Impostor?`}
      onEndGame={() => endGame(clearSession)}
      footer={
        <PrimaryButton
          label="Confirm vote"
          icon="checkCircle"
          disabled={!selected}
          onPress={() => {
            if (selected) dispatch.castVote(selected);
          }}
        />
      }
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.choiceList}>
        {options.map((player, index) => (
          <PlayerChoice
            key={player.id}
            index={index}
            name={player.displayName}
            selected={selected === player.id}
            onPress={() => setSelected(player.id)}
          />
        ))}
      </ScrollView>
    </SessionShell>
  );
}

function AccusationPhase({ session }: { session: ImpostorSession }) {
  const { dispatch, clearSession } = useSession();
  const name = session.accusedPlayerId
    ? getPlayerName(session, session.accusedPlayerId)
    : 'Someone';
  const caught = session.accusedIsImpostor;
  const accent = caught ? color.success : color.dangerUrgency;
  const enter = useEnterAnimation(1, 20);

  return (
    <SessionShell
      eyebrow="Reveal"
      stage="vote"
      accent={accent}
      title={name}
      onEndGame={() => endGame(clearSession)}
      footer={
        <PrimaryButton
          label={caught ? 'Final guess' : 'See result'}
          icon={caught ? 'target' : 'trophy'}
          onPress={() => dispatch.continueAfterAccusation()}
        />
      }
    >
      <Animated.View style={[styles.verdict, enter]}>
        <MoonFace expression={caught ? 'caught' : 'secret'} size={88} />
        <Text style={[styles.verdictText, { color: accent }]} adjustsFontSizeToFit numberOfLines={2}>
          {caught ? 'IMPOSTOR' : 'NOT THE IMPOSTOR'}
        </Text>
        <Text style={[type.body, styles.verdictBody]}>
          {caught
            ? 'Caught — one chance to guess the secret word out loud.'
            : 'The group accused an innocent player. The Impostor wins.'}
        </Text>
      </Animated.View>
    </SessionShell>
  );
}

function FinalGuessPhase({ session }: { session: ImpostorSession }) {
  const { dispatch, clearSession } = useSession();
  const name = session.accusedPlayerId
    ? getPlayerName(session, session.accusedPlayerId)
    : 'Impostor';
  const categoryName = getCategoryName(session.word.category_id, session.contentLanguage);

  return (
    <SessionShell
      eyebrow="Final guess"
      stage="vote"
      title={`${name} guesses`}
      onEndGame={() => endGame(clearSession)}
      footer={
        <>
          <PrimaryButton
            label="Correct"
            icon="checkCircle"
            onPress={() => dispatch.resolveFinalGuess(true)}
          />
          <SecondaryButton
            label="Incorrect"
            icon="close"
            onPress={() => dispatch.resolveFinalGuess(false)}
          />
        </>
      }
    >
      <Brief icon="megaphone">
        <Text style={[type.body, styles.briefText]}>
          Say the word. The group decides.
        </Text>
        {session.setup.showCategoryToImpostor ? (
          <MetaChip icon="layers" label={`Category: ${categoryName}`} />
        ) : null}
      </Brief>
    </SessionShell>
  );
}

function ResultPhase({ session }: { session: ImpostorSession }) {
  const { dispatch, clearSession } = useSession();
  const crewWon = session.winner === 'crew';
  const accent = crewWon ? color.success : color.gameImpostor;
  const impostorNames = session.setup.players
    .filter((player) => isImpostor(session, player.id))
    .map((player) => player.displayName)
    .join(', ');
  const summary = voteSummary(session);
  const topVotes = summary.reduce((max, row) => Math.max(max, row.count), 0);
  const enter = useEnterAnimation(1, 20);
  const [deckExhausted, setDeckExhausted] = useState(false);

  return (
    <SessionShell
      eyebrow="Result"
      stage="result"
      accent={accent}
      onEndGame={undefined}
      footer={
        <>
          <PrimaryButton
            label="Play again"
            icon="refresh"
            onPress={() => {
              const next = dispatch.rematch();
              if (!next) setDeckExhausted(true);
            }}
          />
          <View style={styles.resultActions}>
            <SecondaryButton
              label="Change setup"
              onPress={() => {
                clearSession();
                router.replace('/game/impostor/setup/review');
              }}
              style={styles.half}
            />
            <SecondaryButton
              label="Another game"
              onPress={() => {
                clearSession();
                router.replace('/home');
              }}
              style={styles.half}
            />
          </View>
        </>
      }
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.resultScroll}>
        <Animated.View style={[styles.winnerBlock, enter]}>
          <MoonFace expression={crewWon ? 'delighted' : 'secret'} size={96} />
          <Text style={[type.displayLg, { color: color.textPrimary }]}>
            {crewWon ? 'Crew wins' : 'Impostor wins'}
          </Text>
          <Text style={[type.body, styles.winnerSub]}>
            Impostor: <Text style={{ color: accent }}>{impostorNames}</Text>
          </Text>
        </Animated.View>

        <Surface accent={color.brandPrimary} active contentStyle={styles.wordCard}>
          <Text style={[type.eyebrow, { color: color.brandPrimary }]}>Secret word</Text>
          <Text
            style={[
              styles.resultWord,
              session.contentLanguage !== 'en' ? { fontFamily: family.ethiopic.bold } : null,
            ]}
            numberOfLines={2}
            adjustsFontSizeToFit
          >
            {localizeText(session.contentLanguage, {
              en: session.word.word_en,
              am: session.word.word_am,
            })}
          </Text>
        </Surface>
        <ReportCardButton game="impostor" cardId={session.word.id} />

        {summary.length > 0 ? (
          <Surface contentStyle={styles.votesCard}>
            <Text style={[type.eyebrow, styles.votesLabel]}>Votes</Text>
            {summary.map((row) => (
              <View key={row.name} style={styles.voteRow}>
                <Text style={[type.label, styles.voteName]} numberOfLines={1}>
                  {row.name}
                </Text>
                <View style={styles.voteTrack}>
                  <View
                    style={[
                      styles.voteFill,
                      {
                        width: `${topVotes ? (row.count / topVotes) * 100 : 0}%`,
                        backgroundColor:
                          row.count === topVotes ? accent : alpha(color.textPrimary, 0.2),
                      },
                    ]}
                  />
                </View>
                <Text style={[type.numeric, styles.voteCount]}>{row.count}</Text>
              </View>
            ))}
          </Surface>
        ) : null}
      </ScrollView>

      <Dialog
        visible={deckExhausted}
        moon="caught"
        accent={color.brandPrimary}
        title="Deck exhausted"
        message="Every card in this deck has been used. Change categories or content level to keep playing."
        confirmLabel="Got it"
        confirmTone="honey"
        onConfirm={() => setDeckExhausted(false)}
      />
    </SessionShell>
  );
}

export function ImpostorSessionView({ session }: { session: ImpostorSession }) {
  switch (session.phase) {
    case 'handoff':
      return <HandoffPhase session={session} kind="reveal" />;
    case 'reveal':
      return <RevealPhase session={session} />;
    case 'starting_player':
    case 'clues':
      return <CluesPhase session={session} />;
    case 'discussion':
      return <DiscussionPhase session={session} />;
    case 'group_accuse':
      return <GroupAccusePhase session={session} />;
    case 'voting_handoff':
      return <HandoffPhase session={session} kind="vote" />;
    case 'voting_select':
      return <VotingSelectPhase session={session} />;
    case 'accusation':
      return <AccusationPhase session={session} />;
    case 'final_guess':
      return <FinalGuessPhase session={session} />;
    case 'result':
      return <ResultPhase session={session} />;
    default:
      return null;
  }
}

const styles = StyleSheet.create({
  /* handoff */
  handoff: {
    flex: 1,
    justifyContent: 'center',
    gap: space[3],
  },
  handoffCount: {
    color: ACCENT,
    marginBottom: space[2],
  },
  handoffLabel: {
    color: color.textMuted,
  },
  handoffIdentity: {
    gap: space[4],
  },
  handoffAvatar: {
    width: 64,
    height: 64,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: alpha(ACCENT, 0.4),
    backgroundColor: alpha(ACCENT, 0.14),
    alignItems: 'center',
    justifyContent: 'center',
  },
  handoffName: {
    color: color.textPrimary,
    fontFamily: family.display.black,
    fontSize: 56,
    lineHeight: 58,
    letterSpacing: -2.4,
  },
  handoffNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
    marginTop: space[3],
  },
  handoffNoteText: {
    color: color.textMuted,
    flex: 1,
  },

  /* shared brief */
  brief: {
    flex: 1,
    justifyContent: 'center',
    gap: space[4],
  },
  briefIcon: {
    width: 56,
    height: 56,
    borderRadius: radius.medium,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  briefText: {
    color: color.textSecondary,
    fontSize: 18,
    lineHeight: 27,
  },
  clueRule: {
    color: color.textSecondary,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: space[2],
  },

  /* reveal */
  secretCard: {
    flex: 1,
    minHeight: 360,
    borderRadius: radius.extraLarge,
    borderWidth: 1,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    padding: space[6],
    marginBottom: space[2],
  },
  secretInner: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: space[5],
    flex: 1,
    width: '100%',
  },
  holdWrap: {
    width: HOLD_RING,
    height: HOLD_RING,
    alignItems: 'center',
    justifyContent: 'center',
  },
  holdCoreCenter: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secretEyebrow: {
    color: color.textMuted,
    marginTop: space[2],
    fontSize: 13,
    letterSpacing: 2,
  },
  secretWord: {
    fontFamily: family.display.black,
    fontSize: 46,
    lineHeight: 50,
    letterSpacing: -1.8,
    textAlign: 'center',
  },
  secretHint: {
    color: color.textSecondary,
    textAlign: 'center',
  },
  footerHintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space[2],
    paddingVertical: space[4],
  },
  footerHint: {
    color: color.textMuted,
  },

  orderList: {
    gap: space[2],
    paddingTop: space[4],
    paddingBottom: space[4],
  },
  orderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[4],
    minHeight: 56,
    paddingHorizontal: space[4],
    borderRadius: radius.medium,
    borderWidth: 1,
    borderColor: color.borderSubtle,
    backgroundColor: overlay.glass,
  },
  orderRowFirst: {
    borderColor: alpha(ACCENT, 0.5),
    backgroundColor: alpha(ACCENT, 0.1),
  },
  orderName: {
    color: color.textPrimary,
    flex: 1,
  },

  /* discussion */
  discussion: {
    flex: 1,
    gap: space[5],
  },
  discussionText: {
    color: color.textSecondary,
    fontSize: 17,
    lineHeight: 26,
  },
  timerBlock: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space[6],
  },
  ringWrap: {
    width: RING,
    height: RING,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringCenter: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  timerDigits: {
    fontFamily: family.mono.bold,
    fontSize: 32,
    letterSpacing: -1,
  },
  timerCaption: {
    color: color.textMuted,
  },

  /* choices */
  choiceList: {
    gap: space[2],
    paddingBottom: space[4],
  },
  choice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    minHeight: 64,
    paddingHorizontal: space[3],
    borderRadius: radius.medium,
    borderWidth: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  choiceName: {
    flex: 1,
    color: color.textPrimary,
  },
  radio: {
    width: 26,
    height: 26,
    borderRadius: radius.pill,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* verdict + result */
  verdict: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: space[4],
  },
  verdictText: {
    fontFamily: family.display.black,
    fontSize: 40,
    lineHeight: 44,
    letterSpacing: -1.6,
    textAlign: 'center',
  },
  verdictBody: {
    color: color.textSecondary,
    textAlign: 'center',
  },
  resultScroll: {
    gap: space[4],
    paddingBottom: space[4],
  },
  winnerBlock: {
    alignItems: 'center',
    gap: space[3],
  },
  winnerSub: {
    color: color.textSecondary,
    textAlign: 'center',
  },
  wordCard: {
    padding: space[5],
    gap: space[2],
  },
  resultWord: {
    color: color.textPrimary,
    fontFamily: family.display.black,
    fontSize: 36,
    lineHeight: 40,
    letterSpacing: -1.4,
  },
  votesCard: {
    padding: space[5],
    gap: space[3],
  },
  votesLabel: {
    color: color.textMuted,
  },
  voteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
  },
  voteName: {
    color: color.textPrimary,
    width: 86,
  },
  voteTrack: {
    flex: 1,
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: alpha(color.textPrimary, 0.08),
    overflow: 'hidden',
  },
  voteFill: {
    height: '100%',
    borderRadius: radius.pill,
  },
  voteCount: {
    color: color.textSecondary,
    width: 20,
    textAlign: 'right',
  },
  resultActions: {
    flexDirection: 'row',
    gap: space[3],
  },
  half: {
    flex: 1,
  },
});
