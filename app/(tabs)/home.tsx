import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Animated, Image, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Svg, {
  Defs,
  Image as SvgImage,
  LinearGradient as SvgGradient,
  Mask,
  Rect,
  Stop,
} from 'react-native-svg';
import { GAME_ART, HERO_CAST, WORDMARK } from '../../src/components/brand/gameArt';
import { GameCard } from '../../src/components/ui/GameCard';
import { Screen } from '../../src/components/ui/Screen';
import { useTabBarClearance } from '../../src/components/ui/TabBar';
import { GAMES, getGame, type GameCatalogEntry, type GameId } from '../../src/domain/games';
import { useT } from '../../src/i18n';
import { loadLastPlayedGame } from '../../src/storage/lastPlayedGame';
import { useEnterAnimation } from '../../src/theme/motion';
import { color, overlay, space } from '../../src/theme/tokens';
import { family } from '../../src/theme/typography';

const GUTTER = space[4];
const WORDMARK_WIDTH = 176;
/** The cast band is cropped a little top and bottom so the hero stays short. */
const CAST_HEIGHT = 92;

/**
 * Grid rhythm: a wide card, then pairs, with warm accents (Liar, Taboo,
 * Bomb) never side by side or stacked on each other.
 */
const ROWS: GameId[][] = [
  ['impostor'],
  ['whos_the_liar', 'most_likely'],
  ['would_you_rather', 'taboo'],
  ['mizan'],
  ['bomb', 'insider'],
  ['quiz', 'mesob'],
  ['wink_killer', 'gimbar'],
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

/**
 * One game per day with a wide scene, never one that already has a wide card
 * in the grid — the same big scene twice on one screen reads as a mistake.
 */
function tonightsPick(): GameCatalogEntry {
  const wideInGrid = new Set(ROWS.filter((row) => row.length === 1).flat());
  const pool = GAMES.filter(
    (game) => game.playable && GAME_ART[game.id]?.wide && !wideInGrid.has(game.id),
  );
  const now = new Date();
  const day = Math.floor((now.getTime() - now.getTimezoneOffset() * 60_000) / 86_400_000);
  return pool[day % pool.length] ?? GAMES[0];
}

export default function HomeScreen() {
  const { t, uiFont } = useT();
  const { width } = useWindowDimensions();
  const clearance = useTabBarClearance();
  const hero = useEnterAnimation(0, 16);
  const rows = useMemo(gridRows, []);
  const pick = useMemo(tonightsPick, []);
  const [lastGame, setLastGame] = useState<GameCatalogEntry | null>(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      void loadLastPlayedGame().then((last) => {
        if (!active) return;
        setLastGame(last ? getGame(last.gameId) ?? null : null);
      });
      return () => {
        active = false;
      };
    }, []),
  );

  const castImageHeight = width / HERO_CAST.aspect;
  let cardIndex = 1;

  return (
    <Screen accent={color.brandPrimary}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: clearance }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={hero}>
          <View style={styles.heroTop}>
            <View style={styles.brand}>
              <Image
                source={WORDMARK.source}
                style={styles.wordmark}
                resizeMode="contain"
                accessible
                accessibilityRole="header"
                accessibilityLabel="Chereka Chewata"
              />
              <Text style={[styles.tagline, uiFont ? { fontFamily: uiFont } : null]}>
                {t('home.tagline')}
              </Text>
            </View>
          </View>

          <View
            style={styles.cast}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          >
            {/* Masked rather than overlaid: the lamp-lit backdrop is not one
                flat colour, so a painted fade would leave a visible seam. */}
            <Svg width={width} height={CAST_HEIGHT}>
              <Defs>
                <SvgGradient id="castFade" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor="#fff" stopOpacity={0} />
                  <Stop offset="0.3" stopColor="#fff" stopOpacity={1} />
                  <Stop offset="0.62" stopColor="#fff" stopOpacity={1} />
                  <Stop offset="1" stopColor="#fff" stopOpacity={0} />
                </SvgGradient>
                <Mask id="castMask">
                  <Rect x={0} y={0} width={width} height={CAST_HEIGHT} fill="url(#castFade)" />
                </Mask>
              </Defs>
              <SvgImage
                href={HERO_CAST.source}
                x={0}
                y={(CAST_HEIGHT - castImageHeight) / 2}
                width={width}
                height={castImageHeight}
                preserveAspectRatio="xMidYMid slice"
                mask="url(#castMask)"
              />
            </Svg>
          </View>
        </Animated.View>

        {lastGame ? (
          <GameCard
            variant="wide"
            game={lastGame}
            eyebrow={t('home.playAgain')}
            index={cardIndex++}
            onPress={() => router.push(`/game/${lastGame.id}/setup/review`)}
          />
        ) : (
          <GameCard
            variant="wide"
            game={pick}
            eyebrow={t('home.tonightsPick')}
            index={cardIndex++}
            onPress={() => router.push(`/game/${pick.id}`)}
          />
        )}

        <View style={styles.sectionHead}>
          <Text style={[styles.sectionLabel, uiFont ? { fontFamily: uiFont } : null]}>
            {t('home.allGames')} · {GAMES.length}
          </Text>
          <View style={styles.rule} />
        </View>

        {rows.map((row) =>
          row.length === 1 ? (
            <GameCard
              key={row[0].id}
              variant="wide"
              game={row[0]}
              index={cardIndex++}
              onPress={() => router.push(`/game/${row[0].id}`)}
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
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: GUTTER,
    gap: space[3],
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingTop: space[2],
  },
  brand: {
    flex: 1,
    gap: space[1],
  },
  wordmark: {
    width: WORDMARK_WIDTH,
    height: WORDMARK_WIDTH / WORDMARK.aspect,
    marginLeft: -space[1],
  },
  tagline: {
    color: color.textSecondary,
    fontFamily: family.grotesque.medium,
    fontSize: 14,
    lineHeight: 20,
  },
  cast: {
    marginLeft: -GUTTER,
    marginTop: space[1],
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    marginTop: space[3],
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
