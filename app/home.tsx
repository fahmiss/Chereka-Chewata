import { router } from 'expo-router';
import { Animated, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MoonFace } from '../src/components/brand/MoonFace';
import { GameTile } from '../src/components/ui/GameTile';
import { Screen, IconButton } from '../src/components/ui/Screen';
import { GAMES } from '../src/domain/games';
import { useT } from '../src/i18n';
import { useEnterAnimation } from '../src/theme/motion';
import { color, overlay, space } from '../src/theme/tokens';
import { family, type } from '../src/theme/typography';

const AMHARIC = '\u1328\u1228\u1243 \u1328\u12CB\u1273';

export default function HomeScreen() {
  const { t, uiFont } = useT();
  const playable = GAMES.filter((game) => game.playable);
  const comingSoon = GAMES.filter((game) => !game.playable);
  const brand = useEnterAnimation(0, 16);

  return (
    <Screen accent={color.brandPrimary}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <View style={styles.spacer} />
          <IconButton
            name="sliders"
            label={t('common.settings')}
            onPress={() => router.push('/settings')}
          />
        </View>

        <Animated.View style={[styles.brand, brand]}>
          <MoonFace expression="ready" size={88} />
          <Text style={styles.wordmark}>CHEREKA CHEWATA</Text>
          <Text style={styles.amharic}>{AMHARIC}</Text>
          <Text style={[type.body, styles.tagline, uiFont ? { fontFamily: uiFont } : null]}>
            {t('home.tagline')}
          </Text>
        </Animated.View>

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
    gap: space[8],
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: space[1],
  },
  spacer: {
    flex: 1,
  },
  brand: {
    alignItems: 'center',
    gap: space[1],
    paddingTop: space[1],
  },
  wordmark: {
    marginTop: space[3],
    color: color.textPrimary,
    fontFamily: family.display.black,
    fontSize: 34,
    lineHeight: 38,
    letterSpacing: 2.4,
    textAlign: 'center',
  },
  amharic: {
    color: color.brandPrimary,
    fontFamily: family.ethiopic.medium,
    fontSize: 18,
    lineHeight: 26,
    marginTop: space[1],
    textAlign: 'center',
  },
  tagline: {
    color: color.textSecondary,
    textAlign: 'center',
    marginTop: space[2],
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
    gap: space[3],
  },
  soonList: {
    gap: space[2],
  },
});
