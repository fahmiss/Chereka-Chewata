import { router } from 'expo-router';
import { preload } from 'expo-audio';
import { useEffect, useRef, useState } from 'react';
import { Animated, AppState, StyleSheet, Text, View } from 'react-native';
import { localizeList, localizeText } from '../../content/localize';
import {
  currentDescriberId,
  getPlayerName,
  teamPlayerIds,
} from '../../domain/taboo/machine';
import { useTabooSession } from '../../domain/taboo/SessionContext';
import type { TabooSession, TeamId } from '../../domain/taboo/types';
import { useEnterAnimation } from '../../theme/motion';
import { SOUND_VOLUME } from '../../theme/soundLevels';
import { useSoundEffect } from '../../theme/useSoundEffect';
import { alpha, color, overlay, radius, space } from '../../theme/tokens';
import { family, type } from '../../theme/typography';
import { SessionShell, TABOO_STAGES } from '../session/SessionShell';
import { ReportCardButton } from '../session/ReportCardButton';
import { ResultHero } from '../session/ResultHero';
import { ResultActions } from '../session/ResultActions';
import { tabooResultReason } from '../../domain/shared/resultReasons';
import { Dialog } from '../ui/Dialog';
import { Icon } from '../ui/Icon';
import { PressableScale } from '../ui/PressableScale';
import { PrimaryButton } from '../ui/PrimaryButton';
import { SecondaryButton } from '../ui/SecondaryButton';
import { Surface } from '../ui/Surface';
import { TeamScoreStrip } from '../session/Scoreboards';
import { useT } from '../../i18n';

const ACCENT = color.gameTaboo;
const LOCK_MS = 420;
const WARNING_SOUND = require('../../../assets/sounds/taboo-warning.wav');
const TICK_SOUND = require('../../../assets/sounds/taboo-last-three.wav');
const TIME_UP_SOUND = require('../../../assets/sounds/taboo-time-up.wav');
const CORRECT_SOUND = require('../../../assets/sounds/taboo-correct.wav');
const VIOLATION_SOUND = require('../../../assets/sounds/taboo-violation.wav');

void preload(WARNING_SOUND);
void preload(TICK_SOUND);
void preload(TIME_UP_SOUND);
void preload(CORRECT_SOUND);
void preload(VIOLATION_SOUND);

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

function localizedTeamLabel(t: ReturnType<typeof useT>['t'], team: TeamId): string {
  return team === 'a' ? t('taboo.teamA') : t('taboo.teamB');
}

/** Scores with each team's players listed underneath; the describer is lit. */
function ScoreStrip({ session }: { session: TabooSession }) {
  const { t } = useT();
  const names = (team: TeamId) => teamPlayerIds(session, team).map((id) => getPlayerName(session, id));
  const describerId = currentDescriberId(session);
  return (
    <TeamScoreStrip
      scores={session.scores}
      activeTeam={session.activeTeam}
      accent={ACCENT}
      members={{ a: names('a'), b: names('b') }}
      highlightName={describerId ? getPlayerName(session, describerId) : undefined}
      labels={{ a: t('taboo.teamA'), b: t('taboo.teamB') }}
    />
  );
}

function RoundReadyPhase({ session }: { session: TabooSession }) {
  const { dispatch, clearSession } = useTabooSession();
  const { t, uiFont } = useT();
  const describerId = currentDescriberId(session);
  const name = describerId ? getPlayerName(session, describerId) : 'Player';
  const team = localizedTeamLabel(t, session.activeTeam);
  const seconds = session.isSuddenDeath ? 30 : session.setup.roundSeconds;
  const enter = useEnterAnimation(1, 16);

  return (
    <SessionShell
      eyebrow={session.isSuddenDeath ? t('taboo.suddenDeath') : t('taboo.roundReady')}
      stage={stageFor(session.phase)}
      stages={TABOO_STAGES}
      title={t('taboo.teamTurn', { team })}
      headingStyle="context"
      instruction={t('taboo.watcherInstruction')}
      scrollable
      centerContent
      accent={ACCENT}
      onEndGame={() => endGame(clearSession)}
      footer={
        <PrimaryButton
          label={t('taboo.startSeconds', { seconds })}
          icon="clock"
          onPress={() => dispatch.beginPlaying()}
        />
      }
    >
      <Animated.View style={[styles.readyBody, enter]}>
        <ScoreStrip session={session} />
        <Surface accent={ACCENT} active contentStyle={styles.describerCard}>
          <Text style={[type.eyebrow, { color: ACCENT }, uiFont ? { fontFamily: uiFont } : null]}>{t('taboo.describer')}</Text>
          <Text style={[type.displayMd, styles.describerName]}>{name}</Text>
          <Text style={[type.bodySm, styles.hint, uiFont ? { fontFamily: uiFont } : null]}>{t('taboo.describerHint')}</Text>
        </Surface>
      </Animated.View>
    </SessionShell>
  );
}

