import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { Dialog } from '../../../../src/components/ui/Dialog';
import type { IconName } from '../../../../src/components/ui/Icon';
import { OptionRow } from '../../../../src/components/ui/Selectable';
import { SetupScreen } from '../../../../src/components/ui/SetupScreen';
import { useGameSetup } from '../../../../src/domain/useGameSetup';
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
  const { setup, toggleContentLevel, acknowledgeSpicy, validation, accent } =
    useGameSetup(gameId);
  const [spicyPromptVisible, setSpicyPromptVisible] = useState(false);

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
      step={3}
      stepLabel="Content"
      title="Content level"
      subtitle="Family is the default. Levels stack."
      accent={accent}
      primaryLabel="Continue"
      primaryDisabled={!validation.contentOk || !validation.spicyOk}
      footerNote={!validation.contentOk ? 'Pick at least one level.' : undefined}
      onPrimary={() => router.push(`/game/${gameId}/setup/options`)}
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
  onPress,
}: {
  index: number;
  title: string;
  body: string;
  icon: IconName;
  accent: string;
  selected: boolean;
  onPress: () => void;
}) {
  const enter = useEnterAnimation(index);

  return (
    <Animated.View style={enter}>
      <OptionRow
        title={title}
        description={body}
        icon={icon}
        accent={accent}
        selected={selected}
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
