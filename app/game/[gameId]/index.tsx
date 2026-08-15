import { router, useLocalSearchParams } from 'expo-router';
import { Animated, ScrollView, StyleSheet, Text, View } from 'react-native';
import { GAME_MOON_EXPRESSION } from '../../../src/components/brand/gameMoonExpression';
import { MoonFace } from '../../../src/components/brand/MoonFace';
import { MetaChip, Pill } from '../../../src/components/ui/Chip';
import { PrimaryButton } from '../../../src/components/ui/PrimaryButton';
import { IconButton, Screen } from '../../../src/components/ui/Screen';
import { getGame } from '../../../src/domain/games';
import { useEnterAnimation } from '../../../src/theme/motion';
import { alpha, color, radius, space } from '../../../src/theme/tokens';
import { type } from '../../../src/theme/typography';

const STEPS: Record<string, string[]> = {
  impostor: [
    'Everyone sees the same secret word — except the Impostor.',
    'Take turns giving one short clue. Never say the word.',
    'Argue, vote, then let a caught Impostor guess the word.',
  ],
  whos_the_liar: [
    'Everyone gets a question privately — one player got a different one.',
    'Answer aloud in order. Do not read your question out loud.',
    'Discuss, then vote privately for who you think is the Liar.',
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
};

export default function GameDetailsScreen() {
  const { gameId } = useLocalSearchParams<{ gameId: string }>();
  const game = getGame(String(gameId));
  const enter = useEnterAnimation(0, 16);

  if (!game) {
    return (
      <Screen style={styles.notFound}>
        <Text style={[type.displayMd, styles.title]}>Game not found</Text>
        <PrimaryButton label="Back home" icon="home" onPress={() => router.replace('/home')} />
      </Screen>
    );
  }

  const steps = STEPS[game.id] ?? null;
  const returnToGames = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/home');
  };

  return (
    <Screen accent={game.accent}>
      <View style={styles.nav}>
        <IconButton name="arrowLeft" label="Back to games" onPress={returnToGames} />
        {!game.playable ? <Pill label="Soon" tint={color.textMuted} icon="lock" /> : null}
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.hero, enter]}>
          <View style={styles.mascotWrap}>
            <View
              pointerEvents="none"
              style={[styles.mascotGlow, { backgroundColor: alpha(game.accent, 0.16) }]}
            />
            <MoonFace expression={GAME_MOON_EXPRESSION[game.id]} size={116} />
          </View>
          <Text style={[type.displayXl, styles.title]}>{game.name}</Text>
          <Text style={[type.body, styles.tagline]}>{game.tagline}</Text>
          <View style={styles.metaRow}>
            <MetaChip icon="users" label={game.playerCountLabel} tint={color.textSecondary} />
            <MetaChip icon="clock" label={game.sessionLengthLabel} tint={color.textSecondary} />
          </View>
        </Animated.View>

        <View style={styles.steps}>
          <Text style={[type.eyebrow, { color: game.accent }]}>How to play</Text>
          {steps ? (
            steps.map((step, index) => (
              <View key={step} style={styles.step}>
                <Text style={[type.numeric, { color: game.accent }]}>
                  {String(index + 1).padStart(2, '0')}
                </Text>
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

      <View style={styles.footer}>
        {game.playable ? (
          <PrimaryButton
            label={`Play ${game.name}`}
            // Every game opens on its ready-to-play overview — defaults are
            // already playable, so setup is opt-in rather than a journey.
            onPress={() =>
              router.push(
                game.id === 'quiz'
                  ? `/game/${game.id}/mode`
                  : `/game/${game.id}/setup/review`,
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

const styles = StyleSheet.create({
  notFound: {
    paddingHorizontal: space[6],
    justifyContent: 'center',
    gap: space[5],
  },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space[6],
    paddingTop: space[2],
  },
  content: {
    paddingHorizontal: space[6],
    paddingTop: space[8],
    paddingBottom: space[8],
    gap: space[10],
  },
  hero: {
    gap: space[4],
  },
  mascotWrap: {
    width: 116,
    height: 116,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  mascotGlow: {
    position: 'absolute',
    width: 88,
    height: 88,
    borderRadius: radius.pill,
    opacity: 0.72,
  },
  title: {
    color: color.textPrimary,
  },
  tagline: {
    color: color.textSecondary,
    fontSize: 18,
    lineHeight: 28,
  },
  metaRow: {
    flexDirection: 'row',
    gap: space[5],
    paddingTop: space[1],
  },
  steps: {
    gap: space[5],
  },
  step: {
    flexDirection: 'row',
    gap: space[4],
    alignItems: 'flex-start',
  },
  stepText: {
    color: color.textSecondary,
    flex: 1,
    fontSize: 17,
    lineHeight: 26,
  },
  footer: {
    paddingHorizontal: space[6],
    paddingBottom: space[4],
    paddingTop: space[2],
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
