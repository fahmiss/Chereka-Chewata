import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { Dialog } from '../../../../src/components/ui/Dialog';
import type { IconName } from '../../../../src/components/ui/Icon';
import { OptionRow } from '../../../../src/components/ui/Selectable';
import { SetupScreen } from '../../../../src/components/ui/SetupScreen';
import { countBombCards } from '../../../../src/content/bomb';
import { countImpostorWords } from '../../../../src/content/impostor';
import { countLiarPairs } from '../../../../src/content/liar';
import { countMostLikelyPrompts } from '../../../../src/content/mostLikely';
import { countTabooCards } from '../../../../src/content/taboo';
import { countWouldRatherDilemmas } from '../../../../src/content/wouldRather';
import { useGameSetup } from '../../../../src/domain/useGameSetup';
import { useSettings } from '../../../../src/domain/settings/SettingsContext';
import type { ContentLevel } from '../../../../src/domain/impostor/types';
import { useEnterAnimation } from '../../../../src/theme/motion';
import { color, space } from '../../../../src/theme/tokens';

const LEVELS: {
  id: ContentLevel;
  title: string;
  body: string;
  icon: IconName;
  accent: string;
}[] = [
  {
    id: 'family',
    title: 'Family',
    body: 'Safe for mixed-age groups.',
    icon: 'home',
    accent: color.success,
  },
  {
    id: 'friends',
    title: 'Friends',
    body: 'Playful, mildly personal, or embarrassing.',
    icon: 'users',
    accent: color.brandPrimary,
  },
  {
    id: 'spicy',
    title: 'Spicy',
    body: 'Dating, exes, confessions — off by default.',
    icon: 'flame',
    accent: color.dangerUrgency,
  },
];

export default function ContentLevelScreen() {
  const { gameId } = useLocalSearchParams<{ gameId: string }>();
  const {
    setup,
    toggleContentLevel,
    acknowledgeSpicy,
    validation,
    accent,
    isLiar,
    isTaboo,
    isMostLikely,
    isWouldRather,
    isBomb,
    isQuiz,
  } = useGameSetup(gameId);
  const { settings } = useSettings();
  const [spicyPromptVisible, setSpicyPromptVisible] = useState(false);

  if (isQuiz) return <Redirect href="/game/quiz/setup/review" />;

  const lang = settings.contentLanguage;
  const countFor = (contentLevels: ContentLevel[]) =>
    isBomb
      ? countBombCards({
          categoryIds: setup.categoryIds,
          contentLevels,
          contentLanguage: lang,
        })
      : isWouldRather
        ? countWouldRatherDilemmas({
          categoryIds: setup.categoryIds,
          contentLevels,
          contentLanguage: lang,
        })
      : isMostLikely
        ? countMostLikelyPrompts({
            categoryIds: setup.categoryIds,
            contentLevels,
            contentLanguage: lang,
          })
        : isTaboo
          ? countTabooCards({
              categoryIds: setup.categoryIds,
              contentLevels,
              contentLanguage: lang,
            })
          : isLiar
            ? countLiarPairs({
                categoryIds: setup.categoryIds,
                contentLevels,
                contentLanguage: lang,
              })
            : countImpostorWords({
                categoryIds: setup.categoryIds,
                contentLevels,
                contentLanguage: lang,
              });
  const selectedCount = countFor(setup.contentLevels);

  const onToggle = (level: ContentLevel) => {
    if (
      level === 'spicy' &&
      !setup.contentLevels.includes('spicy') &&
      !setup.spicyAcknowledged
    ) {
      setSpicyPromptVisible(true);
      return;
    }
    toggleContentLevel(level);
  };

  return (
    <SetupScreen
      stepLabel="Content"
      title="Content level"
      subtitle="Family is the default. Levels stack. Spicy needs a one-time OK."
      accent={accent}
      primaryLabel="Done"
      primaryDisabled={!validation.contentOk || !validation.spicyOk || selectedCount === 0}
      footerNote={
        !validation.contentOk
          ? 'Pick at least one level.'
          : !validation.spicyOk
            ? 'Confirm Spicy before continuing.'
            : selectedCount === 0
              ? 'No cards match this combination.'
              : `${selectedCount} cards available`
      }
      onPrimary={() => router.back()}
    >
      <View style={styles.list}>
        {LEVELS.map((level, index) => (
          <LevelRow
            key={level.id}
            index={index}
            title={level.title}
            body={level.body}
            icon={level.icon}
            accent={level.accent}
            selected={setup.contentLevels.includes(level.id)}
            count={countFor([level.id])}
            onPress={() => onToggle(level.id)}
          />
        ))}
      </View>

      <Dialog
        visible={spicyPromptVisible}
        icon="flame"
        accent={color.dangerUrgency}
        title="Enable Spicy?"
        message="Spicy cards can include mature social topics. Everyone at the table should be okay with that."
        confirmLabel="Enable Spicy"
        confirmTone="danger"
        onConfirm={() => {
          acknowledgeSpicy();
          toggleContentLevel('spicy');
          setSpicyPromptVisible(false);
        }}
        cancelLabel="Cancel"
        onCancel={() => setSpicyPromptVisible(false)}
      />
    </SetupScreen>
  );
}

function LevelRow({
  index,
  title,
  body,
  icon,
  accent,
  selected,
  count,
  onPress,
}: {
  index: number;
  title: string;
  body: string;
  icon: IconName;
  accent: string;
  selected: boolean;
  count: number;
  onPress: () => void;
}) {
  const enter = useEnterAnimation(index);

  return (
    <Animated.View style={enter}>
      <OptionRow
        title={title}
        description={body}
        meta={count > 0 ? `${count} cards` : 'Unavailable for these categories'}
        icon={icon}
        accent={accent}
        selected={selected}
        disabled={count === 0 && !selected}
        onPress={onPress}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: space[3],
  },
});
