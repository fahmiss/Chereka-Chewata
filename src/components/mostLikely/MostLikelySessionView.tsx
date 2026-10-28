import { router } from 'expo-router';
import { preload } from 'expo-audio';
import { useEffect } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { localizeText } from '../../content/localize';
import { currentPrompt } from '../../domain/mostLikely/machine';
import { useMostLikelySession } from '../../domain/mostLikely/SessionContext';
import type { MostLikelySession } from '../../domain/mostLikely/types';
import { hapticImpact, hapticSuccess } from '../../theme/haptics';
import { SOUND_VOLUME } from '../../theme/soundLevels';
import { useSoundEffect } from '../../theme/useSoundEffect';
import { useEnterAnimation } from '../../theme/motion';
import { alpha, color, glow, radius, space } from '../../theme/tokens';
import { family, type } from '../../theme/typography';
import { SessionShell } from '../session/SessionShell';
import { ReportCardButton } from '../session/ReportCardButton';
import { PrimaryButton } from '../ui/PrimaryButton';
import { SecondaryButton } from '../ui/SecondaryButton';
import { Surface } from '../ui/Surface';
import { MoonFace } from '../brand/MoonFace';

const ACCENT = color.gameMostLikely;
const STAGES = ['prompt', 'point', 'discuss', 'result'] as const;
const COUNT_SOUND = require('../../../assets/sounds/most-likely-count.wav');
const POINT_SOUND = require('../../../assets/sounds/most-likely-point.wav');

void preload(COUNT_SOUND);
void preload(POINT_SOUND);

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

