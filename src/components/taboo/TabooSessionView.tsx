import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, AppState, StyleSheet, Text, View } from 'react-native';
import {
  currentDescriberId,
  getPlayerName,
  teamLabel,
  teamPlayerIds,
} from '../../domain/taboo/machine';
import { useTabooSession } from '../../domain/taboo/SessionContext';
import type { TabooSession, TeamId } from '../../domain/taboo/types';
import { useEnterAnimation } from '../../theme/motion';
import { alpha, color, overlay, radius, space } from '../../theme/tokens';
import { family, type } from '../../theme/typography';
import { SessionShell, TABOO_STAGES } from '../session/SessionShell';
import { ReportCardButton } from '../session/ReportCardButton';
import { MoonFace } from '../brand/MoonFace';
import { Dialog } from '../ui/Dialog';
import { Icon } from '../ui/Icon';
import { PressableScale } from '../ui/PressableScale';
import { PrimaryButton } from '../ui/PrimaryButton';
import { SecondaryButton } from '../ui/SecondaryButton';
import { Surface } from '../ui/Surface';

const ACCENT = color.gameTaboo;
const LOCK_MS = 420;

function endGame(clearSession: () => void) {
  router.replace('/home');
  clearSession();
}

function stageFor(phase: TabooSession['phase']): string {
  switch (phase) {
    case 'round_ready':
      return 'ready';
    case 'playing':
    case 'paused':
      return 'play';
    case 'turn_summary':
      return 'summary';
    case 'final':
      return 'result';
  }
}

function ScoreStrip({ session }: { session: TabooSession }) {
  return (
    <View style={styles.scoreStrip}>
      <ScorePill
        label="A"
        score={session.scores.a}
        active={session.activeTeam === 'a'}
      />
      <Text style={[type.mono, styles.scoreVs]}>vs</Text>
      <ScorePill
        label="B"
        score={session.scores.b}
        active={session.activeTeam === 'b'}
      />
    </View>
  );
}

function ScorePill({
  label,
  score,
  active,
}: {
  label: string;
  score: number;
  active: boolean;
}) {
  return (
    <View
      style={[
        styles.scorePill,
        active && {
          borderColor: alpha(ACCENT, 0.55),
          backgroundColor: alpha(ACCENT, 0.16),
        },
      ]}
    >
      <Text style={[type.eyebrow, { color: active ? ACCENT : color.textMuted }]}>
        Team {label}
      </Text>
      <Text style={[type.displayMd, { color: active ? ACCENT : color.textPrimary }]}>
        {score}
      </Text>
    </View>
  );
}

function RoundReadyPhase({ session }: { session: TabooSession }) {
  const { dispatch, clearSession } = useTabooSession();
  const describerId = currentDescriberId(session);
  const name = describerId ? getPlayerName(session, describerId) : 'Player';
  const team = teamLabel(session.activeTeam);
  const seconds = session.isSuddenDeath ? 30 : session.setup.roundSeconds;
  const enter = useEnterAnimation(1, 16);

  return (
    <SessionShell
      eyebrow={session.isSuddenDeath ? 'Sudden death' : 'Round ready'}
      stage={stageFor(session.phase)}
      stages={TABOO_STAGES}
      title={`${team}'s turn`}
      subtitle={`${name} describes. Opposing team: watch for forbidden words.`}
      accent={ACCENT}
      onEndGame={() => endGame(clearSession)}
      footer={
        <PrimaryButton
          label={`Start ${seconds}s`}
          icon="clock"
          onPress={() => dispatch.beginPlaying()}
        />
      }
    >
      <Animated.View style={[styles.readyBody, enter]}>
        <ScoreStrip session={session} />
        <Surface accent={ACCENT} active contentStyle={styles.describerCard}>
          <Text style={[type.eyebrow, { color: ACCENT }]}>Describer</Text>
          <Text style={[type.displayMd, styles.describerName]}>{name}</Text>
          <Text style={[type.bodySm, styles.hint]}>
            Only this player should see the card. Sit a watcher beside them if you want.
          </Text>
        </Surface>
        <View style={styles.roster}>
          {(['a', 'b'] as TeamId[]).map((teamId) => (
            <View key={teamId} style={styles.rosterCol}>
              <Text style={[type.eyebrow, styles.rosterLabel]}>{teamLabel(teamId)}</Text>
              {teamPlayerIds(session, teamId).map((id) => (
                <Text key={id} style={[type.bodySm, styles.rosterName]}>
                  {getPlayerName(session, id)}
                </Text>
              ))}
            </View>
          ))}
        </View>
      </Animated.View>
    </SessionShell>
  );
}

