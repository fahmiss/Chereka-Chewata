import { router, useLocalSearchParams } from 'expo-router';
import { lazy, Suspense, useEffect, useRef, type ReactNode } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
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
import { useGimbarSession } from '../../src/domain/gimbar/context';
import { useInsiderSession } from '../../src/domain/insider/context';
import { useMesobSession } from '../../src/domain/mesob/context';
import { useMizanSession } from '../../src/domain/mizan/context';
import { useWinkKillerSession } from '../../src/domain/winkKiller/context';
import type { GameId } from '../../src/domain/games';
import { useT } from '../../src/i18n';
import { saveLastPlayedGame } from '../../src/storage/lastPlayedGame';
import { SOUND_VOLUME } from '../../src/theme/soundLevels';
import { alpha, color, radius, space } from '../../src/theme/tokens';
import { useSoundEffect } from '../../src/theme/useSoundEffect';
import { type } from '../../src/theme/typography';
import { BRAND_MARK } from '../../src/components/brand/gameArt';

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

const GimbarSessionView = lazy(() =>
  import('../../src/components/gimbar/GimbarSessionView').then((module) => ({
    default: module.GimbarSessionView,
  })),
);
const MesobSessionView = lazy(() =>
  import('../../src/components/mesob/MesobSessionView').then((module) => ({
    default: module.MesobSessionView,
  })),
);
const MizanSessionView = lazy(() =>
  import('../../src/components/mizan/MizanSessionView').then((module) => ({
    default: module.MizanSessionView,
  })),
);
const WinkKillerSessionView = lazy(() =>
  import('../../src/components/winkKiller/WinkKillerSessionView').then((module) => ({
    default: module.WinkKillerSessionView,
  })),
);
const InsiderSessionView = lazy(() =>
  import('../../src/components/insider/InsiderSessionView').then((module) => ({
    default: module.InsiderSessionView,
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
  gimbar: [
    'The guesser holds the phone sideways on their forehead, screen facing the room.',
    'Everyone else acts, hums and describes the card without saying it.',
    'Tilt down (or tap right) for got it, tilt up (or tap left) to pass. Most cards wins.',
  ],
  mesob: [
    'Everyone secretly writes slips for the mesob. Two teams take timed turns.',
    'Round 1: describe freely. Round 2: one word only. Round 3: act it out, no sounds.',
    'The same slips come back every round. Most slips guessed over three rounds wins.',
  ],
  mizan: [
    'Two opposites sit on a dial, like Mild ← → Spicy. Only the psychic sees the hidden target.',
    'The psychic says one clue for that spot, e.g. “Grandma’s mitmita” for near Spicy.',
    'Guessers drag the needle; closer earns 4, 3 or 2. In Teams, the other side can steal 1 by calling left or right.',
  ],
  wink_killer: [
    'Everyone secretly checks their role. One player is the Killer.',
    'The Killer winks at victims; a winked player counts to five, then falls.',
    'Accuse the Killer to win. A wrong accuser is out. With a Detective, only they accuse.',
  ],
  insider: [
    'The Master knows the word and answers only Yes, No or I don’t know.',
    'Find the word with yes/no questions before time runs out, or everyone loses.',
    'Then vote: one player secretly knew the word all along. Catch the Insider.',
  ],
};

/**
 * A short motif that opens each game, so every game is recognisable by ear.
 * Impostor stays silent by design (playtested: quiet reveals read better).
 */
const SIGNATURE_SOUNDS: Partial<Record<GameId, number>> = {
  whos_the_liar: require('../../assets/sounds/signature-whos-the-liar.wav'),
  taboo: require('../../assets/sounds/signature-taboo.wav'),
  most_likely: require('../../assets/sounds/signature-most-likely.wav'),
  bomb: require('../../assets/sounds/signature-bomb.wav'),
  would_you_rather: require('../../assets/sounds/signature-would-you-rather.wav'),
  quiz: require('../../assets/sounds/signature-quiz.wav'),
  gimbar: require('../../assets/sounds/signature-gimbar.wav'),
  mesob: require('../../assets/sounds/signature-mesob.wav'),
  mizan: require('../../assets/sounds/signature-mizan.wav'),
  wink_killer: require('../../assets/sounds/signature-wink-killer.wav'),
  insider: require('../../assets/sounds/signature-insider.wav'),
};

/** Plays the game's signature once per session (restarts get it again). */
function SignatureCue({ source }: { source: number }) {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const play = useSoundEffect(source, SOUND_VOLUME.cue);
  const playedFor = useRef<string | null>(null);

  useEffect(() => {
    if (playedFor.current === sessionId) return;
    playedFor.current = sessionId;
    play();
  }, [play, sessionId]);

  return null;
}

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

  const signature = SIGNATURE_SOUNDS[gameId];
  return (
    <SessionControlsProvider rules={SESSION_RULES[gameId]} onRestartRound={restart}>
      {signature ? <SignatureCue source={signature} /> : null}
      <Suspense fallback={<SessionLoading />}>{child}</Suspense>
    </SessionControlsProvider>
  );
}

function SessionLoading() {
  return (
    <Screen accent={color.brandPrimary} style={styles.loading}>
      <Image source={BRAND_MARK.source} style={{ width: 96, height: 96 }} resizeMode="contain" />
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
  const gimbar = useGimbarSession();
  const mesob = useMesobSession();
  const mizan = useMizanSession();
  const winkKiller = useWinkKillerSession();
  const insider = useInsiderSession();
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
  if (gimbar.session && gimbar.session.sessionId === sessionId) {
    return withSessionControls(
      'gimbar',
      gimbar.session.setup,
      gimbar.startSession,
      <GimbarSessionView session={gimbar.session} />,
    );
  }
  if (mesob.session && mesob.session.sessionId === sessionId) {
    return withSessionControls(
      'mesob',
      mesob.session.setup,
      mesob.startSession,
      <MesobSessionView session={mesob.session} />,
    );
  }
  if (mizan.session && mizan.session.sessionId === sessionId) {
    return withSessionControls(
      'mizan',
      mizan.session.setup,
      mizan.startSession,
      <MizanSessionView session={mizan.session} />,
    );
  }
  if (winkKiller.session && winkKiller.session.sessionId === sessionId) {
    return withSessionControls(
      'wink_killer',
      winkKiller.session.setup,
      winkKiller.startSession,
      <WinkKillerSessionView session={winkKiller.session} />,
    );
  }
  if (insider.session && insider.session.sessionId === sessionId) {
    return withSessionControls(
      'insider',
      insider.session.setup,
      insider.startSession,
      <InsiderSessionView session={insider.session} />,
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
          gimbar.clearSession();
          mesob.clearSession();
          mizan.clearSession();
          winkKiller.clearSession();
          insider.clearSession();
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