function PlayingPhase({ session }: { session: TabooSession }) {
  const { dispatch, clearSession } = useTabooSession();
  const { t, uiFont } = useT();
  const total = session.isSuddenDeath ? 30 : session.setup.roundSeconds;
  const [left, setLeft] = useState(total);
  const [locked, setLocked] = useState(false);
  const lockTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const paused = session.phase === 'paused';
  const playWarning = useSoundEffect(WARNING_SOUND, SOUND_VOLUME.cue);
  const playTick = useSoundEffect(TICK_SOUND, SOUND_VOLUME.soft);
  const playCorrect = useSoundEffect(CORRECT_SOUND, SOUND_VOLUME.cue);
  const playViolation = useSoundEffect(VIOLATION_SOUND, SOUND_VOLUME.cue);

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
    if (paused || session.phase !== 'playing') return;
    if (left === 10) playWarning();
    else if (left > 0 && left <= 3) playTick();
  }, [left, paused, playTick, playWarning, session.phase]);

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
      eyebrow={paused ? t('taboo.paused') : t('taboo.teamPlaying', { team: localizedTeamLabel(t, session.activeTeam) })}
      scrollable
      stage={stageFor(session.phase)}
      stages={TABOO_STAGES}
      accent={urgent ? color.dangerUrgency : ACCENT}
      onEndGame={() => endGame(clearSession)}
      footer={
        <>
          <View style={styles.actionRow}>
            <PressableScale
              accessibilityRole="button"
              accessibilityLabel={t('taboo.correct')}
              disabled={locked || paused || !card}
              onPress={() => withLock(() => {
                playCorrect();
                dispatch.markCorrect();
              })}
              haptic="medium"
              scaleTo={0.97}
              style={[styles.actionBtn, styles.correctBtn, (locked || paused) && styles.dim]}
            >
              <Icon name="check" size={22} color={color.void} strokeWidth={2.8} />
              <Text style={[type.button, styles.actionLabelDark, uiFont ? { fontFamily: uiFont } : null]}>{t('taboo.correct')}</Text>
            </PressableScale>
            <PressableScale
              accessibilityRole="button"
              accessibilityLabel={t('taboo.skip')}
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
              <Text style={[type.button, styles.actionLabel, uiFont ? { fontFamily: uiFont } : null]}>{t('taboo.skipCount', { n: skipsLeft })}</Text>
            </PressableScale>
          </View>
          <View style={styles.actionRow}>
            <PressableScale
              accessibilityRole="button"
              accessibilityLabel={t('taboo.violation')}
              disabled={locked || paused || !card}
              onPress={() => withLock(() => {
                playViolation();
                dispatch.markViolation();
              })}
              haptic="medium"
              scaleTo={0.97}
              style={[styles.actionBtn, styles.violationBtn, (locked || paused) && styles.dim]}
            >
              <Icon name="alert" size={20} color={color.textPrimary} strokeWidth={2.2} />
              <Text style={[type.button, styles.actionLabel, uiFont ? { fontFamily: uiFont } : null]}>{t('taboo.violation')}</Text>
            </PressableScale>
            <SecondaryButton
              label={paused ? t('taboo.resume') : t('taboo.pause')}
              onPress={() => (paused ? dispatch.resumeTurn() : dispatch.pauseTurn())}
              style={styles.half}
            />
          </View>
          {card ? <ReportCardButton game="taboo" cardId={card.id} onReported={() => withLock(dispatch.discardCard)} /> : null}
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
          accessibilityLabel={paused ? t('taboo.timerPaused', { seconds: left }) : t('taboo.timerRemaining', { seconds: left })}
        >
          <View style={styles.timerReadout}>
            <Text style={[styles.timerDigits, urgent && styles.timerDigitsUrgent]}>
              {String(Math.max(left, 0)).padStart(2, '0')}
            </Text>
            <View style={styles.timerCopy}>
              <Text style={[type.eyebrow, styles.timerUnit, uiFont ? { fontFamily: uiFont } : null]}>{t('taboo.seconds')}</Text>
              {urgent && !paused ? <Text style={[type.eyebrow, styles.hurry, uiFont ? { fontFamily: uiFont } : null]}>{t('taboo.hurry')}</Text> : null}
              {paused ? <Text style={[type.eyebrow, styles.pausedLabel, uiFont ? { fontFamily: uiFont } : null]}>{t('taboo.paused')}</Text> : null}
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
        <Text style={[type.mono, styles.turnMeta, uiFont ? { fontFamily: uiFont } : null]}>{t('taboo.turnMeta', { correct: session.turnCorrect, skips: session.turnSkips, violations: session.turnViolations })}</Text>
      </View>

      {card ? (
        <Surface accent={ACCENT} active contentStyle={styles.card}>
          <Text style={[type.eyebrow, { color: ACCENT }, uiFont ? { fontFamily: uiFont } : null]}>{t('taboo.describe')}</Text>
          <Text
            style={[
              styles.target,
              session.contentLanguage !== 'en' ? { fontFamily: family.ethiopic.bold } : null,
            ]}
            numberOfLines={2}
            adjustsFontSizeToFit
          >
            {localizeText(session.contentLanguage, {
              en: card.target_en,
              am: card.target_am,
            })}
          </Text>
          <Text style={[type.eyebrow, styles.forbiddenLabel, uiFont ? { fontFamily: uiFont } : null]}>{t('taboo.dontSay')}</Text>
          <View style={styles.forbiddenList}>
            {localizeList(
              session.contentLanguage,
              card.forbidden_en,
              card.forbidden_am,
            ).map((word) => (
              <View key={word} style={styles.forbiddenChip}>
                <Icon name="close" size={12} color={color.dangerUrgency} strokeWidth={3} />
                <Text
                  style={[
                    type.label,
                    styles.forbiddenText,
                    session.contentLanguage !== 'en'
                      ? { fontFamily: family.ethiopic.medium }
                      : null,
                  ]}
                >
                  {word}
                </Text>
              </View>
            ))}
          </View>
        </Surface>
      ) : (
        <Text style={[type.body, styles.hint, uiFont ? { fontFamily: uiFont } : null]}>{t('taboo.deckExhaustedTurn')}</Text>
      )}
    </SessionShell>
  );
}

