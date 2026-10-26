import { preload } from 'expo-audio';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Animated, ScrollView, StyleSheet, Text, View } from 'react-native';
import { getCategoryName } from '../../content/categories';
import { useInsiderSession } from '../../domain/insider/context';
import {
  accusePlayer,
  castVote,
  currentRevealPlayerId,
  currentVoterId,
  getInsiderPlayerName,
  hideRevealAndContinue,
  insiderVoteSummary,
  insiderWordText,
  quizTimedOut,
  readyToReveal,
  resolveGroupDeadlock,
  roleOf,
  startReveals,
  startVoting,
  suspects,
  voteSuspectOptions,
  wordFound,
} from '../../domain/insider/machine';
import type { InsiderSession } from '../../domain/insider/types';
import { useEnterAnimation } from '../../theme/motion';
import { alpha, color, radius, space } from '../../theme/tokens';
import { family, type } from '../../theme/typography';
import { useSoundEffect } from '../../theme/useSoundEffect';
import { MoonFace } from '../brand/MoonFace';
import { MetaChip } from '../ui/Chip';
import { HoldHint, HoldToReveal, useHoldReveal } from '../session/HoldToReveal';
import { PassPhoneHandoff } from '../session/PassPhoneHandoff';
import { PlayerPicker } from '../session/PlayerPicker';
import { SessionShell } from '../session/SessionShell';
import { useCountdown, useSessionKeepAwake } from '../session/useCountdown';
import { Dialog } from '../ui/Dialog';
import { Icon } from '../ui/Icon';
import { PrimaryButton } from '../ui/PrimaryButton';
import { SecondaryButton } from '../ui/SecondaryButton';
import { Surface } from '../ui/Surface';

const ACCENT = color.gameInsider;
const STAGES = ['roles', 'quiz', 'vote', 'result'] as const;
const TICK_SOUND = require('../../../assets/sounds/taboo-last-three.wav');
const TIME_UP_SOUND = require('../../../assets/sounds/taboo-time-up.wav');
const VERDICT_SOUND = require('../../../assets/sounds/verdict-sting.wav');
const WIN_SOUND = require('../../../assets/sounds/result-win.wav');
const LOSS_SOUND = require('../../../assets/sounds/result-loss.wav');

void preload(TICK_SOUND);
void preload(TIME_UP_SOUND);
void preload(VERDICT_SOUND);
void preload(WIN_SOUND);
void preload(LOSS_SOUND);

function endGame(clearSession: () => void) {
  router.replace('/home');
  clearSession();
}

function wordFont(session: InsiderSession) {
  return session.contentLanguage !== 'en' ? { fontFamily: family.ethiopic.bold } : null;
}

