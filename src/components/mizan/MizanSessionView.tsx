import { preload } from 'expo-audio';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Animated, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useMizanSession } from '../../domain/mizan/context';
import {
  answerTurnPending,
  beginPeek,
  currentPsychicId,
  finishPeek,
  getMizanPlayerName,
  lockGuess,
  makeCall,
  nextTurn,
  setGuess,
  skipSpectrum,
  spectrumEnds,
  teamIds,
  tiedAtTarget,
  togetherMaxScore,
} from '../../domain/mizan/machine';
import { MIZAN_MAX_POINTS, type MizanSession } from '../../domain/mizan/types';
import { otherTeam, teamLabel } from '../../domain/shared/utils';
import { hapticImpact, hapticSuccess } from '../../theme/haptics';
import { useEnterAnimation } from '../../theme/motion';
import { alpha, color, radius, space } from '../../theme/tokens';
import { type } from '../../theme/typography';
import { SOUND_VOLUME } from '../../theme/soundLevels';
import { useSoundEffect } from '../../theme/useSoundEffect';
import { ResultHero } from '../session/ResultHero';
import { HoldHint, HoldToReveal, useHoldReveal } from '../session/HoldToReveal';
import { PassPhoneHandoff } from '../session/PassPhoneHandoff';
import { TeamScoreStrip } from '../session/Scoreboards';
import { SessionShell } from '../session/SessionShell';
import { PrimaryButton } from '../ui/PrimaryButton';
import { SecondaryButton } from '../ui/SecondaryButton';
import { Surface } from '../ui/Surface';
import { MizanDial } from './MizanDial';

const ACCENT = color.gameMizan;
const STAGES = ['peek', 'guess', 'reveal', 'result'] as const;
const REVEAL_SOUND = require('../../../assets/sounds/mizan-reveal.wav');
const WIN_SOUND = require('../../../assets/sounds/result-win.wav');

void preload(REVEAL_SOUND);
void preload(WIN_SOUND);

function endGame(clearSession: () => void) {
  router.replace('/home');
  clearSession();
}

function SpectrumLabels({ session }: { session: MizanSession }) {
  const { left, right } = spectrumEnds(session);
  return (
    <View style={styles.ends}>
      <Text style={[type.titleMd, styles.endLeft]} numberOfLines={3}>
        ← {left}
      </Text>
      <Text style={[type.titleMd, styles.endRight]} numberOfLines={3}>
        {right} →
      </Text>
    </View>
  );
}

function ScoreLine({ session }: { session: MizanSession }) {
  if (session.setup.mode === 'teams') {
    return <TeamScoreStrip scores={session.scores} activeTeam={session.activeTeam} accent={ACCENT} />;
  }
  return (
    <Text style={[type.mono, styles.secondary]}>
      Round {session.turnNumber + 1}/{session.setup.rounds} · {session.scores.a} points
    </Text>
  );
}

function HandoffPhase({ session }: { session: MizanSession }) {
  const { apply, clearSession } = useMizanSession();
  const psychic = getMizanPlayerName(session, currentPsychicId(session));
  const teams = session.setup.mode === 'teams';
  const team = teamIds(session, session.activeTeam);
  return (
    <PassPhoneHandoff
      name={psychic}
      // Teams: which teammate is psychic. Together: which round this is.
      index={teams ? (session.psychicIndex[session.activeTeam] % team.length) + 1 : session.turnNumber + 1}
      total={teams ? team.length : session.setup.rounds}
      accent={ACCENT}
      eyebrow={teams ? `${teamLabel(session.activeTeam)} · Psychic` : 'Psychic'}
      stage="peek"
      stages={STAGES}
      note="Only the psychic sees the target. Everyone else, look away from the screen."
      readyLabel="I'm the psychic"
      onReady={() => apply(beginPeek)}
      onEndGame={() => endGame(clearSession)}
    />
  );
}