function TurnSummaryPhase({ session }: { session: TabooSession }) {
  const { dispatch, clearSession } = useTabooSession();
  const { t, uiFont } = useT();
  const team = localizedTeamLabel(t, session.activeTeam);
  const playTimeUp = useSoundEffect(TIME_UP_SOUND, SOUND_VOLUME.result);

  useEffect(() => playTimeUp(), [playTimeUp]);

  return (
    <SessionShell
      eyebrow={t('taboo.turnSummary')}
      stage={stageFor(session.phase)}
      stages={TABOO_STAGES}
      title={t('taboo.teamScored', { team, n: session.turnScore })}
      headingStyle="context"
      instruction={t('taboo.adjustInstruction')}
      scrollable
      accent={ACCENT}
      onEndGame={() => endGame(clearSession)}
      footer={
        <>
          <View style={styles.adjustRow}>
            <SecondaryButton label="−1" onPress={() => dispatch.adjustTurnScore(-1)} style={styles.half} />
            <SecondaryButton label="+1" onPress={() => dispatch.adjustTurnScore(1)} style={styles.half} />
          </View>
          <PrimaryButton
            label={t('taboo.nextTeam')}
            icon="chevronRight"
            onPress={() => dispatch.confirmTurnSummary()}
          />
        </>
      }
    >
      <ScoreStrip session={session} />
      <Surface contentStyle={styles.summaryCard}>
        <SummaryRow label={t('taboo.correct')} value={session.turnCorrect} fontFamily={uiFont} />
        <SummaryRow label={t('taboo.skipped')} value={session.turnSkips} fontFamily={uiFont} />
        <SummaryRow label={t('taboo.violations')} value={session.turnViolations} fontFamily={uiFont} />
        <SummaryRow label={t('taboo.turnPoints')} value={session.turnScore} accent fontFamily={uiFont} />
      </Surface>
    </SessionShell>
  );
}

function SummaryRow({
  label,
  value,
  accent,
  fontFamily,
}: {
  label: string;
  value: number;
  accent?: boolean;
  fontFamily?: string;
}) {
  return (
    <View style={styles.summaryRow}>
      <Text style={[type.body, styles.hint, fontFamily ? { fontFamily } : null]}>{label}</Text>
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
  const { t, language, uiFont } = useT();
  const [deckError, setDeckError] = useState(false);
  const winner =
    session.winner === 'tie'
      ? t('taboo.tie')
      : session.winner
        ? t('taboo.teamWins', { team: localizedTeamLabel(t, session.winner) })
        : t('taboo.gameOver');

  return (
    <SessionShell
      eyebrow={t('taboo.final')}
      scrollable
      stage={stageFor(session.phase)}
      stages={TABOO_STAGES}
      accent={ACCENT}
      footer={
        <ResultActions
          gameId="taboo"
          onPlayAgain={() => { if (!dispatch.rematch()) setDeckError(true); }}
          onLeave={clearSession}
          replayHint={t('taboo.replayHint')}
          alternateReplay={{ label: t('taboo.sameTeams'), onPress: () => { if (!dispatch.rematchKeepTeams()) setDeckError(true); } }}
        />
      }
    >
      <View style={styles.finalBlock}>
        <ResultHero scene="celebrate" accent={ACCENT} title={winner} detail={tabooResultReason(session, language)} uiFont={uiFont} />
        <ScoreStrip session={session} />
      </View>

      <Dialog
        visible={deckError}
        moon="caught"
        accent={color.brandPrimary}
        title={t('taboo.rematchFailed')}
        message={t('taboo.noCards')}
        confirmLabel={t('common.gotIt')}
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
    paddingTop: space[2],
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
    justifyContent: 'space-between',
    gap: space[3],
  },
  timerDigits: {
    color: color.textPrimary,
    fontFamily: family.mono.bold,
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -1,
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
    ...type.brushHero,
    color: ACCENT,
    paddingHorizontal: 4,
    textShadowColor: alpha(ACCENT, 0.45),
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 18,
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
    flexShrink: 1,
    textAlign: 'center',
  },
  actionLabelDark: {
    color: color.void,
    flexShrink: 1,
    textAlign: 'center',
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
