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
import { PrimaryButton } from '../ui/PrimaryButton';
import { SecondaryButton } from '../ui/SecondaryButton';
import { Surface } from '../ui/Surface';
import { Icon } from '../ui/Icon';

const ACCENT = color.gameMostLikely;
const STAGES = ['prompt', 'point', 'discuss', 'result'] as const;

function endGame(clearSession: () => void) {
  clearSession();
  router.replace('/home');
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

function PromptPhase({ session }: { session: MostLikelySession }) {
  const { dispatch, clearSession } = useMostLikelySession();
  const prompt = currentPrompt(session);
  const enter = useEnterAnimation(1, 16);
  const remaining = session.deck.length - session.index;

  return (
    <SessionShell
      eyebrow={`Prompt ${session.index + 1} · ${remaining} left`}
      stage={stageFor(session.phase)}
      stages={STAGES}
      accent={ACCENT}
      onEndGame={() => endGame(clearSession)}
      footer={
        <>
          <PrimaryButton
            label="Start countdown"
            icon="users"
            onPress={() => dispatch.beginCountdown()}
          />
          <SecondaryButton label="Skip prompt" onPress={() => dispatch.skipPrompt()} />
        </>
      }
    >
      <Animated.View style={[styles.body, enter]}>
        <Surface accent={ACCENT} active contentStyle={styles.promptCard}>
          <Text style={[type.eyebrow, { color: ACCENT }]}>Who’s most likely to…</Text>
          <Text style={styles.promptText}>{prompt?.prompt_en}</Text>
        </Surface>
        <Text style={[type.bodySm, styles.hint]}>
          Someone reads it aloud. Then everyone points at the same time.
        </Text>
      </Animated.View>
    </SessionShell>
  );
}

function CountdownPhase({ session }: { session: MostLikelySession }) {
  const { dispatch, clearSession } = useMostLikelySession();
  const prompt = currentPrompt(session);
  const value = session.countdownValue;
  const enter = useEnterAnimation(0, 10);

  useEffect(() => {
    if (session.phase !== 'countdown') return;
    if (value === 3 || value === 2 || value === 1) hapticImpact('medium');
    if (value === 0) hapticSuccess();
    const id = setTimeout(() => dispatch.tickCountdown(), value === 0 ? 700 : 850);
    return () => clearTimeout(id);
  }, [session.phase, value, dispatch]);

  const label =
    value === 0 ? 'Point!' : value === null ? '' : String(value);

  return (
    <SessionShell
      eyebrow="Point together"
      stage={stageFor(session.phase)}
      stages={STAGES}
      accent={ACCENT}
      onEndGame={() => endGame(clearSession)}
    >
      <View style={styles.countdownWrap}>
        <Text style={[type.body, styles.countdownPrompt]} numberOfLines={3}>
          {prompt?.prompt_en}
        </Text>
        <Animated.View
          style={[
            styles.countdownBadge,
            enter,
            glow(ACCENT, 0.4, 28),
            { borderColor: alpha(ACCENT, 0.5) },
          ]}
        >
          <Text style={styles.countdownValue}>{label}</Text>
        </Animated.View>
      </View>
    </SessionShell>
  );
}

function DiscussPhase({ session }: { session: MostLikelySession }) {
  const { dispatch, clearSession } = useMostLikelySession();
  const prompt = currentPrompt(session);
  const last = session.index >= session.deck.length - 1;

  return (
    <SessionShell
      eyebrow="Discuss"
      stage={stageFor(session.phase)}
      stages={STAGES}
      title="Who got the most points?"
      subtitle="Argue it out. No official winner needed."
      accent={ACCENT}
      onEndGame={() => endGame(clearSession)}
      footer={
        <PrimaryButton
          label={last ? 'Finish session' : 'Next prompt'}
          icon="chevronRight"
          onPress={() => dispatch.nextPrompt()}
        />
      }
    >
      <Surface contentStyle={styles.discussCard}>
        <Text style={[type.body, styles.discussPrompt]}>{prompt?.prompt_en}</Text>
      </Surface>
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
                router.replace('/game/most_likely/setup/players');
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
        <View
          style={[
            styles.endedBadge,
            { backgroundColor: alpha(ACCENT, 0.14), borderColor: alpha(ACCENT, 0.4) },
          ]}
        >
          <Icon name="users" size={34} color={ACCENT} strokeWidth={1.8} />
        </View>
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
  switch (session.phase) {
    case 'prompt':
      return <PromptPhase session={session} />;
    case 'countdown':
      return <CountdownPhase session={session} />;
    case 'discuss':
      return <DiscussPhase session={session} />;
    case 'ended':
      return <EndedPhase session={session} />;
    default:
      return null;
  }
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
  },
  countdownWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space[8],
  },
  countdownPrompt: {
    color: color.textSecondary,
    textAlign: 'center',
    paddingHorizontal: space[2],
  },
  countdownBadge: {
    width: 168,
    height: 168,
    borderRadius: radius.pill,
    borderWidth: 1,
    backgroundColor: alpha(ACCENT, 0.16),
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdownValue: {
    color: color.textPrimary,
    fontFamily: family.display.black,
    fontSize: 64,
    lineHeight: 68,
  },
  discussCard: {
    padding: space[5],
  },
  discussPrompt: {
    color: color.textPrimary,
    fontSize: 20,
    lineHeight: 30,
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