function formatClock(seconds: number): string {
  const safe = Math.max(0, seconds);
  return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, '0')}`;
}

function MasterIntroPhase({ session }: { session: InsiderSession }) {
  const { apply, clearSession } = useInsiderSession();
  const enter = useEnterAnimation(1, 16);
  const master = getInsiderPlayerName(session, session.masterId);
  return (
    <SessionShell
      eyebrow="The Master"
      stage="roles"
      stages={STAGES}
      title={`${master} is the Master`}
      subtitle="The Master knows the secret word and answers only Yes, No or I don't know. One other player secretly knows it too: the Insider."
      accent={ACCENT}
      onEndGame={() => endGame(clearSession)}
      footer={<PrimaryButton label="Deal secret roles" icon="eye" onPress={() => apply(startReveals)} />}
    >
      <Animated.View style={[styles.center, enter]}>
        <MoonFace expression="detective" size={110} />
        <Text style={[type.body, styles.secondaryCenter]}>
          Everyone, the Master included, now sees a private role card.
        </Text>
      </Animated.View>
    </SessionShell>
  );
}

function HandoffPhase({ session, kind }: { session: InsiderSession; kind: 'reveal' | 'vote' }) {
  const { apply, clearSession } = useInsiderSession();
  const playerId = kind === 'reveal' ? currentRevealPlayerId(session) : currentVoterId(session);
  return (
    <PassPhoneHandoff
      name={playerId ? getInsiderPlayerName(session, playerId) : 'Player'}
      index={(kind === 'reveal' ? session.revealIndex : session.voteIndex) + 1}
      total={kind === 'reveal' ? session.revealOrder.length : session.voteOrder.length}
      accent={ACCENT}
      eyebrow={kind === 'reveal' ? 'Secret role' : session.runoffRound > 0 ? 'Runoff vote' : 'Private vote'}
      stage={kind === 'reveal' ? 'roles' : 'vote'}
      stages={STAGES}
      onReady={() => apply(readyToReveal)}
      onEndGame={() => endGame(clearSession)}
    />
  );
}

function RevealPhase({ session }: { session: InsiderSession }) {
  const { apply, clearSession } = useInsiderSession();
  const { unlocked, unlock } = useHoldReveal(session.revealIndex);
  const playerId = currentRevealPlayerId(session) ?? '';
  const role = roleOf(session, playerId);
  const word = insiderWordText(session);

  return (
    <SessionShell
      eyebrow={`Private reveal · ${session.revealIndex + 1}/${session.revealOrder.length}`}
      stage="roles"
      stages={STAGES}
      title={getInsiderPlayerName(session, playerId)}
      accent={ACCENT}
      onEndGame={() => endGame(clearSession)}
      footer={
        unlocked ? (
          <PrimaryButton
            label="Hide and continue"
            icon="checkCircle"
            onPress={() => apply(hideRevealAndContinue)}
          />
        ) : (
          <HoldHint text="Hold until the ring fills, then read your role." />
        )
      }
    >
      <HoldToReveal
        accent={ACCENT}
        unlocked={unlocked}
        onUnlock={unlock}
        resetKey={session.revealIndex}
      >
        <Text style={[type.eyebrow, { color: color.brandPrimary }]}>
          {role === 'master' ? 'You are the Master' : role === 'insider' ? 'You are the Insider' : 'You are a Common'}
        </Text>
        {role === 'common' ? (
          <>
            <Icon name="question" size={34} color={color.brandPrimary} strokeWidth={1.8} />
            <Text style={[type.body, styles.secretBody]}>
              You don't know the word. Ask the Master yes/no questions to find it, then work
              out who already knew.
            </Text>
          </>
        ) : (
          <>
            <Text style={[styles.secretWord, wordFont(session)]} numberOfLines={2} adjustsFontSizeToFit>
              {word}
            </Text>
            <Text style={[type.body, styles.secretBody]}>
              {role === 'master'
                ? 'Hold the phone during the quiz. Answer only Yes, No or I don’t know.'
                : 'Quietly steer the questions toward the word. Do not get caught knowing it.'}
            </Text>
          </>
        )}
      </HoldToReveal>
    </SessionShell>
  );
}

function QuizPhase({ session }: { session: InsiderSession }) {
  const { apply, clearSession } = useInsiderSession();
  const master = getInsiderPlayerName(session, session.masterId);
  const playTick = useSoundEffect(TICK_SOUND, 0.58);
  const playTimeUp = useSoundEffect(TIME_UP_SOUND, 0.78);
  const [confirmGiveUp, setConfirmGiveUp] = useState(false);

  useSessionKeepAwake();

  const { leftSeconds, getLeftMs } = useCountdown({
    durationMs: session.setup.timerSeconds * 1000,
    running: true,
    resetKey: 0,
    onExpire: () => {
      playTimeUp();
      apply(quizTimedOut);
    },
  });

  useEffect(() => {
    if (leftSeconds > 0 && leftSeconds <= 3) playTick();
  }, [leftSeconds, playTick]);

  const urgent = leftSeconds <= 30;

  return (
    <SessionShell
      eyebrow="Quiz"
      stage="quiz"
      stages={STAGES}
      title="Find the word"
      subtitle={`Ask ${master} yes/no questions. ${master} holds the phone and taps when someone says the word.`}
      accent={urgent ? color.dangerUrgency : ACCENT}
      onEndGame={() => endGame(clearSession)}
      footer={
        <>
          <PrimaryButton
            label="Someone said the word"
            icon="checkCircle"
            onPress={() => apply((current) => wordFound(current, getLeftMs() / 1000))}
          />
          <SecondaryButton label="We give up" quiet onPress={() => setConfirmGiveUp(true)} />
        </>
      }
    >
      <View style={styles.center}>
        <Text style={[styles.clock, urgent && { color: color.dangerUrgency }]}>
          {formatClock(leftSeconds)}
        </Text>
        <MetaChip
          icon="layers"
          label={`Category: ${getCategoryName(session.word.category_id, session.contentLanguage)}`}
          tint={ACCENT}
        />
        <Text style={[type.bodySm, styles.secondaryCenter]}>
          If time runs out before anyone says the word, everyone loses.
        </Text>
      </View>

      <Dialog
        visible={confirmGiveUp}
        icon="alert"
        accent={color.dangerUrgency}
        title="Give up?"
        message="Nobody wins this round. The word and the Insider are revealed."
        confirmLabel="Give up"
        confirmTone="danger"
        cancelLabel="Keep asking"
        onConfirm={() => {
          setConfirmGiveUp(false);
          apply(quizTimedOut);
        }}
        onCancel={() => setConfirmGiveUp(false)}
      />
    </SessionShell>
  );
}

function DiscussionPhase({ session }: { session: InsiderSession }) {
  const { apply, clearSession } = useInsiderSession();
  const privateVotes = session.setup.votingMode === 'private';
  const enter = useEnterAnimation(1, 16);
  return (
    <SessionShell
      eyebrow="Word found"
      stage="vote"
      stages={STAGES}
      title="Now, who already knew?"
      subtitle="Who steered too well? Who was suspiciously quiet? Discuss. The Master can be questioned but is never the Insider."
      accent={ACCENT}
      onEndGame={() => endGame(clearSession)}
      footer={
        <PrimaryButton
          label={privateVotes ? 'Start private voting' : 'Choose the Insider'}
          icon="target"
          onPress={() => apply(startVoting)}
        />
      }
    >
      <Animated.View style={[styles.center, enter]}>
        <Text style={[type.eyebrow, { color: ACCENT }]}>The word was</Text>
        <Text style={[styles.secretWord, wordFont(session)]} numberOfLines={2} adjustsFontSizeToFit>
          {insiderWordText(session)}
        </Text>
        {session.solvedWithSeconds !== null ? (
          <Text style={[type.mono, styles.secondary]}>
            Found with {formatClock(session.solvedWithSeconds)} left
          </Text>
        ) : null}
      </Animated.View>
    </SessionShell>
  );
}

function GroupAccusePhase({ session }: { session: InsiderSession }) {
  const { apply, clearSession } = useInsiderSession();
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <SessionShell
      eyebrow="Group decision"
      stage="vote"
      stages={STAGES}
      title="Who is the Insider?"
      subtitle="Tap the player your group chose."
      accent={ACCENT}
      onEndGame={() => endGame(clearSession)}
      footer={
        <>
          <PrimaryButton
            label="Accuse this player"
            icon="target"
            disabled={!selected}
            onPress={() => {
              if (selected) apply((current) => accusePlayer(current, selected));
            }}
          />
          <SecondaryButton
            label="Deadlock: Insider wins"
            quiet
            onPress={() => apply(resolveGroupDeadlock)}
         
          />
        </>
      }
    >
      <PlayerPicker
        players={suspects(session)}
        selectedId={selected}
        onSelect={setSelected}
        accent={ACCENT}
      />
    </SessionShell>
  );
}

function VotingSelectPhase({ session }: { session: InsiderSession }) {
  const { apply, clearSession } = useInsiderSession();
  const [selected, setSelected] = useState<string | null>(null);
  const voterId = currentVoterId(session);

  useEffect(() => {
    setSelected(null);
  }, [session.voteIndex, session.runoffRound]);

  return (
    <SessionShell
      eyebrow={session.runoffRound > 0 ? 'Runoff vote' : 'Your vote'}
      stage="vote"
      stages={STAGES}
      title={voterId ? getInsiderPlayerName(session, voterId) : 'Player'}
      subtitle="Tap who you think secretly knew the word."
      accent={ACCENT}
      onEndGame={() => endGame(clearSession)}
      footer={
        <PrimaryButton
          label="Lock vote"
          icon="lock"
          disabled={!selected}
          onPress={() => {
            if (selected) apply((current) => castVote(current, selected));
          }}
        />
      }
    >
      <PlayerPicker
        players={voteSuspectOptions(session)}
        selectedId={selected}
        onSelect={setSelected}
        accent={ACCENT}
      />
    </SessionShell>
  );
}

function ResultPhase({ session }: { session: InsiderSession }) {
  const { rematch, clearSession } = useInsiderSession();
  const [deckError, setDeckError] = useState(false);
  const playVerdict = useSoundEffect(VERDICT_SOUND, 0.62);
  const playWin = useSoundEffect(WIN_SOUND, 0.72);
  const playLoss = useSoundEffect(LOSS_SOUND, 0.64);
  const enter = useEnterAnimation(1, 16);
  const insider = getInsiderPlayerName(session, session.insiderId);
  const caught = session.winner === 'commons';
  const summary = insiderVoteSummary(session);
  const topVotes = summary.reduce((max, row) => Math.max(max, row.count), 0);

  useEffect(() => {
    const stopVerdict = playVerdict();
    let stopResult: (() => void) | undefined;
    const id = setTimeout(() => {
      stopResult = caught ? playWin() : playLoss();
    }, 500);
    return () => {
      clearTimeout(id);
      stopVerdict?.();
      stopResult?.();
    };
  }, [caught, playLoss, playVerdict, playWin]);

  const headline =
    session.winner === 'nobody' ? 'Time ran out' : caught ? 'Insider caught!' : 'Insider wins';
  const detail =
    session.winner === 'nobody'
      ? 'Nobody found the word, so everyone loses.'
      : caught
        ? 'The Master and the Commons win.'
        : session.accusedPlayerId
          ? `${getInsiderPlayerName(session, session.accusedPlayerId)} was innocent.`
          : 'The group could not agree.';

  return (
    <SessionShell
      eyebrow="Result"
      stage="result"
      stages={STAGES}
      accent={caught ? color.success : ACCENT}
      footer={
        <>
          <PrimaryButton
            label="Play again (next Master)"
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
                  router.replace('/game/insider/setup/review');
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
        <Animated.View style={[styles.center, enter]}>
          <MoonFace expression={caught ? 'delighted' : 'secret'} size={96} />
          <Text style={[type.displayLg, styles.titleCenter]}>{headline}</Text>
          <Text style={[type.body, styles.secondaryCenter]}>{detail}</Text>
        </Animated.View>

        <Surface accent={ACCENT} active contentStyle={styles.card}>
          <Text style={[type.eyebrow, { color: ACCENT }]}>Insider</Text>
          <Text style={[type.titleMd, styles.primary]}>{insider}</Text>
          <Text style={[type.eyebrow, { color: color.brandPrimary }]}>Word</Text>
          <Text style={[type.titleMd, styles.primary, wordFont(session)]}>{insiderWordText(session)}</Text>
        </Surface>

        {summary.length > 0 ? (
          <Surface contentStyle={styles.card}>
            <Text style={[type.eyebrow, styles.muted]}>Votes</Text>
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
                        backgroundColor: row.count === topVotes ? ACCENT : alpha(color.textPrimary, 0.2),
                      },
                    ]}
                  />
                </View>
                <Text style={[type.numeric, styles.muted]}>{row.count}</Text>
              </View>
            ))}
          </Surface>
        ) : null}
      </ScrollView>

      <Dialog
        visible={deckError}
        moon="caught"
        accent={color.brandPrimary}
        title="Could not rematch"
        message="No words match these categories and levels."
        confirmLabel="Got it"
        confirmTone="honey"
        onConfirm={() => setDeckError(false)}
      />
    </SessionShell>
  );
}

export function InsiderSessionView({ session }: { session: InsiderSession }) {
  switch (session.phase) {
    case 'master_intro':
      return <MasterIntroPhase session={session} />;
    case 'handoff':
      return <HandoffPhase session={session} kind="reveal" />;
    case 'reveal':
      return <RevealPhase session={session} />;
    case 'quiz':
      return <QuizPhase session={session} />;
    case 'discussion':
      return <DiscussionPhase session={session} />;
    case 'group_accuse':
      return <GroupAccusePhase session={session} />;
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
  stack: {
    gap: space[4],
    paddingBottom: space[4],
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space[3],
  },
  card: {
    padding: space[4],
    gap: space[2],
  },
  primary: {
    color: color.textPrimary,
  },
  secondary: {
    color: color.textSecondary,
  },
  secondaryCenter: {
    color: color.textSecondary,
    textAlign: 'center',
  },
  muted: {
    color: color.textMuted,
  },
  titleCenter: {
    color: color.textPrimary,
    textAlign: 'center',
  },
  secretWord: {
    color: color.textPrimary,
    fontFamily: family.display.black,
    fontSize: 44,
    lineHeight: 50,
    letterSpacing: -1.4,
    textAlign: 'center',
  },
  secretBody: {
    color: color.textSecondary,
    textAlign: 'center',
  },
  clock: {
    color: color.textPrimary,
    fontFamily: family.mono.bold,
    fontSize: 72,
    lineHeight: 80,
  },
  row: {
    flexDirection: 'row',
    gap: space[3],
  },
  half: {
    flex: 1,
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
});
