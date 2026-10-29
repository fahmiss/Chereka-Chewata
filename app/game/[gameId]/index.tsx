import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import {
  Animated,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GAME_ART } from '../../../src/components/brand/gameArt';
import { GAME_MOON_EXPRESSION } from '../../../src/components/brand/gameMoonExpression';
import { MoonFace } from '../../../src/components/brand/MoonFace';
import { Pill } from '../../../src/components/ui/Chip';
import { StatChip } from '../../../src/components/ui/GameCard';
import { PrimaryButton } from '../../../src/components/ui/PrimaryButton';
import { IconButton, Screen } from '../../../src/components/ui/Screen';
import { getGame, type GameCatalogEntry } from '../../../src/domain/games';
import { useGameSetup } from '../../../src/domain/useGameSetup';
import { useEnterAnimation } from '../../../src/theme/motion';
import { alpha, color, mix, radius, space } from '../../../src/theme/tokens';
import { family, type } from '../../../src/theme/typography';

/** Tall enough that the scene reads as a place, not a thumbnail. */
const HERO_HEIGHT = 340;

const STEPS: Record<string, string[]> = {
  impostor: [
    'Everyone sees the same secret word — except the Impostor.',
    'Take turns giving one short clue. Never say the word.',
    'Argue, vote, then let a caught Impostor guess the word.',
  ],
  whos_the_liar: [
    'Everyone gets a question privately — one player got a different one.',
    'Answer aloud in order. Do not read your question out loud.',
    'Argue it out, then tap who the group thinks is the Liar.',
  ],
  taboo: [
    'Split into two teams. One describer sees the word and the forbidden list.',
    'Get teammates to guess before time runs out — without saying banned words.',
    'Correct +1, violation −1. First team to the target score wins.',
  ],
  most_likely: [
    'Read a “Who is most likely to…” prompt aloud.',
    'Countdown together — then everyone points at once.',
    'Laugh, argue, next prompt. No scores required.',
  ],
  would_you_rather: [
    'Read both choices out loud. No neutral answers allowed.',
    'Argue it out — everyone has to defend a side.',
    'Tap the one the room agreed on, then move to the next dilemma.',
  ],
  bomb: [
    'Read the category and start the hidden fuse.',
    'Say a new valid answer, then immediately pass the phone to the next player.',
    'Whoever holds the phone when it explodes loses the round.',
  ],
  quiz: [
    'Choose Pass & Play for quick no-score trivia, or Compete for named players and points.',
    'Pick one of four answers, then reveal the correct choice and explanation.',
    'Pass the phone between casual questions, or follow round-robin turns to a leaderboard.',
  ],
  gimbar: [
    'The guesser holds the phone sideways on their forehead, screen facing the room.',
    'Everyone else acts, hums and describes the word on screen — just never says it.',
    'Tilt down when you get it, tilt up to pass. Every player takes a turn; most cards wins.',
  ],
  mesob: [
    'Everyone secretly drops a few names or things into the mesob. Then split into two teams.',
    'Round 1: describe freely. Round 2: one word only. Round 3: act it out in silence.',
    'The same slips return every round, so jokes build. Most slips guessed wins.',
  ],
  mizan: [
    'Each round shows two opposites on a dial, like Mild ← → Spicy. A hidden target sits somewhere between them.',
    'Only the psychic sees where. If it sits near Spicy, they might say one clue: “Grandma’s mitmita.”',
    'Everyone else drags the needle to where they think the target is. Closer scores more: 4, 3 or 2.',
  ],
  wink_killer: [
    'The phone secretly deals roles. One player is the Killer.',
    'The Killer winks at victims; when winked, count to five, then fall dramatically.',
    'Think you saw it? Accuse. Catch the Killer before they clear the room.',
  ],
  insider: [
    'The Master knows the secret word and answers only Yes, No or I don’t know.',
    'Find the word together with yes/no questions before the clock runs out.',
    'One player knew the word all along. Vote to catch the Insider.',
  ],
};