function PlayingPhase({ session }: { session: TabooSession }) {
  const { dispatch, clearSession } = useTabooSession();
  const total = session.isSuddenDeath ? 30 : session.setup.roundSeconds;
  const [left, setLeft] = useState(total);
  const [locked, setLocked] = useState(false);
  const lockTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const paused = session.phase === 'paused';

  useEffect(() => {
    setLeft(total);
  }, [session.turnsCompleted.a, session.turnsCompleted.b, total]);

  useEffect(() => {
    if (paused || session.phase !== 'playing') return;
    if (left <= 0) {
      dispatch.expireTurn();
      return;
    }
    const id = setTimeout(() => setLeft((value) => value - 1), 1000);
    return () => clearTimeout(id);
  }, [left, paused, session.phase, dispatch]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state !== 'active' && session.phase === 'playing') dispatch.pauseTurn();
    });
    return () => subscription.remove();
  }, [session.phase, dispatch]);

  useEffect(
    () => () => {
      if (lockTimer.current) clearTimeout(lockTimer.current);
    },
    [],
  );

  const withLock = (action: () => void) => {
    if (locked || paused) return;
    setLocked(true);
    action();
    lockTimer.current = setTimeout(() => setLocked(false), LOCK_MS);
  };

  const card = session.currentCard;
  const skipsLeft = session.setup.maxSkips - session.turnSkips;
  const urgent = left <= 10;
  const timerProgress = `${Math.max(0, Math.min(100, (left / total) * 100))}%` as `${number}%`;

  return (
    <SessionShell
      eyebrow={paused ? 'Paused' : `${teamLabel(session.activeTeam)} playing`}
      stage={stageFor(session.phase)}
      stages={TABOO_STAGES}
      accent={urgent ? color.dangerUrgency : ACCENT}
      onEndGame={() => endGame(clearSession)}
      footer={
        <>
          <View style={styles.actionRow}>
            <PressableScale
              accessibilityRole="button"
              accessibilityLabel="Correct"
              disabled={locked || paused || !card}
              onPress={() => withLock(() => dispatch.markCorrect())}
              haptic="medium"
              scaleTo={0.97}
              style={[styles.actionBtn, styles.correctBtn, (locked || paused) && styles.dim]}
            >
              <Icon name="check" size={22} color={color.void} strokeWidth={2.8} />
              <Text style={[type.button, styles.actionLabelDark]}>Correct</Text>
            </PressableScale>
            <PressableScale
              accessibilityRole="button"
              accessibilityLabel="Skip"
              disabled={locked || paused || !card || skipsLeft <= 0}
              onPress={() => withLock(() => dispatch.markSkip())}
              haptic="selection"
              scaleTo={0.97}
              style={[
                styles.actionBtn,
                styles.skipBtn,
                (locked || paused || skipsLeft <= 0) && styles.dim,
              ]}
            >
              <Icon name="shuffle" size={20} color={color.textPrimary} strokeWidth={2.2} />
              <Text style={[type.button, styles.actionLabel]}>
                Skip ({skipsLeft})
              </Text>
            </PressableScale>
          </View>
          {card ? <ReportCardButton game="taboo" cardId={card.id} onReported={() => withLock(dispatch.discardCard)} /> : null}
          <View style={styles.actionRow}>
            <PressableScale
              accessibilityRole="button"
              accessibilityLabel="Violation"
              disabled={locked || paused || !card}
              onPress={() => withLock(() => dispatch.markViolation())}
              haptic="medium"
              scaleTo={0.97}
              style={[styles.actionBtn, styles.violationBtn, (locked || paused) && styles.dim]}
            >
              <Icon name="alert" size={20} color={color.textPrimary} strokeWidth={2.2} />
              <Text style={[type.button, styles.actionLabel]}>Violation</Text>
            </PressableScale>
            <SecondaryButton
              label={paused ? 'Resume' : 'Pause'}
              onPress={() => (paused ? dispatch.resumeTurn() : dispatch.pauseTurn())}
              style={styles.half}
            />
          </View>
        </>
      }
    >
      <View style={styles.playTop}>
        <View
          style={[
            styles.timer,
            urgent && styles.timerUrgent,
            paused && styles.timerPaused,
          ]}
          accessible
          accessibilityLabel={paused ? `Timer paused at ${left} seconds` : `${left} seconds remaining`}
        >
          <View style={styles.timerReadout}>
            <MoonFace expression="timer" size={56} />
            <Text style={[styles.timerDigits, urgent && styles.timerDigitsUrgent]}>
              {String(Math.max(left, 0)).padStart(2, '0')}
            </Text>
            <View style={styles.timerCopy}>
              <Text style={[type.eyebrow, styles.timerUnit]}>Seconds</Text>
              {urgent && !paused ? <Text style={[type.eyebrow, styles.hurry]}>Hurry</Text> : null}
              {paused ? <Text style={[type.eyebrow, styles.pausedLabel]}>Paused</Text> : null}
            </View>
          </View>
          <View style={styles.timerTrack}>
            <View
              style={[
                styles.timerFill,
                { width: timerProgress, backgroundColor: urgent ? color.dangerUrgency : ACCENT },
              ]}
            />
          </View>
        </View>
        <Text style={[type.mono, styles.turnMeta]}>
          +{session.turnCorrect} · skip {session.turnSkips} · foul {session.turnViolations}
        </Text>
      </View>

      {card ? (
        <Surface accent={ACCENT} active contentStyle={styles.card}>
          <Text style={[type.eyebrow, { color: ACCENT }]}>Describe</Text>
          <Text style={styles.target} numberOfLines={2} adjustsFontSizeToFit>
            {card.target_en}
          </Text>
          <Text style={[type.eyebrow, styles.forbiddenLabel]}>Don’t say</Text>
          <View style={styles.forbiddenList}>
            {card.forbidden_en.map((word) => (
              <View key={word} style={styles.forbiddenChip}>
                <Text style={[type.label, styles.forbiddenText]}>{word}</Text>
              </View>
            ))}
          </View>
        </Surface>
      ) : (
        <Text style={[type.body, styles.hint]}>Deck exhausted this turn.</Text>
      )}
    </SessionShell>
  );
}