/** The prompt stays visible through discussion, when the room still needs it. */
function PromptCard({ session }: { session: MostLikelySession }) {
  const { dispatch, clearSession } = useMostLikelySession();
  const prompt = currentPrompt(session);
  const enter = useEnterAnimation(1, 16);
  const phase = session.phase;
  const pointed = phase === 'discuss';
  const remaining = session.deck.length - session.index;
  const last = session.index >= session.deck.length - 1;

  return (
    <SessionShell
      eyebrow={
        pointed
          ? 'Fingers up'
          : `Prompt ${session.index + 1} · ${remaining} left`
      }
      stage={stageFor(phase)}
      stages={STAGES}
      accent={ACCENT}
      onEndGame={() => endGame(clearSession)}
      // Prompt and discussion keep matching action slots, so the card does not
      // jump when everyone starts arguing.
      footer={
        <>
          <PrimaryButton
            label={
              pointed ? (last ? 'Finish session' : 'Next prompt') : 'Start countdown'
            }
            icon={pointed ? 'chevronRight' : 'users'}
            onPress={() => (pointed ? dispatch.nextPrompt() : dispatch.beginCountdown())}
          />
          <SecondaryButton
            label="Skip prompt"
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
        <Surface accent={ACCENT} active contentStyle={styles.promptCard}>
          <Text style={[type.eyebrow, { color: ACCENT }]}>Who’s most likely to…</Text>
          <Text
            style={[
              styles.promptText,
              session.contentLanguage !== 'en' ? { fontFamily: family.ethiopic.bold } : null,
            ]}
          >
            {prompt
              ? localizeText(session.contentLanguage, {
                  en: prompt.prompt_en,
                  am: prompt.prompt_am,
                })
              : ''}
          </Text>
        </Surface>

        <Text
          style={[type.bodySm, styles.hint]}
          numberOfLines={2}
        >
          {pointed
            ? 'Argue it out. No official winner needed.'
            : 'Someone reads it aloud. Then everyone points at the same time.'}
        </Text>
      </Animated.View>
    </SessionShell>
  );
}

function CountdownBeat({ value }: { value: 3 | 2 | 1 | 0 }) {
  const enter = useEnterAnimation(0, value === 0 ? 18 : 10);
  const pointNow = value === 0;

  return (
    <Animated.View style={[styles.countdownBody, enter]}>
      <View style={[styles.countdownHalo, glow(ACCENT, 0.48, 38)]}>
        <View style={styles.countdownCore}>
          <Text style={[styles.countdownValue, pointNow && styles.pointValue]}>
            {pointNow ? 'POINT!' : value}
          </Text>
        </View>
      </View>
      <Text style={[type.eyebrow, styles.countdownInstruction]}>
        {pointNow ? 'EVERYONE POINTS NOW' : 'GET READY'}
      </Text>
      <Text style={[type.body, styles.countdownHint]}>
        {pointNow ? 'Hold your choice.' : 'Choose one person. Reveal together.'}
      </Text>
    </Animated.View>
  );
}

function CountdownPrompt({ session }: { session: MostLikelySession }) {
  const prompt = currentPrompt(session);
  return (
    <Surface accent={ACCENT} active contentStyle={styles.countdownPrompt}>
      <Text style={[type.eyebrow, { color: ACCENT }]}>Who’s most likely to…</Text>
      <Text
        style={[
          styles.countdownPromptText,
          session.contentLanguage !== 'en' ? { fontFamily: family.ethiopic.bold } : null,
        ]}
      >
        {prompt
          ? localizeText(session.contentLanguage, {
              en: prompt.prompt_en,
              am: prompt.prompt_am,
            })
          : ''}
      </Text>
    </Surface>
  );
}

function CountdownPhase({ session }: { session: MostLikelySession }) {
  const { dispatch, clearSession } = useMostLikelySession();
  const value = session.countdownValue ?? 3;
  const playCount = useSoundEffect(COUNT_SOUND, SOUND_VOLUME.cue);
  const playPoint = useSoundEffect(POINT_SOUND, SOUND_VOLUME.result);

  useEffect(() => {
    if (value === 0) hapticSuccess();
    else hapticImpact('medium');

    const stopCue = value === 0 ? playPoint() : playCount();
    const id = setTimeout(() => dispatch.tickCountdown(), value === 0 ? 700 : 850);
    return () => {
      stopCue?.();
      clearTimeout(id);
    };
  }, [dispatch, playCount, playPoint, value]);

  return (
    <SessionShell
      eyebrow={value === 0 ? 'Point now' : 'Point together'}
      stage="point"
      stages={STAGES}
      accent={ACCENT}
      onEndGame={() => endGame(clearSession)}
    >
      <View style={styles.countdownLayout}>
        <CountdownPrompt session={session} />
        <CountdownBeat key={value} value={value} />
      </View>
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
  if (session.phase === 'countdown') return <CountdownPhase session={session} />;
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
    // Two lines of bodySm keep the prompt steady from reading to discussion.
    minHeight: 40,
  },
  countdownLayout: {
    flex: 1,
    justifyContent: 'space-between',
    gap: space[3],
    paddingBottom: space[2],
  },
  countdownPrompt: {
    paddingHorizontal: space[4],
    paddingVertical: space[4],
    gap: space[2],
  },
  countdownPromptText: {
    color: color.textPrimary,
    fontFamily: family.display.bold,
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.4,
  },
  countdownBody: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdownHalo: {
    width: 148,
    height: 148,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: alpha(ACCENT, 0.62),
    backgroundColor: alpha(ACCENT, 0.1),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space[3],
  },
  countdownCore: {
    width: 112,
    height: 112,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: alpha(ACCENT, 0.28),
    backgroundColor: alpha(ACCENT, 0.16),
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdownValue: {
    color: color.textPrimary,
    fontFamily: family.display.black,
    fontSize: 64,
    lineHeight: 70,
    textAlign: 'center',
  },
  pointValue: {
    color: ACCENT,
    fontSize: 28,
    lineHeight: 32,
    letterSpacing: 1,
  },
  countdownInstruction: {
    color: ACCENT,
    fontSize: 14,
    letterSpacing: 1.4,
    textAlign: 'center',
  },
  countdownHint: {
    color: color.textSecondary,
    textAlign: 'center',
    marginTop: space[2],
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