function PeekPhase({ session }: { session: MizanSession }) {
  const { apply, clearSession } = useMizanSession();
  const { unlocked, unlock } = useHoldReveal(`${session.turnNumber}-${session.spectrum.id}`);
  const psychic = getMizanPlayerName(session, currentPsychicId(session));

  return (
    <SessionShell
      eyebrow="Private peek"
      stage="peek"
      stages={STAGES}
      title={psychic}
      accent={ACCENT}
      onEndGame={() => endGame(clearSession)}
      footer={
        unlocked ? (
          <>
            <PrimaryButton label="Hide and give my clue" icon="eye" onPress={() => apply(finishPeek)} />
            <SecondaryButton label="New card" quiet onPress={() => apply(skipSpectrum)} />
          </>
        ) : (
          <HoldHint text="Hold until the ring fills, then memorise where the target sits." />
        )
      }
    >
      <HoldToReveal
        accent={ACCENT}
        unlocked={unlocked}
        onUnlock={unlock}
        resetKey={`${session.turnNumber}-${session.spectrum.id}`}
      >
        <View style={styles.peekInner}>
          <MizanDial accent={ACCENT} target={session.target} />
          <SpectrumLabels session={session} />
          <Text style={[type.bodySm, styles.secondaryCenter]}>
            Give one clue that sits where the bright wedge is. Then hide the screen.
          </Text>
        </View>
      </HoldToReveal>
    </SessionShell>
  );
}

function GuessPhase({ session }: { session: MizanSession }) {
  const { apply, clearSession } = useMizanSession();
  const psychic = getMizanPlayerName(session, currentPsychicId(session));
  const teams = session.setup.mode === 'teams';

  return (
    <SessionShell
      eyebrow={teams ? `${teamLabel(session.activeTeam)} guessing` : 'Everyone guessing'}
      stage="guess"
      stages={STAGES}
      title={`${psychic}, give your clue`}
      subtitle={
        teams
          ? 'One clue, out loud. Their team drags the needle; the psychic stays quiet after that.'
          : 'One clue, out loud. Everyone else drags the needle together.'
      }
      accent={ACCENT}
      onEndGame={() => endGame(clearSession)}
      footer={
        <>
          <View style={styles.row}>
            <View style={styles.half}>
              <SecondaryButton
                label="−1"
                onPress={() => apply((current) => setGuess(current, current.guess - 1))}
              />
            </View>
            <View style={styles.half}>
              <SecondaryButton
                label="+1"
                onPress={() => apply((current) => setGuess(current, current.guess + 1))}
              />
            </View>
          </View>
          <PrimaryButton label="Lock it in" icon="lock" onPress={() => apply(lockGuess)} />
        </>
      }
    >
      <View style={styles.stack}>
        <ScoreLine session={session} />
        <MizanDial
          accent={ACCENT}
          needle={session.guess}
          onChange={(value) => apply((current) => setGuess(current, value))}
        />
        <SpectrumLabels session={session} />
      </View>
    </SessionShell>
  );
}

function CallPhase({ session }: { session: MizanSession }) {
  const { apply, clearSession } = useMizanSession();
  const opponents = teamLabel(otherTeam(session.activeTeam));

  return (
    <SessionShell
      eyebrow={`${opponents}'s call`}
      stage="guess"
      stages={STAGES}
      title="Left or right?"
      subtitle={`${opponents}: is the real target left or right of the needle? Right call scores 1.`}
      accent={ACCENT}
      onEndGame={() => endGame(clearSession)}
      footer={
        <View style={styles.row}>
          <View style={styles.half}>
            <SecondaryButton
              label="← Left"
              onPress={() => apply((current) => makeCall(current, 'left'))}
            />
          </View>
          <View style={styles.half}>
            <SecondaryButton
              label="Right →"
              onPress={() => apply((current) => makeCall(current, 'right'))}
            />
          </View>
        </View>
      }
    >
      <View style={styles.stack}>
        <ScoreLine session={session} />
        <MizanDial accent={ACCENT} needle={session.guess} />
        <SpectrumLabels session={session} />
      </View>
    </SessionShell>
  );
}

function RevealPhase({ session }: { session: MizanSession }) {
  const { apply, clearSession } = useMizanSession();
  const playReveal = useSoundEffect(REVEAL_SOUND, SOUND_VOLUME.result);
  const enter = useEnterAnimation(1, 12);
  const points = session.result?.points ?? 0;
  const teams = session.setup.mode === 'teams';

  useEffect(() => {
    if (points === MIZAN_MAX_POINTS) hapticSuccess();
    else hapticImpact('medium');
    return playReveal();
  }, [playReveal, points]);

  const headline =
    points === MIZAN_MAX_POINTS
      ? 'Bullseye! 4 points'
      : points > 0
        ? `${points} points`
        : 'Missed';
  const detail = teams
    ? `${teamLabel(session.activeTeam)} +${points}${
        session.result?.opponentPoint
          ? ` · ${teamLabel(otherTeam(session.activeTeam))} +1 for the call`
          : ''
      }`
    : `${session.scores.a} points so far`;
  const status = answerTurnPending(session)
    ? `Target reached. ${teamLabel('b')} gets one last turn to answer.`
    : tiedAtTarget(session)
      ? 'Tied at the target. Another pair of turns decides it.'
      : null;

  return (
    <SessionShell
      eyebrow="Reveal"
      stage="reveal"
      stages={STAGES}
      accent={ACCENT}
      onEndGame={() => endGame(clearSession)}
      footer={<PrimaryButton label="Next turn" icon="chevronRight" onPress={() => apply(nextTurn)} />}
    >
      <View style={styles.stack}>
        <Animated.View style={[styles.revealHead, enter]}>
          <Text style={[type.displayLg, styles.title]}>{headline}</Text>
          <Text style={[type.body, styles.secondaryCenter]}>{detail}</Text>
          {status ? <Text style={[type.bodyStrong, { color: ACCENT }]}>{status}</Text> : null}
        </Animated.View>
        <MizanDial accent={ACCENT} target={session.target} needle={session.guess} />
        <SpectrumLabels session={session} />
        {teams ? <ScoreLine session={session} /> : null}
      </View>
    </SessionShell>
  );
}

