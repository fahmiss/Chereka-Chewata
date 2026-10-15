import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Animated, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MoonFace } from '../src/components/brand/MoonFace';
import { GameTile } from '../src/components/ui/GameTile';
import { Icon } from '../src/components/ui/Icon';
import { PressableScale } from '../src/components/ui/PressableScale';
import { Screen, IconButton } from '../src/components/ui/Screen';
import { GAMES, getGame, type GameCatalogEntry } from '../src/domain/games';
import { useT } from '../src/i18n';
import { loadLastPlayedGame } from '../src/storage/lastPlayedGame';
import { useEnterAnimation } from '../src/theme/motion';
import { alpha, color, overlay, radius, space } from '../src/theme/tokens';
import { family, type } from '../src/theme/typography';

const AMHARIC = '\u1328\u1228\u1243 \u1328\u12CB\u1273';

export default function HomeScreen() {
  const { t, uiFont } = useT();
  const playable = GAMES.filter((game) => game.playable);
  const comingSoon = GAMES.filter((game) => !game.playable);
  const brand = useEnterAnimation(0, 16);
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

  return (
    <Screen accent={color.brandPrimary}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <IconButton
            name="sliders"
            label={t('common.settings')}
            onPress={() => router.push('/settings')}
          />
        </View>

        <Animated.View style={[styles.brand, brand]}>
          <MoonFace expression="ready" size={88} />
          <Text style={styles.wordmark}>CHEREKA{`\n`}CHEWATA</Text>
          <Text style={styles.amharic}>{AMHARIC}</Text>
          <Text style={[type.body, styles.tagline, uiFont ? { fontFamily: uiFont } : null]}>
            {t('home.tagline')}
          </Text>
        </Animated.View>

        {lastGame ? (
          <View style={styles.section}>
            <View style={styles.sectionHead}>
              <Text style={[type.eyebrow, styles.sectionLabel]}>Play again</Text>
              <View style={styles.rule} />
            </View>
            <PressableScale
              accessibilityRole="button"
              accessibilityLabel={`Play ${lastGame.name} again`}
              onPress={() => router.push(`/game/${lastGame.id}/setup/review`)}
              haptic="medium"
              scaleTo={0.98}
              style={[styles.replay, { borderColor: alpha(lastGame.accent, 0.42) }]}
            >
              <View style={[styles.replayIcon, { backgroundColor: alpha(lastGame.accent, 0.16) }]}>
                <Icon name="refresh" size={22} color={lastGame.accent} strokeWidth={2.2} />
              </View>
              <View style={styles.replayCopy}>
                <Text style={[type.titleMd, styles.replayTitle]}>{lastGame.name}</Text>
                <Text style={[type.bodySm, styles.replayBody]}>Review setup and start</Text>
              </View>
              <Icon name="chevronRight" size={20} color={color.textSecondary} />
            </PressableScale>
          </View>
        ) : null}

        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={[type.eyebrow, styles.sectionLabel, uiFont ? { fontFamily: uiFont } : null]}>
              {t('home.play')}
            </Text>
            <View style={styles.rule} />
          </View>
          <View style={styles.playList}>
            {playable.map((game) => (
              <GameTile
                key={game.id}
                game={game}
                onPress={() => router.push(`/game/${game.id}`)}
              />
            ))}
          </View>
        </View>

        {comingSoon.length > 0 ? (
          <View style={styles.section}>
            <View style={styles.sectionHead}>
              <Text
                style={[type.eyebrow, styles.sectionLabel, uiFont ? { fontFamily: uiFont } : null]}
              >
                {t('home.comingNext')}
              </Text>
              <View style={styles.rule} />
            </View>
            <View style={styles.soonList}>
              {comingSoon.map((game) => (
                <GameTile
                  key={game.id}
                  game={game}
                  compact
                  onPress={() => router.push(`/game/${game.id}`)}
                />
              ))}
            </View>
          </View>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: space[6],
    paddingBottom: space[12],
    gap: space[5],
  },
  topBar: {
    position: 'absolute',
    top: space[1],
    right: space[6],
    zIndex: 1,
  },
  brand: {
    alignItems: 'center',
    gap: space[1],
    paddingTop: space[3],
  },
  wordmark: {
    marginTop: space[1],
    color: color.textPrimary,
    fontFamily: family.display.black,
    fontSize: 38,
    lineHeight: 36,
    letterSpacing: 1.8,
    textAlign: 'center',
  },
  amharic: {
    color: color.brandPrimary,
    fontFamily: family.ethiopic.medium,
    fontSize: 18,
    lineHeight: 26,
    textAlign: 'center',
  },
  tagline: {
    color: color.textSecondary,
    textAlign: 'center',
    maxWidth: 280,
  },
  section: {
    gap: space[4],
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
  },
  sectionLabel: {
    color: color.textMuted,
  },
  rule: {
    flex: 1,
    height: 1,
    backgroundColor: overlay.hairline,
  },
  playList: {
    gap: 10,
  },
  replay: {
    minHeight: 76,
    borderRadius: radius.large,
    borderWidth: 1,
    backgroundColor: color.surface,
    paddingHorizontal: space[4],
    paddingVertical: space[3],
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
  },
  replayIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  replayCopy: {
    flex: 1,
    gap: 2,
  },
  replayTitle: {
    color: color.textPrimary,
  },
  replayBody: {
    color: color.textMuted,
  },
  soonList: {
    gap: space[2],
  },
});
