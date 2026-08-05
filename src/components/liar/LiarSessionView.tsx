import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Animated, AppState, Easing, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import {
  currentAnswerPlayerId,
  currentRevealPlayerId,
  currentVoterId,
  getPlayerName,
  questionForPlayer,
  voteSuspectOptions,
  voteSummary,
} from '../../domain/liar/machine';
import { useLiarSession } from '../../domain/liar/SessionContext';
import type { LiarSession } from '../../domain/liar/types';
import { useSecretScreenProtection } from '../../privacy/useSecretScreenProtection';
import { hapticImpact, hapticSuccess } from '../../theme/haptics';
import {
  duration,
  easeOut,
  useEnterAnimation,
  useReducedMotion,
} from '../../theme/motion';
import { alpha, color, glow, overlay, radius, space } from '../../theme/tokens';
import { family, type } from '../../theme/typography';
import { SessionShell } from '../session/SessionShell';
import { Dialog } from '../ui/Dialog';
import { Icon, type IconName } from '../ui/Icon';
import { PressableScale } from '../ui/PressableScale';
import { PrimaryButton } from '../ui/PrimaryButton';
import { SecondaryButton } from '../ui/SecondaryButton';
import { Surface } from '../ui/Surface';

const ACCENT = color.gameLiar;
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

function endGame(clearSession: () => void) {
  clearSession();
  router.replace('/home');
}

function Brief({ icon, children }: { icon: IconName; children: ReactNode }) {
  const enter = useEnterAnimation(1, 16);
  return (
    <Animated.View style={[styles.brief, enter]}>
      <View
        style={[
          styles.briefIcon,
          { backgroundColor: alpha(ACCENT, 0.14), borderColor: alpha(ACCENT, 0.3) },
        ]}
      >
        <Icon name={icon} size={26} color={ACCENT} strokeWidth={1.8} />
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

function HandoffPhase({
  session,
  kind,
}: {
  session: LiarSession;
  kind: 'reveal' | 'vote';
}) {
  const { dispatch, clearSession } = useLiarSession();
  const playerId =
    kind === 'reveal' ? currentRevealPlayerId(session) : currentVoterId(session);
  const name = playerId ? getPlayerName(session, playerId) : 'Player';
  const enter = useEnterAnimation(1, 20);
  const total =
    kind === 'reveal' ? session.setup.players.length : session.voteOrder.length;
  const index = (kind === 'reveal' ? session.revealIndex : session.voteIndex) + 1;
  const initial = name.trim().charAt(0).toUpperCase() || '?';

  return (
    <SessionShell
      eyebrow={kind === 'reveal' ? 'Pass the phone' : 'Private vote'}
      stage={kind === 'reveal' ? 'reveal' : 'vote'}
      accent={ACCENT}
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
        <Text style={[type.numeric, styles.handoffCount]}>
          {String(index).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </Text>
        <Text style={[type.eyebrow, styles.handoffLabel]}>Hand the phone to</Text>
        <View style={styles.handoffIdentity}>
          <View style={styles.handoffAvatar}>
            <Text style={[type.displayMd, { color: ACCENT }]}>{initial}</Text>
          </View>
          <Text style={styles.handoffName} numberOfLines={2} adjustsFontSizeToFit>
            {name}
          </Text>
        </View>
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

const HOLD_RING = 88;
const HOLD_STROKE = 5;
const HOLD_RADIUS = (HOLD_RING - HOLD_STROKE) / 2;
const HOLD_CIRC = 2 * Math.PI * HOLD_RADIUS;

function RevealPhase({ session }: { session: LiarSession }) {
  useSecretScreenProtection('liar-reveal');
  const { dispatch, clearSession } = useLiarSession();
  const [unlocked, setUnlocked] = useState(false);
  const playerId = currentRevealPlayerId(session);
  const name = playerId ? getPlayerName(session, playerId) : 'Player';
  const question = playerId ? questionForPlayer(session, playerId) : '';
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

  const cardAccent = unlocked ? color.brandPrimary : ACCENT;

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
              Hold until the ring fills — then read your question.
            </Text>
          </View>
        )
      }
    >
      <PressableScale
        accessibilityRole="button"
        accessibilityLabel={unlocked ? 'Question shown' : 'Hold to reveal your question'}
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
                <AnimatedCircle
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
                <View style={[styles.holdCore, { borderColor: alpha(ACCENT, 0.5) }]}>
                  <Icon name="lock" size={26} color={ACCENT} strokeWidth={1.8} />
                </View>
              </View>
            </View>
            <Text style={[type.eyebrow, styles.secretEyebrow]}>Hold to reveal</Text>
          </View>
        ) : (
          <Animated.View
            style={[
              styles.secretInner,
              { opacity: fade, transform: [{ scale: revealScale }] },
            ]}
          >
            <Icon name="eye" size={30} color={cardAccent} strokeWidth={1.8} />
            <Text style={[type.eyebrow, { color: alpha(cardAccent, 0.9) }]}>Your question</Text>
            <Text style={styles.secretQuestion} numberOfLines={5} adjustsFontSizeToFit>
              {question}
            </Text>
            <Text style={[type.body, styles.secretHint]}>
              Answer aloud later. Do not read the question out loud.
            </Text>
          </Animated.View>
        )}
      </PressableScale>
    </SessionShell>
  );
}