function FinalPhase({ session }: { session: MizanSession }) {
  const { rematch, clearSession } = useMizanSession();
  const [deckError, setDeckError] = useState(false);
  const playWin = useSoundEffect(WIN_SOUND, SOUND_VOLUME.result);
  const enter = useEnterAnimation(1, 16);
  const teams = session.setup.mode === 'teams';
  const max = togetherMaxScore(session);

  useEffect(() => playWin(), [playWin]);

  const headline = teams
    ? session.winner === 'a' || session.winner === 'b'
      ? `${teamLabel(session.winner)} wins`
      : 'Game over'
    : `${session.scores.a} / ${max}`;
  const verdict = teams
    ? 'In sync at last.'
    : session.scores.a >= max * 0.75
      ? 'One mind. Remarkable.'
      : session.scores.a >= max * 0.5
        ? 'Mostly in sync.'
        : 'Plenty to argue about.';

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
                  router.replace('/game/mizan/setup/review');
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
        <Animated.View style={[styles.revealHead, enter]}>
          <ResultHero scene="celebrate" accent={ACCENT} title={headline} />
          <Text style={[type.body, styles.secondaryCenter]}>{verdict}</Text>
        </Animated.View>
        {teams ? (
          <>
            <TeamScoreStrip scores={session.scores} activeTeam={null} accent={ACCENT} />
            <Surface contentStyle={styles.card}>
              {(['a', 'b'] as const).map((team) => (
                <Text key={team} style={[type.bodySm, styles.secondary]}>
                  {teamLabel(team)}:{' '}
                  {teamIds(session, team)
                    .map((id) => getMizanPlayerName(session, id))
                    .join(', ')}
                </Text>
              ))}
            </Surface>
          </>
        ) : null}
      </ScrollView>

      {deckError ? (
        <Text style={[type.bodySm, styles.error]}>No spectrum cards match these levels.</Text>
      ) : null}
    </SessionShell>
  );
}

export function MizanSessionView({ session }: { session: MizanSession }) {
  switch (session.phase) {
    case 'handoff':
      return <HandoffPhase session={session} />;
    case 'peek':
      return <PeekPhase session={session} />;
    case 'guess':
      return <GuessPhase session={session} />;
    case 'call':
      return <CallPhase session={session} />;
    case 'reveal':
      return <RevealPhase session={session} />;
    case 'final':
      return <FinalPhase session={session} />;
    default:
      return null;
  }
}

const styles = StyleSheet.create({
  stack: {
    gap: space[4],
    paddingBottom: space[4],
  },
  peekInner: {
    width: '100%',
    gap: space[3],
  },
  ends: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: space[4],
  },
  endLeft: {
    color: color.textPrimary,
    flex: 1,
  },
  endRight: {
    color: color.textPrimary,
    flex: 1,
    textAlign: 'right',
  },
  secondary: {
    color: color.textSecondary,
  },
  secondaryCenter: {
    color: color.textSecondary,
    textAlign: 'center',
  },
  title: {
    color: color.textPrimary,
    textAlign: 'center',
  },
  revealHead: {
    alignItems: 'center',
    gap: space[2],
  },
  card: {
    padding: space[4],
    gap: space[2],
  },
  row: {
    flexDirection: 'row',
    gap: space[3],
  },
  half: {
    flex: 1,
  },
  error: {
    color: color.dangerUrgency,
    textAlign: 'center',
    padding: space[2],
    borderRadius: radius.medium,
    backgroundColor: alpha(color.dangerUrgency, 0.1),
  },
});
