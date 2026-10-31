import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Animated, Image, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GAME_ART, HERO_HOME, WORDMARK } from '../src/components/brand/gameArt';
import { GameCard } from '../src/components/ui/GameCard';
import { Icon, type IconName } from '../src/components/ui/Icon';
import { PressableScale } from '../src/components/ui/PressableScale';
import { IconButton, Screen } from '../src/components/ui/Screen';
import { GAMES, getGame, type GameCatalogEntry, type GameId } from '../src/domain/games';
import { useT } from '../src/i18n';
import { loadLastPlayedGame } from '../src/storage/lastPlayedGame';
import { loadLastPlayerGroup } from '../src/storage/players';
import { useEnterAnimation } from '../src/theme/motion';
import { alpha, color, glow, mix, overlay, radius, space } from '../src/theme/tokens';
import { family } from '../src/theme/typography';

const GUTTER = space[4];
const WORDMARK_WIDTH = 190;
/** About 40% of a phone screen: room for the logo, the cast, and the moon. */
const HERO_RATIO = 0.86;
const HERO_MAX_HEIGHT = 380;
/** Share of the crop taken from the top (the rest from the table below). */
const HERO_TOP_CROP = 0.6;
/** How far the feature row rides up over the foot of the scene. */
const FEATURE_OVERLAP = 64;

/**
 * Grid rhythm: a wide card, then pairs, with warm accents (Liar, Taboo,
 * Bomb) never side by side or stacked on each other.
 */
const ROWS: GameId[][] = [
  ['impostor'],
  ['whos_the_liar', 'gimbar'],
  ['would_you_rather', 'insider'],
  // Bomb takes the wide slot: its long name and wide fuse scene suit it.
  ['bomb'],
  ['mizan', 'quiz'],
  ['taboo', 'man_negn'],
  ['wink_killer'],
  ['most_likely', 'mesob'],
];

function gridRows(): GameCatalogEntry[][] {
  const rows = ROWS.map((row) =>
    row.map((id) => getGame(id)).filter((game): game is GameCatalogEntry => !!game),
  );
  // Anything added to the catalog later still shows up, in pairs at the end.
  const listed = new Set(ROWS.flat());
  const rest = GAMES.filter((game) => !listed.has(game.id));
  for (let i = 0; i < rest.length; i += 2) rows.push(rest.slice(i, i + 2));
  return rows.filter((row) => row.length > 0);
}

/** One game per day, never the card that already opens the grid. */
function tonightsPick(): GameCatalogEntry {
  const pool = GAMES.filter((game) => game.playable && game.id !== ROWS[0]![0]);
  const now = new Date();
  const day = Math.floor((now.getTime() - now.getTimezoneOffset() * 60_000) / 86_400_000);
  return pool[day % pool.length] ?? GAMES[0];
}