function OrderRow({
  index,
  name,
  first,
}: {
  index: number;
  name: string;
  first: boolean;
}) {
  const enter = useEnterAnimation(index);
  return (
    <Animated.View
      style={[
        styles.orderRow,
        enter,
        first && {
          borderColor: alpha(ACCENT, 0.5),
          backgroundColor: alpha(ACCENT, 0.1),
        },
      ]}
    >
      <Text style={[type.numeric, { color: first ? ACCENT : color.textMuted }]}>
        {String(index + 1).padStart(2, '0')}
      </Text>
      <Text style={[type.titleMd, styles.orderName]} numberOfLines={1}>
        {name}
      </Text>
      {first ? <Icon name="chevronRight" size={18} color={ACCENT} strokeWidth={2.4} /> : null}
    </Animated.View>
  );
}

function AnswerOrderPhase({ session }: { session: LiarSession }) {
  const { dispatch, clearSession } = useLiarSession();
  const firstId = session.answerOrder[0];
  const name = firstId ? getPlayerName(session, firstId) : 'Player';

  return (
    <SessionShell
      eyebrow="Answer order"
      stage="clues"
      title={`${name} answers first`}
      subtitle="Everyone can look at the screen again."
      accent={ACCENT}
      onEndGame={() => endGame(clearSession)}
      footer={
        <PrimaryButton
          label="Begin answers"
          icon="megaphone"
          onPress={() => dispatch.beginAnswers()}
        />
      }
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.orderList}>
        {session.answerOrder.map((playerId, index) => (
          <OrderRow
            key={playerId}
            index={index}
            name={getPlayerName(session, playerId)}
            first={index === 0}
          />
        ))}
      </ScrollView>
    </SessionShell>
  );
}

function AnswersPhase({ session }: { session: LiarSession }) {
  const { dispatch, clearSession } = useLiarSession();
  const playerId = currentAnswerPlayerId(session);
  const name = playerId ? getPlayerName(session, playerId) : 'Player';
  const index = session.answerIndex + 1;
  const total = session.answerOrder.length;
  const last = index >= total;

  return (
    <SessionShell
      eyebrow={`Answers · ${index}/${total}`}
      stage="clues"
      title={`${name}'s turn`}
      subtitle="One concise answer. Do not paraphrase the question."
      accent={ACCENT}
      onEndGame={() => endGame(clearSession)}
      footer={
        <PrimaryButton
          label={last ? 'Everyone answered' : 'Next player'}
          icon="chevronRight"
          onPress={() => dispatch.nextAnswerOrDiscuss()}
        />
      }
    >
      <Brief icon="megaphone">
        <Text style={[type.displayMd, styles.briefTitle]}>{name}</Text>
        <Text style={[type.body, styles.briefBody]}>
          Answer aloud. Keep it short.
        </Text>
      </Brief>
    </SessionShell>
  );
}

function DiscussionPhase({ session }: { session: LiarSession }) {
  const { dispatch, clearSession } = useLiarSession();

  return (
    <SessionShell
      eyebrow="Discussion"
      stage="discuss"
      title="Who heard a different question?"
      subtitle="Brief follow-ups are fine. Never ask what the exact question was."
      accent={ACCENT}
      onEndGame={() => endGame(clearSession)}
      footer={
        <PrimaryButton
          label="Start private voting"
          icon="target"
          onPress={() => dispatch.startVoting()}
        />
      }
    >
      <Brief icon="users">
        <Text style={[type.body, styles.briefBody]}>
          Talk it out, then vote privately.
        </Text>
      </Brief>
    </SessionShell>
  );
}