export default function GameDetailsScreen() {
  const { gameId } = useLocalSearchParams<{ gameId: string }>();
  const game = getGame(String(gameId));
  const enter = useEnterAnimation(0, 16);
  const insets = useSafeAreaInsets();
  const { useLastGroup: seatSavedPlayers } = useGameSetup(String(gameId));

  // The Players tab is the table: opening a game seats that group. Games
  // that need more players than are saved keep their defaults.
  useEffect(() => {
    void seatSavedPlayers();
  }, [gameId]);

  if (!game) {
    return (
      <Screen style={styles.notFound}>
        <Text style={[type.displayMd, styles.title]}>Game not found</Text>
        <PrimaryButton label="Back home" icon="home" onPress={() => router.replace('/home')} />
      </Screen>
    );
  }

  const steps = STEPS[game.id] ?? null;
  const ground = mix(color.background, game.accent, 0.14);
  const returnToGames = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/home');
  };

  return (
    // Both edges are handled by hand: the scene runs under the status bar and
    // the floating footer clears the home indicator itself.
    <Screen accent={game.accent} edges={[]} style={{ backgroundColor: ground }}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Hero game={game} ground={ground} />

        <Animated.View style={[styles.intro, enter]}>
          <Text style={styles.title} accessibilityRole="header">
            {game.name}
          </Text>
          <Text style={[type.body, styles.tagline]}>{game.tagline}</Text>
          <View style={styles.metaRow}>
            {game.playable ? (
              <>
                <StatChip icon="users" label={game.playerCountLabel} />
                <StatChip icon="clock" label={game.sessionLengthLabel} />
              </>
            ) : (
              <Pill label="Soon" tint={color.textMuted} icon="lock" />
            )}
          </View>
        </Animated.View>

        <View style={styles.steps}>
          <Text style={[type.eyebrow, { color: game.accent }]}>How to play</Text>
          {steps ? (
            steps.map((step, index) => (
              <View
                key={step}
                style={[
                  styles.step,
                  {
                    borderColor: alpha(game.accent, 0.16),
                    backgroundColor: alpha(game.accent, 0.06),
                  },
                ]}
              >
                <View
                  style={[
                    styles.stepNumber,
                    {
                      backgroundColor: alpha(game.accent, 0.18),
                      borderColor: alpha(game.accent, 0.5),
                    },
                  ]}
                >
                  <Text style={[styles.stepNumberText, { color: game.accent }]}>{index + 1}</Text>
                </View>
                <Text style={[type.body, styles.stepText]}>{step}</Text>
              </View>
            ))
          ) : (
            <Text style={[type.body, styles.stepText]}>
              Full rules unlock when this game ships.
            </Text>
          )}
        </View>
      </ScrollView>

      <View style={[styles.back, { top: insets.top + space[2] }]}>
        <IconButton name="arrowLeft" label="Back to games" onPress={returnToGames} />
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + space[3] }]}>
        <LinearGradient
          pointerEvents="none"
          colors={[alpha(ground, 0), ground]}
          style={styles.footerFade}
        />
        {game.playable ? (
          <PrimaryButton
            label={`Play ${game.name}`}
            // Every game opens on its ready-to-play overview — defaults are
            // already playable, so setup is opt-in rather than a journey.
            onPress={() =>
              router.push(
                game.id === 'quiz' ? `/game/${game.id}/mode` : `/game/${game.id}/setup/review`,
              )
            }
          />
        ) : (
          <View style={styles.soonBox}>
            <MoonFace expression="comingSoon" size={48} />
            <Text style={[type.button, styles.soonLabel]}>Coming soon</Text>
          </View>
        )}
      </View>
    </Screen>
  );
}

/**
 * The card's scene, opened up: full-bleed, pinned right so the action stays
 * in frame, dissolving into the game-tinted ground. Games without art keep
 * their mascot on a coloured halo.
 */
function Hero({ game, ground }: { game: GameCatalogEntry; ground: string }) {
  const { width } = useWindowDimensions();
  const art = GAME_ART[game.id]?.wide ?? GAME_ART[game.id]?.half;

  return (
    <View style={[styles.hero, { height: HERO_HEIGHT }]} accessibilityElementsHidden>
      {art ? (
        <Image
          source={art.source}
          resizeMode="cover"
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            height: HERO_HEIGHT,
            width: Math.max(width, HERO_HEIGHT * art.aspect),
          }}
        />
      ) : (
        <View style={styles.heroMascot}>
          <View style={[styles.heroHalo, { backgroundColor: alpha(game.accent, 0.2) }]} />
          <MoonFace expression={GAME_MOON_EXPRESSION[game.id]} size={140} />
        </View>
      )}
      {/* Status bar and back button stay legible over bright scenes. */}
      <LinearGradient
        colors={[alpha(color.void, 0.6), alpha(color.void, 0)]}
        style={styles.heroTopScrim}
      />
      <LinearGradient
        colors={[alpha(ground, 0), alpha(ground, 0.7), ground]}
        locations={[0, 0.6, 1]}
        style={styles.heroBottomFade}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  notFound: {
    paddingHorizontal: space[6],
    justifyContent: 'center',
    gap: space[5],
  },
  content: {
    paddingBottom: 120,
    gap: space[8],
  },
  hero: {
    width: '100%',
    overflow: 'hidden',
  },
  heroMascot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: space[10],
  },
  heroHalo: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: radius.pill,
    marginTop: space[10],
  },
  heroTopScrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  heroBottomFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 170,
  },
  intro: {
    // Pull the title up into the faded foot of the scene.
    marginTop: -88,
    paddingHorizontal: space[4],
    gap: space[3],
  },
  title: {
    color: color.textPrimary,
    fontFamily: family.brush.regular,
    fontSize: 40,
    lineHeight: 46,
    textTransform: 'uppercase',
    // Knewave leans right; the slack keeps the last glyph from clipping.
    paddingRight: 6,
    textShadowColor: alpha(color.void, 0.7),
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 12,
  },
  tagline: {
    color: color.textSecondary,
    fontSize: 17,
    lineHeight: 25,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space[2],
    paddingTop: space[1],
  },
  steps: {
    paddingHorizontal: space[4],
    gap: space[3],
  },
  step: {
    flexDirection: 'row',
    gap: space[3],
    alignItems: 'flex-start',
    padding: space[4],
    borderRadius: radius.medium,
    borderWidth: 1,
  },
  stepNumber: {
    width: 30,
    height: 30,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontFamily: family.grotesque.bold,
    fontSize: 15,
    lineHeight: 18,
  },
  stepText: {
    color: color.textPrimary,
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    paddingTop: 2,
  },
  back: {
    position: 'absolute',
    left: space[4],
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: space[4],
    paddingTop: space[6],
  },
  footerFade: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  soonBox: {
    flexDirection: 'row',
    gap: space[2],
    minHeight: 56,
    borderRadius: radius.medium,
    borderWidth: 1,
    borderColor: color.borderSubtle,
    backgroundColor: color.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  soonLabel: {
    color: color.textMuted,
  },
});
