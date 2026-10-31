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
import { Pill } from '../../../src/components/ui/Chip';
import { StatChip } from '../../../src/components/ui/GameCard';
import { PrimaryButton } from '../../../src/components/ui/PrimaryButton';
import { IconButton, Screen } from '../../../src/components/ui/Screen';
import { getGame, type GameCatalogEntry } from '../../../src/domain/games';
import { getHowToPlay } from '../../../src/domain/howToPlay';
import { useGameSetup } from '../../../src/domain/useGameSetup';
import { useEnterAnimation } from '../../../src/theme/motion';
import { alpha, color, mix, radius, space } from '../../../src/theme/tokens';
import { family, type } from '../../../src/theme/typography';
import { GlyphDisk } from '../../../src/components/ui/GlyphDisk';
import { Icon } from '../../../src/components/ui/Icon';

/** Tall enough that the scene reads as a place, not a thumbnail. */
const HERO_HEIGHT = 340;

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

  const steps = getHowToPlay(game.id);
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
            <Icon name="lock" size={20} color={color.textMuted} />
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
          <GlyphDisk icon={game.icon} accent={game.accent} size={128} />
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