function VotingSelectPhase({ session }: { session: LiarSession }) {
  useSecretScreenProtection('liar-vote');
  const { dispatch, clearSession } = useLiarSession();
  const [selected, setSelected] = useState<string | null>(null);
  const voterId = currentVoterId(session);
  const name = voterId ? getPlayerName(session, voterId) : 'Player';
  const options = voteSuspectOptions(session);
  const runoff = session.runoffRound > 0;

  useEffect(() => {
    setSelected(null);
  }, [session.voteIndex, session.runoffRound]);

  return (
    <SessionShell
      eyebrow={runoff ? 'Runoff vote' : 'Your vote'}
      stage="vote"
      title={name}
      subtitle="Tap who you think got a different question."
      accent={ACCENT}
      onEndGame={() => endGame(clearSession)}
      footer={
        <PrimaryButton
          label="Lock vote"
          icon="lock"
          disabled={!selected}
          onPress={() => {
            if (!selected) return;
            dispatch.castVote(selected);
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

function ResultPhase({ session }: { session: LiarSession }) {
  const { dispatch, clearSession } = useLiarSession();
  const groupWon = session.winner === 'group';
  const accent = groupWon ? color.success : ACCENT;
  const liarName = getPlayerName(session, session.liarPlayerId);
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
                router.replace('/game/whos_the_liar/setup/players');
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
          <View
            style={[
              styles.verdictBadge,
              { backgroundColor: alpha(accent, 0.14), borderColor: alpha(accent, 0.4) },
              glow(accent, 0.35, 24),
            ]}
          >
            <Icon name={groupWon ? 'trophy' : 'eye'} size={34} color={accent} strokeWidth={1.8} />
          </View>
          <Text style={[type.displayLg, { color: color.textPrimary }]}>
            {groupWon ? 'Group wins' : 'Liar wins'}
          </Text>
          <Text style={[type.body, styles.winnerSub]}>
            Liar: <Text style={{ color: accent }}>{liarName}</Text>
          </Text>
        </Animated.View>

        <Surface accent={color.brandPrimary} active contentStyle={styles.questionCard}>
          <Text style={[type.eyebrow, { color: color.brandPrimary }]}>Common question</Text>
          <Text style={[type.titleMd, styles.questionText]}>{session.pair.main_question_en}</Text>
        </Surface>

        <Surface accent={ACCENT} active contentStyle={styles.questionCard}>
          <Text style={[type.eyebrow, { color: ACCENT }]}>Liar’s question</Text>
          <Text style={[type.titleMd, styles.questionText]}>{session.pair.liar_question_en}</Text>
        </Surface>

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
        icon="layers"
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

export function LiarSessionView({ session }: { session: LiarSession }) {
  switch (session.phase) {
    case 'handoff':
      return <HandoffPhase session={session} kind="reveal" />;
    case 'reveal':
      return <RevealPhase session={session} />;
    case 'answer_order':
      return <AnswerOrderPhase session={session} />;
    case 'answers':
      return <AnswersPhase session={session} />;
    case 'discussion':
      return <DiscussionPhase session={session} />;
    case 'voting_handoff':
      return <HandoffPhase session={session} kind="vote" />;
    case 'voting_select':
      return <VotingSelectPhase session={session} />;
    case 'result':
      return <ResultPhase session={session} />;
    default:
      return null;
  }
}

const styles = StyleSheet.create({
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
  briefTitle: {
    color: color.textPrimary,
  },
  briefBody: {
    color: color.textSecondary,
  },
  secretCard: {
    flex: 1,
    borderRadius: radius.large,
    borderWidth: 1,
    overflow: 'hidden',
    minHeight: 280,
  },
  secretInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: space[6],
    gap: space[3],
  },
  holdWrap: {
    width: HOLD_RING,
    height: HOLD_RING,
    alignItems: 'center',
    justifyContent: 'center',
  },
  holdCoreCenter: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  holdCore: {
    width: 52,
    height: 52,
    borderRadius: radius.pill,
    borderWidth: 1,
    backgroundColor: alpha(color.void, 0.55),
    alignItems: 'center',
    justifyContent: 'center',
  },
  secretEyebrow: {
    color: color.textMuted,
    marginTop: space[2],
  },
  secretQuestion: {
    color: color.textPrimary,
    fontFamily: family.display.bold,
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.8,
    textAlign: 'center',
  },
  secretHint: {
    color: color.textSecondary,
    textAlign: 'center',
  },
  footerHintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
    paddingVertical: space[2],
  },
  footerHint: {
    color: color.textMuted,
    flex: 1,
  },
  orderList: {
    gap: space[2],
    paddingBottom: space[4],
  },
  orderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    paddingVertical: space[3],
    paddingHorizontal: space[4],
    borderRadius: radius.medium,
    borderWidth: 1,
    borderColor: color.borderSubtle,
    backgroundColor: overlay.glass,
  },
  orderName: {
    color: color.textPrimary,
    flex: 1,
  },
  choiceList: {
    gap: space[2],
    paddingBottom: space[2],
  },
  choice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    padding: space[3],
    borderRadius: radius.medium,
    borderWidth: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  choiceName: {
    color: color.textPrimary,
    flex: 1,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: radius.pill,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultScroll: {
    gap: space[4],
    paddingBottom: space[4],
  },
  winnerBlock: {
    alignItems: 'center',
    gap: space[3],
    paddingTop: space[2],
  },
  verdictBadge: {
    width: 72,
    height: 72,
    borderRadius: radius.large,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  winnerSub: {
    color: color.textSecondary,
    textAlign: 'center',
  },
  questionCard: {
    padding: space[5],
    gap: space[2],
  },
  questionText: {
    color: color.textPrimary,
  },
  votesCard: {
    padding: space[4],
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
    width: 88,
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
    color: color.textMuted,
    width: 28,
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
