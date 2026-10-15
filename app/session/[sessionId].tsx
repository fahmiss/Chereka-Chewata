import { router, useLocalSearchParams } from 'expo-router';
import { lazy, Suspense, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MoonFace } from '../../src/components/brand/MoonFace';
import { SessionControlsProvider } from '../../src/components/session/SessionControlsContext';
import { Icon } from '../../src/components/ui/Icon';
import { PrimaryButton } from '../../src/components/ui/PrimaryButton';
import { Screen } from '../../src/components/ui/Screen';
import { useBombSession } from '../../src/domain/bomb/SessionContext';
import { useSession } from '../../src/domain/impostor/SessionContext';
import { useLiarSession } from '../../src/domain/liar/SessionContext';
import { useMostLikelySession } from '../../src/domain/mostLikely/SessionContext';
import { useTabooSession } from '../../src/domain/taboo/SessionContext';
import { useWouldRatherSession } from '../../src/domain/wouldRather/SessionContext';
import { useQuizSession } from '../../src/domain/quiz/SessionContext';
import type { GameId } from '../../src/domain/games';
import { useT } from '../../src/i18n';
import { saveLastPlayedGame } from '../../src/storage/lastPlayedGame';
import { alpha, color, radius, space } from '../../src/theme/tokens';
import { type } from '../../src/theme/typography';

const BombSessionView = lazy(() =>
  import('../../src/components/bomb/BombSessionView').then((module) => ({
    default: module.BombSessionView,
  })),
);
const ImpostorSessionView = lazy(() =>
  import('../../src/components/impostor/ImpostorSessionView').then((module) => ({
    default: module.ImpostorSessionView,
  })),
);
const LiarSessionView = lazy(() =>
  import('../../src/components/liar/LiarSessionView').then((module) => ({
    default: module.LiarSessionView,
  })),
);
const MostLikelySessionView = lazy(() =>
  import('../../src/components/mostLikely/MostLikelySessionView').then((module) => ({
    default: module.MostLikelySessionView,
  })),
);
const TabooSessionView = lazy(() =>
  import('../../src/components/taboo/TabooSessionView').then((module) => ({
    default: module.TabooSessionView,
  })),
);
const WouldRatherSessionView = lazy(() =>
  import('../../src/components/wouldRather/WouldRatherSessionView').then((module) => ({
    default: module.WouldRatherSessionView,
  })),
);
const QuizSessionView = lazy(() =>
  import('../../src/components/quiz/QuizSessionView').then((module) => ({
    default: module.QuizSessionView,
  })),
);

const SESSION_RULES: Record<GameId, string[]> = {
  impostor: [
    'Everyone sees the same secret word except the Impostor.',
    'Give one short clue each without saying, spelling, or translating the word.',
    'Discuss and accuse one player. A caught Impostor gets one final guess.',
  ],
  whos_the_liar: [
    'Most players see one question; the Liar sees a different one.',
    'Answer briefly without repeating or revealing the question.',
    'Discuss, accuse one player, then reveal both questions.',
  ],
  taboo: [
    'Describe the target without saying any forbidden word.',
    'Mark Correct, Skip, or Violation before moving to the next card.',
    'Teams alternate equal turns; the first team to the target score wins.',
  ],
  most_likely: [
    'Read the prompt aloud.',
    'On POINT, everyone points to one person at the same time.',
    'Discuss the choice, then continue to the next prompt.',
  ],
  would_you_rather: [
    'Read both options aloud.',
    'Everyone chooses a side before the group reveals its answer.',
    'Defend the choice, debate, then continue.',
  ],
  bomb: [
    'Read the category, give one valid answer, and pass the phone.',
    'Do not repeat an answer already used in the round.',
    'The player holding the phone when the hidden fuse explodes loses the round.',
  ],
  quiz: [
    'Choose one of four answers before revealing the result.',
    'Pass & Play is casual; Compete rotates named players and keeps score.',
    'Read the explanation, then continue to the next question.',
  ],
};

type StartResult = { session: { sessionId: string } } | { error: string };