function TurnSummaryPhase({ session }: { session: TabooSession }) {
  const { dispatch, clearSession } = useTabooSession();
  const team = teamLabel(session.activeTeam);

  return (
    <SessionShell
      eyebrow="Turn summary"
      stage={stageFor(session.phase)}
      stages={TABOO_STAGES}
      title={`${team} scored ${session.turnScore}`}
      subtitle="Fix a mis-tap before continuing."
      accent={ACCENT}
      onEndGame={() => endGame(clearSession)}
      footer={
        <>
          <View style={styles.adjustRow}>
            <SecondaryButton label="−1" onPress={() => dispatch.adjustTurnScore(-1)} style={styles.half} />
            <SecondaryButton label="+1" onPress={() => dispatch.adjustTurnScore(1)} style={styles.half} />
          </View>
          <PrimaryButton
            label="Next team"
            icon="chevronRight"
            onPress={() => dispatch.confirmTurnSummary()}
          />
        </>
      }
    >
      <ScoreStrip session={session} />
      <Surface contentStyle={styles.summaryCard}>
        <SummaryRow label="Correct" value={session.turnCorrect} />
        <SummaryRow label="Skipped" value={session.turnSkips} />
        <SummaryRow label="Violations" value={session.turnViolations} />
        <SummaryRow label="Turn points" value={session.turnScore} accent />
      </Surface>
    </SessionShell>
  );
}