export default function HomeScreen() {
  const { t, uiFont } = useT();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const enter = useEnterAnimation(0, 16);
  const rows = useMemo(gridRows, []);
  const pick = useMemo(tonightsPick, []);
  const [lastGame, setLastGame] = useState<GameCatalogEntry | null>(null);
  const [playerCount, setPlayerCount] = useState(0);
  const font = uiFont ? { fontFamily: uiFont } : null;

  useFocusEffect(
    useCallback(() => {
      let active = true;
      void loadLastPlayedGame().then((last) => {
        if (!active) return;
        setLastGame(last ? getGame(last.gameId) ?? null : null);
      });
      void loadLastPlayerGroup().then((group) => {
        if (active) setPlayerCount(group?.length ?? 0);
      });
      return () => {
        active = false;
      };
    }, []),
  );

  const imageHeight = width / HERO_HOME.aspect;
  const heroHeight = Math.min(width * HERO_RATIO, HERO_MAX_HEIGHT, imageHeight);
  const heroOffset = -(imageHeight - heroHeight) * HERO_TOP_CROP;
  let cardIndex = 1;

  return (
    // Both edges by hand: the scene runs under the status bar.
    <Screen edges={[]} accent={color.brandPrimary}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + space[8] }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.hero, { height: heroHeight }]}>
          <Image
            source={HERO_HOME.source}
            style={{ width, height: imageHeight, marginTop: heroOffset }}
            resizeMode="cover"
            accessibilityElementsHidden
          />
          {/* Status bar, logo and icons stay legible over the lamp. */}
          <LinearGradient
            colors={[alpha(color.void, 0.7), alpha(color.void, 0.25), alpha(color.void, 0)]}
            locations={[0, 0.5, 1]}
            style={styles.heroTopScrim}
          />
          <LinearGradient
            colors={[alpha(color.background, 0), alpha(color.background, 0.85), color.background]}
            locations={[0, 0.65, 1]}
            style={styles.heroBottomFade}
          />

          <Animated.View style={[styles.header, { paddingTop: insets.top + space[2] }, enter]}>
            <View style={styles.brand}>
              <Image
                source={WORDMARK.source}
                style={styles.wordmark}
                resizeMode="contain"
                accessible
                accessibilityRole="header"
                accessibilityLabel="Chereka Chewata"
              />
              <Text style={[styles.tagline, font]}>{t('home.tagline')}</Text>
            </View>
            <View style={styles.headerActions}>
              <View>
                <IconButton
                  name="users"
                  label={
                    playerCount ? `${t('players.eyebrow')}, ${playerCount}` : t('players.eyebrow')
                  }
                  onPress={() => router.push('/players')}
                />
                {playerCount ? (
                  <View style={styles.badge} pointerEvents="none">
                    <Text style={styles.badgeText}>{playerCount}</Text>
                  </View>
                ) : null}
              </View>
              <IconButton
                name="settings"
                label={t('common.settings')}
                onPress={() => router.push('/settings')}
              />
            </View>
          </Animated.View>
        </View>

        <View style={styles.body}>
          {lastGame ? (
            <FeatureRow
              game={lastGame}
              eyebrow={t('home.playAgain')}
              icon="refresh"
              actionLabel={t('home.play')}
              onPress={() => router.push(`/game/${lastGame.id}/setup/review`)}
            />
          ) : (
            <FeatureRow
              game={pick}
              eyebrow={t('home.tonightsPick')}
              icon={pick.icon}
              actionLabel={t('home.play')}
              onPress={() => router.push(`/game/${pick.id}`)}
            />
          )}

          <View style={styles.sectionHead}>
            <Text style={[styles.sectionLabel, font]}>
              {t('home.allGames')} · {GAMES.length}
            </Text>
            <View style={styles.rule} />
          </View>

          {rows.map((row) =>
            row.length === 1 ? (
              <GameCard
                key={row[0]!.id}
                variant="wide"
                game={row[0]!}
                index={cardIndex++}
                onPress={() => router.push(`/game/${row[0]!.id}`)}
              />
            ) : (
              <View key={row.map((game) => game.id).join('-')} style={styles.row}>
                {row.map((game) => (
                  <GameCard
                    key={game.id}
                    variant="half"
                    game={game}
                    index={cardIndex++}
                    onPress={() => router.push(`/game/${game.id}`)}
                  />
                ))}
              </View>
            ),
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}

type FeatureRowProps = {
  game: GameCatalogEntry;
  eyebrow: string;
  icon: IconName;
  actionLabel: string;
  onPress: () => void;
};

/**
 * Slim "pick up where you left off" row. It replaces the big feature card,
 * which repeated a scene the grid already shows.
 */
function FeatureRow({ game, eyebrow, icon, actionLabel, onPress }: FeatureRowProps) {
  const accent = game.accent;
  const art = GAME_ART[game.id]?.half ?? GAME_ART[game.id]?.wide;
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={`${eyebrow}: ${game.name}. ${game.playerCountLabel}, ${game.sessionLengthLabel}`}
      onPress={onPress}
      haptic="medium"
      scaleTo={0.98}
      style={[
        styles.feature,
        {
          // Warm surface with a touch of the game colour — not a grey slab.
          backgroundColor: mix(color.surface, accent, 0.14),
          borderColor: alpha(accent, 0.35),
          borderTopColor: alpha(accent, 0.6),
        },
        glow(accent, 0.3, 20),
      ]}
    >
      <View style={[styles.featureThumb, { borderColor: alpha(accent, 0.5) }]}>
        {art ? (
          <Image source={art.source} style={styles.featureThumbImage} resizeMode="cover" />
        ) : (
          <Icon name={icon} size={22} color={accent} strokeWidth={2.1} />
        )}
        {art ? (
          <View style={[styles.featureThumbBadge, { backgroundColor: accent }]}>
            <Icon name={icon} size={11} color={color.void} strokeWidth={2.6} />
          </View>
        ) : null}
      </View>
      <View style={styles.featureCopy}>
        <Text style={[styles.featureEyebrow, { color: accent }]}>{eyebrow}</Text>
        <Text style={styles.featureTitle} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
          {game.name}
        </Text>
        <View style={styles.featureMeta}>
          <Icon name="users" size={13} color={color.textSecondary} />
          <Text style={styles.featureMetaText}>{game.playerCountLabel}</Text>
          <Icon name="clock" size={13} color={color.textSecondary} />
          <Text style={styles.featureMetaText}>{game.sessionLengthLabel}</Text>
        </View>
      </View>
      <View style={styles.featureAction}>
        <Text style={styles.featureActionText}>{actionLabel}</Text>
        <Icon name="chevronRight" size={16} color={color.void} strokeWidth={2.6} />
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
  },
  hero: {
    width: '100%',
    overflow: 'hidden',
  },
  heroTopScrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 230,
  },
  heroBottomFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 150,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: GUTTER,
  },
  brand: {
    flex: 1,
    gap: space[1],
  },
  wordmark: {
    width: WORDMARK_WIDTH,
    height: WORDMARK_WIDTH / WORDMARK.aspect,
    marginLeft: -space[2],
  },
  tagline: {
    color: color.textPrimary,
    fontFamily: family.grotesque.medium,
    fontSize: 15,
    lineHeight: 20,
    textShadowColor: alpha(color.void, 0.8),
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8,
  },
  headerActions: {
    flexDirection: 'row',
    gap: space[2],
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 5,
    borderRadius: radius.pill,
    backgroundColor: color.brandPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: color.void,
    fontFamily: family.grotesque.bold,
    fontSize: 11,
    lineHeight: 14,
  },
  body: {
    paddingHorizontal: GUTTER,
    marginTop: -FEATURE_OVERLAP,
    gap: space[3],
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    padding: space[3],
    borderRadius: radius.large,
    borderWidth: 1,
  },
  featureThumb: {
    width: 56,
    height: 56,
    borderRadius: radius.medium,
    borderWidth: 1.5,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: color.surfaceRaised,
  },
  featureThumbImage: {
    width: '100%',
    height: '100%',
  },
  featureThumbBadge: {
    position: 'absolute',
    right: 3,
    bottom: 3,
    width: 18,
    height: 18,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureCopy: {
    flex: 1,
    gap: 2,
  },
  featureEyebrow: {
    fontFamily: family.grotesque.semibold,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
  },
  featureTitle: {
    color: color.textPrimary,
    fontFamily: family.grotesque.bold,
    fontSize: 19,
    lineHeight: 24,
  },
  featureMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  featureMetaText: {
    color: color.textSecondary,
    fontFamily: family.grotesque.medium,
    fontSize: 12,
    lineHeight: 16,
    marginRight: space[2],
  },
  featureAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    height: 40,
    paddingLeft: space[4],
    paddingRight: space[3],
    borderRadius: radius.pill,
    backgroundColor: color.brandPrimary,
  },
  featureActionText: {
    color: color.void,
    fontFamily: family.grotesque.bold,
    fontSize: 15,
    lineHeight: 20,
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    marginTop: space[4],
    marginBottom: space[1],
  },
  sectionLabel: {
    color: color.textSecondary,
    fontFamily: family.grotesque.semibold,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  rule: {
    flex: 1,
    height: 1,
    backgroundColor: overlay.hairline,
  },
  row: {
    flexDirection: 'row',
    gap: space[3],
  },
});
