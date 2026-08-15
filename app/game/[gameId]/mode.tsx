import { router, useLocalSearchParams } from 'expo-router';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { MoonFace } from '../../../src/components/brand/MoonFace';
import { Icon, type IconName } from '../../../src/components/ui/Icon';
import { PressableScale } from '../../../src/components/ui/PressableScale';
import { IconButton, Screen } from '../../../src/components/ui/Screen';
import { useQuizSetup } from '../../../src/domain/quiz/SetupContext';
import type { QuizPlayMode } from '../../../src/domain/quiz/types';
import { useEnterAnimation } from '../../../src/theme/motion';
import { alpha, color, glow, overlay, radius, space } from '../../../src/theme/tokens';
import { type } from '../../../src/theme/typography';

const MODES: {
  id: QuizPlayMode;
  title: string;
  description: string;
  details: string;
  icon: IconName;
}[] = [
  {
    id: 'pass_play',
    title: 'Pass & Play',
    description: 'Quick casual trivia. Answer, reveal, then pass the phone.',
    details: 'No names · No scores · Fastest setup',
    icon: 'phone',
  },
  {
    id: 'compete',
    title: 'Compete',
    description: 'Add players, keep score, and see who knows the most.',
    details: '2–12 players · Round-robin · Leaderboard',
    icon: 'trophy',
  },
];

export default function QuizModeScreen() {
  const { gameId } = useLocalSearchParams<{ gameId: string }>();
  const { patchOptions } = useQuizSetup();
  const enter = useEnterAnimation(0, 16);

  if (gameId !== 'quiz') {
    router.replace(`/game/${String(gameId)}/setup/review`);
    return null;
  }

  const choose = (playMode: QuizPlayMode) => {
    patchOptions({ playMode });
    router.push('/game/quiz/setup/review');
  };

  return (
    <Screen accent={color.gameQuiz}>
      <View style={styles.nav}>
        <IconButton name="arrowLeft" label="Back" onPress={() => router.back()} />
      </View>
      <Animated.ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        style={enter}
      >
        <MoonFace expression="quiz" size={92} />
        <View style={styles.heading}>
          <Text style={[type.eyebrow, { color: color.gameQuiz }]}>QUIZ</Text>
          <Text style={[type.displayLg, styles.title]}>How do you want to play?</Text>
          <Text style={[type.body, styles.subtitle]}>
            Both modes use the same questions. Choose the rhythm that fits your table.
          </Text>
        </View>

        <View style={styles.modes}>
          {MODES.map((mode) => (
            <PressableScale
              key={mode.id}
              accessibilityRole="button"
              accessibilityLabel={`${mode.title}. ${mode.description}. ${mode.details}`}
              haptic="medium"
              onPress={() => choose(mode.id)}
              scaleTo={0.98}
              style={styles.card}
            >
              <View style={[styles.icon, { backgroundColor: alpha(color.gameQuiz, 0.14) }]}>
                <Icon name={mode.icon} size={28} color={color.gameQuiz} />
              </View>
              <View style={styles.copy}>
                <Text style={[type.titleLg, styles.modeTitle]}>{mode.title}</Text>
                <Text style={[type.body, styles.description]}>{mode.description}</Text>
                <Text style={[type.mono, styles.details]}>{mode.details}</Text>
              </View>
              <Icon name="chevronRight" size={22} color={color.textSecondary} />
            </PressableScale>
          ))}
        </View>
      </Animated.ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  nav: {
    paddingHorizontal: space[6],
    paddingTop: space[2],
  },
  content: {
    paddingHorizontal: space[6],
    paddingTop: space[5],
    paddingBottom: space[10],
    gap: space[6],
  },
  heading: {
    gap: space[2],
  },
  title: {
    color: color.textPrimary,
  },
  subtitle: {
    color: color.textSecondary,
    fontSize: 17,
    lineHeight: 26,
  },
  modes: {
    gap: space[4],
  },
  card: {
    minHeight: 184,
    borderRadius: radius.large,
    borderWidth: 1,
    borderColor: alpha(color.gameQuiz, 0.35),
    backgroundColor: overlay.glass,
    padding: space[5],
    gap: space[4],
    flexDirection: 'row',
    alignItems: 'center',
    ...glow(color.gameQuiz, 0.14, 14),
  },
  icon: {
    width: 56,
    height: 56,
    borderRadius: radius.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    gap: space[2],
  },
  modeTitle: {
    color: color.textPrimary,
  },
  description: {
    color: color.textSecondary,
  },
  details: {
    color: color.textMuted,
    fontSize: 12,
  },
});
