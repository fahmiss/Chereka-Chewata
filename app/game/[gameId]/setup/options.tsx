import { Redirect, router, useLocalSearchParams } from 'expo-router';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Segmented, Toggle } from '../../../../src/components/ui/Selectable';
import { SetupScreen } from '../../../../src/components/ui/SetupScreen';
import { Surface } from '../../../../src/components/ui/Surface';
import { getGame } from '../../../../src/domain/games';
import { useSetup } from '../../../../src/domain/impostor/SetupContext';
import { useTabooSetup } from '../../../../src/domain/taboo/SetupContext';
import { color, overlay, space } from '../../../../src/theme/tokens';
import { type } from '../../../../src/theme/typography';

function Group({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Surface contentStyle={styles.group}>
      <Text style={[type.eyebrow, styles.groupLabel]}>{label}</Text>
      {children}
    </Surface>
  );
}

function Note({ text }: { text: string }) {
  return (
    <View style={styles.note}>
      <Text style={[type.bodySm, styles.noteText]}>{text}</Text>
    </View>
  );
}

/**
 * Advanced settings only. Everything a table changes between rounds now lives
 * inline on the quick-setup overview — Who's the Liar?, Who's Most Likely To
 * and Would You Rather have nothing left here, so they bounce back.
 */
export default function OptionsScreen() {
  const { gameId } = useLocalSearchParams<{ gameId: string }>();
  const id = String(gameId);
  const accent = getGame(id)?.accent ?? color.gameImpostor;

  if (id === 'taboo') return <TabooOptions accent={accent} />;
  if (id === 'impostor') return <ImpostorOptions accent={accent} />;
  return <Redirect href={`/game/${id}/setup/review`} />;
}

function ImpostorOptions({ accent }: { accent: string }) {
  const { setup, patchOptions } = useSetup();

  return (
    <SetupScreen
      stepLabel="More options"
      title="Advanced"
      subtitle="Impostor count and the round basics live on the overview."
      accent={accent}
      primaryLabel="Done"
      onPrimary={() => router.back()}
    >
      <Group label="Voting">
        <Segmented<'group' | 'private'>
          accent={accent}
          value={setup.votingMode}
          onChange={(votingMode) => patchOptions({ votingMode })}
          options={[
            { value: 'group', label: 'Group decides' },
            { value: 'private', label: 'Private in-app' },
          ]}
        />
        <Note
          text={
            setup.votingMode === 'group'
              ? 'Default. Argue in the room, then tap who you’re accusing.'
              : 'Anonymous pass-the-phone votes. Slower, but private.'
          }
        />
      </Group>

      <Group label="Round">
        <Toggle
          accent={accent}
          label="Random starting player"
          value={setup.randomStartPlayer}
          onPress={() => patchOptions({ randomStartPlayer: !setup.randomStartPlayer })}
        />
      </Group>
    </SetupScreen>
  );
}

function TabooOptions({ accent }: { accent: string }) {
  const { setup, patchOptions } = useTabooSetup();

  return (
    <SetupScreen
      stepLabel="More options"
      title="Advanced"
      subtitle="Turn length and target score live on the overview."
      accent={accent}
      primaryLabel="Done"
      onPrimary={() => router.back()}
    >
      <Group label="Rules">
        <Toggle
          accent={accent}
          label="Skip costs a point"
          hint="Off by default — skips are free."
          value={setup.skipPenalty}
          onPress={() => patchOptions({ skipPenalty: !setup.skipPenalty })}
        />
        <View style={styles.divider} />
        <Note text="Max 3 skips per turn. Violation always costs 1. Teams are randomly balanced." />
      </Group>
    </SetupScreen>
  );
}

const styles = StyleSheet.create({
  group: {
    padding: space[5],
    gap: space[4],
  },
  groupLabel: {
    color: color.textMuted,
  },
  note: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  noteText: {
    color: color.textMuted,
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: overlay.hairline,
  },
});
