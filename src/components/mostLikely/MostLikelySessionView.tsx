import { router } from 'expo-router';
import { useEffect } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { currentPrompt } from '../../domain/mostLikely/machine';
import { useMostLikelySession } from '../../domain/mostLikely/SessionContext';
import type { MostLikelySession } from '../../domain/mostLikely/types';
import { hapticImpact, hapticSuccess } from '../../theme/haptics';
import { useEnterAnimation } from '../../theme/motion';
import { alpha, color, glow, radius, space } from '../../theme/tokens';
import { family, type } from '../../theme/typography';
import { SessionShell } from '../session/SessionShell';
import { ReportCardButton } from '../session/ReportCardButton';
import { PrimaryButton } from '../ui/PrimaryButton';
import { SecondaryButton } from '../ui/SecondaryButton';
import { Surface } from '../ui/Surface';
import { MoonFace } from '../brand/MoonFace';
import { Icon } from '../ui/Icon';

const ACCENT = color.gameMostLikely;
const STAGES = ['prompt', 'point', 'discuss', 'result'] as const;

function endGame(clearSession: () => void) {
  router.replace('/home');
  clearSession();
}

function stageFor(phase: MostLikelySession['phase']): string {
  switch (phase) {
    case 'prompt':
      return 'prompt';
    case 'countdown':
      return 'point';
    case 'discuss':
      return 'discuss';
    case 'ended':
      return 'result';
  }
}

/**
 * One card, three states: read → count down → pointed.
 *
 * The prompt keeps its size and position throughout. Replacing it with a
 * smaller "Who got the most points?" screen the moment people start arguing
 * took the wording away exactly when the room needed it.
 */
function PromptCard({ session }: { session: MostLikelySession }) {
  const { dispatch, clearSession } = useMostLikelySession();
  const prompt = currentPrompt(session);
  const enter = useEnterAnimation(1, 16);
  const badgeEnter = useEnterAnimation(0, 10);
  const phase = session.phase;
  const counting = phase === 'countdown';
  const pointed = phase === 'discuss';
  const remaining = session.deck.length - session.index;
  const last = session.index >= session.deck.length - 1;
  const value = session.countdownValue;

  useEffect(() => {
    if (!counting) return;
    if (value === 3 || value === 2 || value === 1) hapticImpact('medium');
    if (value === 0) hapticSuccess();
    const id = setTimeout(() => dispatch.tickCountdown(), value === 0 ? 700 : 850);
    return () => clearTimeout(id);
  }, [counting, value, dispatch]);

  const countLabel = value === 0 ? 'Point!' : value === null ? '' : String(value);

  return (
    <SessionShell
      eyebrow={
        counting
          ? 'Point together'
          : pointed
            ? 'Fingers up'
            : `Prompt ${session.index + 1} · ${remaining} left`
      }
      stage={stageFor(phase)}
      stages={STAGES}
      accent={ACCENT}
      onEndGame={() => endGame(clearSession)}
      // Same three slots in every state, so the prompt above never shifts as
      // the round moves from reading to pointed.
      footer={
        <>
          <PrimaryButton
            label={
              pointed ? (last ? 'Finish session' : 'Next prompt') : 'Start countdown'
            }
            icon={pointed ? 'chevronRight' : 'users'}
            disabled={counting}
            onPress={() => (pointed ? dispatch.nextPrompt() : dispatch.beginCountdown())}
          />
          <SecondaryButton
            label="Skip prompt"
            disabled={counting}
            onPress={() => dispatch.skipPrompt()}
          />
          {prompt ? (
            <ReportCardButton
              game="most_likely"
              cardId={prompt.id}
              onReported={dispatch.skipPrompt}
            />
          ) : null}
        </>
      }
    >
      <Animated.View style={[styles.body, enter]}>
        <View style={counting ? styles.dimmed : undefined}>
          <Surface accent={ACCENT} active contentStyle={styles.promptCard}>
            <Text style={[type.eyebrow, { color: ACCENT }]}>Who’s most likely to…</Text>
            <Text style={styles.promptText}>{prompt?.prompt_en}</Text>
          </Surface>
        </View>

        {/*
          Always rendered, only faded — unmounting it shrinks this centred
          column and shifts the prompt card the instant the countdown starts.
          The reserved height also absorbs the one- vs two-line difference
          between the two hints.
        */}
        <Text
          style={[type.bodySm, styles.hint, counting && styles.hintHidden]}
          numberOfLines={2}
        >
          {pointed
            ? 'Argue it out. No official winner needed.'
            : 'Someone reads it aloud. Then everyone points at the same time.'}
        </Text>

        {counting ? (
          <View style={styles.countOverlay} pointerEvents="none">
            <Animated.View
              style={[
                styles.countdownBadge,
                badgeEnter,
                glow(ACCENT, 0.4, 28),
                { borderColor: alpha(ACCENT, 0.5) },
              ]}
            >
              <MoonFace expression="timer" size={52} />
              <Text style={styles.countdownValue}>{countLabel}</Text>
            </Animated.View>
          </View>
        ) : null}
      </Animated.View>
    </SessionShell>
  );
}

function EndedPhase({ session }: { session: MostLikelySession }) {
  const { dispatch, clearSession } = useMostLikelySession();
  const enter = useEnterAnimation(1, 16);

  return (
    <SessionShell
      eyebrow="Session"
      stage={stageFor(session.phase)}
      stages={STAGES}
      accent={ACCENT}
      footer={
        <>
          <PrimaryButton
            label="Play again"
            icon="refresh"
            onPress={() => dispatch.rematch()}
          />
          <View style={styles.row}>
            <SecondaryButton
              label="Change setup"
              onPress={() => {
                clearSession();
                router.replace('/game/most_likely/setup/review');
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
      <Animated.View style={[styles.ended, enter]}>
        <MoonFace expression="delighted" size={96} />
        <Text style={[type.displayLg, { color: color.textPrimary }]}>That’s a wrap</Text>
        <Text style={[type.body, styles.hint]}>
          You played {session.playedCount} prompt{session.playedCount === 1 ? '' : 's'}.
          Compare answers, then move on.
        </Text>
      </Animated.View>
    </SessionShell>
  );
}

export function MostLikelySessionView({ session }: { session: MostLikelySession }) {
  if (session.phase === 'ended') return <EndedPhase session={session} />;
  return <PromptCard session={session} />;
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    justifyContent: 'center',
    gap: space[4],
  },
  promptCard: {
    padding: space[6],
    gap: space[4],
    minHeight: 220,
    justifyContent: 'center',
  },
  promptText: {
    color: color.textPrimary,
    fontFamily: family.display.bold,
    fontSize: 30,
    lineHeight: 38,
    letterSpacing: -0.6,
  },
  hint: {
    color: color.textSecondary,
    textAlign: 'center',
    // Two lines of bodySm — holds the column steady across all three states.
    minHeight: 40,
  },
  hintHidden: {
    opacity: 0,
  },
  dimmed: {
    opacity: 0.35,
  },
  countOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdownBadge: {
    width: 168,
    height: 168,
    borderRadius: radius.pill,
    borderWidth: 1,
    backgroundColor: alpha(ACCENT, 0.16),
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  countdownValue: {
    color: color.textPrimary,
    fontFamily: family.display.black,
    fontSize: 48,
    lineHeight: 52,
  },
  ended: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space[4],
  },
  endedBadge: {
    width: 72,
    height: 72,
    borderRadius: radius.large,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    gap: space[3],
  },
  half: {
    flex: 1,
  },
});