function SummaryRow({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <View style={styles.summaryRow}>
      <Text style={[type.body, styles.hint]}>{label}</Text>
      <Text
        style={[
          type.displayMd,
          { color: accent ? ACCENT : color.textPrimary },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

function FinalPhase({ session }: { session: TabooSession }) {
  const { dispatch, clearSession } = useTabooSession();
  const [deckError, setDeckError] = useState(false);
  const winner =
    session.winner === 'tie'
      ? 'It’s a tie'
      : session.winner
        ? `${teamLabel(session.winner)} wins`
        : 'Game over';
  const enter = useEnterAnimation(1, 16);

  return (
    <SessionShell
      eyebrow="Final"
      stage={stageFor(session.phase)}
      stages={TABOO_STAGES}
      accent={ACCENT}
      footer={
        <>
          <PrimaryButton
            label="Rematch (new teams)"
            icon="refresh"
            onPress={() => {
              if (!dispatch.rematch()) setDeckError(true);
            }}
          />
          <SecondaryButton
            label="Same teams again"
            onPress={() => {
              if (!dispatch.rematchKeepTeams()) setDeckError(true);
            }}
          />
          <View style={styles.resultActions}>
            <SecondaryButton
              label="Change setup"
              onPress={() => {
                clearSession();
                router.replace('/game/taboo/setup/review');
              }}
              style={styles.half}
            />
            <SecondaryButton
              label="Home"
              onPress={() => endGame(clearSession)}
              style={styles.half}
            />
          </View>
        </>
      }
    >
      <Animated.View style={[styles.finalBlock, enter]}>
        <MoonFace
          expression={session.winner === 'tie' ? 'ready' : 'delighted'}
          size={96}
        />
        <Text style={[type.displayLg, { color: color.textPrimary }]}>{winner}</Text>
        <ScoreStrip session={session} />
      </Animated.View>

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

export function TabooSessionView({ session }: { session: TabooSession }) {
  switch (session.phase) {
    case 'round_ready':
      return <RoundReadyPhase session={session} />;
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
  readyBody: {
    gap: space[4],
  },
  scoreStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
  },
  scorePill: {
    flex: 1,
    borderRadius: radius.medium,
    borderWidth: 1,
    borderColor: color.borderSubtle,
    backgroundColor: overlay.glass,
    padding: space[3],
    gap: 2,
  },
  scoreVs: {
    color: color.textMuted,
  },
  describerCard: {
    padding: space[5],
    gap: space[2],
  },
  describerName: {
    color: color.textPrimary,
  },
  hint: {
    color: color.textSecondary,
  },
  roster: {
    flexDirection: 'row',
    gap: space[4],
  },
  rosterCol: {
    flex: 1,
    gap: space[1],
  },
  rosterLabel: {
    color: color.textMuted,
    marginBottom: space[1],
  },
  rosterName: {
    color: color.textPrimary,
  },
  playTop: {
    gap: space[2],
    marginBottom: space[4],
  },
  timer: {
    borderRadius: radius.medium,
    borderWidth: 1,
    borderColor: alpha(ACCENT, 0.3),
    backgroundColor: alpha(ACCENT, 0.08),
    paddingHorizontal: space[4],
    paddingTop: space[3],
    paddingBottom: space[2],
    gap: space[2],
  },
  timerUrgent: {
    borderColor: alpha(color.dangerUrgency, 0.55),
    backgroundColor: alpha(color.dangerUrgency, 0.11),
  },
  timerPaused: {
    opacity: 0.68,
  },
  timerReadout: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space[3],
  },
  timerDigits: {
    color: color.textPrimary,
    fontFamily: family.mono.bold,
    fontSize: 54,
    lineHeight: 58,
    letterSpacing: -2,
    fontVariant: ['tabular-nums'],
  },
  timerDigitsUrgent: {
    color: color.dangerUrgency,
  },
  timerCopy: {
    minWidth: 68,
    gap: 3,
  },
  timerUnit: {
    color: color.textMuted,
  },
  hurry: {
    color: color.dangerUrgency,
  },
  pausedLabel: {
    color: color.textPrimary,
  },
  timerTrack: {
    height: 4,
    borderRadius: radius.pill,
    overflow: 'hidden',
    backgroundColor: alpha(color.textPrimary, 0.1),
  },
  timerFill: {
    height: '100%',
    borderRadius: radius.pill,
  },
  turnMeta: {
    color: color.textMuted,
    textAlign: 'center',
  },
  card: {
    padding: space[5],
    gap: space[3],
    flexGrow: 1,
  },
  target: {
    color: color.textPrimary,
    fontFamily: family.display.black,
    fontSize: 44,
    lineHeight: 48,
    letterSpacing: -1.5,
  },
  forbiddenLabel: {
    color: color.dangerUrgency,
    marginTop: space[2],
  },
  forbiddenList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space[2],
  },
  forbiddenChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: alpha(color.dangerUrgency, 0.35),
    backgroundColor: alpha(color.dangerUrgency, 0.12),
  },
  forbiddenText: {
    color: color.textPrimary,
  },
  actionRow: {
    flexDirection: 'row',
    gap: space[3],
  },
  actionBtn: {
    flex: 1,
    minHeight: 56,
    borderRadius: radius.medium,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: space[2],
    paddingHorizontal: space[3],
  },
  correctBtn: {
    backgroundColor: color.success,
    borderColor: color.success,
  },
  skipBtn: {
    backgroundColor: overlay.glassStrong,
    borderColor: color.borderSubtle,
  },
  violationBtn: {
    backgroundColor: alpha(color.dangerUrgency, 0.2),
    borderColor: alpha(color.dangerUrgency, 0.45),
  },
  actionLabel: {
    color: color.textPrimary,
  },
  actionLabelDark: {
    color: color.void,
  },
  dim: {
    opacity: 0.45,
  },
  half: {
    flex: 1,
  },
  summaryCard: {
    marginTop: space[4],
    padding: space[4],
    gap: space[3],
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  adjustRow: {
    flexDirection: 'row',
    gap: space[3],
  },
  finalBlock: {
    alignItems: 'center',
    gap: space[4],
    paddingTop: space[4],
  },
  resultActions: {
    flexDirection: 'row',
    gap: space[3],
  },
});