function withSessionControls<TSetup>(
  gameId: GameId,
  setup: TSetup,
  startSession: (setup: TSetup) => StartResult,
  child: ReactNode,
) {
  const restart = () => {
    const result = startSession(setup);
    if ('error' in result) return;
    void saveLastPlayedGame(gameId);
    router.replace(`/session/${result.session.sessionId}`);
  };

  return (
    <SessionControlsProvider rules={SESSION_RULES[gameId]} onRestartRound={restart}>
      <Suspense fallback={<SessionLoading />}>{child}</Suspense>
    </SessionControlsProvider>
  );
}

function SessionLoading() {
  return (
    <Screen accent={color.brandPrimary} style={styles.loading}>
      <MoonFace expression="loading" size={96} />
    </Screen>
  );
}

export default function SessionScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const impostor = useSession();
  const liar = useLiarSession();
  const taboo = useTabooSession();
  const mostLikely = useMostLikelySession();
  const wouldRather = useWouldRatherSession();
  const bomb = useBombSession();
  const quiz = useQuizSession();
  const { t, uiFont } = useT();
  const font = uiFont ? { fontFamily: uiFont } : null;

  if (impostor.session && impostor.session.sessionId === sessionId) {
    return withSessionControls(
      'impostor',
      impostor.session.setup,
      impostor.startSession,
      <ImpostorSessionView session={impostor.session} />,
    );
  }

  if (liar.session && liar.session.sessionId === sessionId) {
    return withSessionControls(
      'whos_the_liar',
      liar.session.setup,
      liar.startSession,
      <LiarSessionView session={liar.session} />,
    );
  }

  if (taboo.session && taboo.session.sessionId === sessionId) {
    return withSessionControls(
      'taboo',
      taboo.session.setup,
      taboo.startSession,
      <TabooSessionView session={taboo.session} />,
    );
  }

  if (mostLikely.session && mostLikely.session.sessionId === sessionId) {
    return withSessionControls(
      'most_likely',
      mostLikely.session.setup,
      mostLikely.startSession,
      <MostLikelySessionView session={mostLikely.session} />,
    );
  }
  if (wouldRather.session && wouldRather.session.sessionId === sessionId) {
    return withSessionControls(
      'would_you_rather',
      wouldRather.session.setup,
      wouldRather.startSession,
      <WouldRatherSessionView session={wouldRather.session} />,
    );
  }
  if (bomb.session && bomb.session.sessionId === sessionId) {
    return withSessionControls(
      'bomb',
      bomb.session.setup,
      bomb.startSession,
      <BombSessionView session={bomb.session} />,
    );
  }
  if (quiz.session && quiz.session.sessionId === sessionId) {
    return withSessionControls(
      'quiz',
      quiz.session.setup,
      quiz.startSession,
      <QuizSessionView session={quiz.session} />,
    );
  }

  return (
    <Screen accent={color.brandPrimary} style={styles.fallback}>
      <View style={styles.badge}>
        <Icon name="lock" size={26} color={color.brandPrimary} strokeWidth={1.8} />
      </View>
      <Text style={[type.displayMd, styles.title, font]}>{t('session.unavailableTitle')}</Text>
      <Text style={[type.body, styles.body, font]}>{t('session.unavailableBody')}</Text>
      <PrimaryButton
        label={t('game.backHome')}
        icon="home"
        onPress={() => {
          impostor.clearSession();
          liar.clearSession();
          taboo.clearSession();
          mostLikely.clearSession();
          wouldRather.clearSession();
          bomb.clearSession();
          quiz.clearSession();
          router.replace('/home');
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  loading: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallback: {
    paddingHorizontal: space[6],
    justifyContent: 'center',
    gap: space[4],
  },
  badge: {
    width: 64,
    height: 64,
    borderRadius: radius.medium,
    borderWidth: 1,
    borderColor: alpha(color.brandPrimary, 0.35),
    backgroundColor: alpha(color.brandPrimary, 0.14),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space[2],
  },
  title: {
    color: color.textPrimary,
  },
  body: {
    color: color.textSecondary,
    marginBottom: space[2],
  },
});
