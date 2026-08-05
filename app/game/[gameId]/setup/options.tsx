import { router, useLocalSearchParams } from 'expo-router';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Segmented, Toggle } from '../../../../src/components/ui/Selectable';
import { SetupScreen } from '../../../../src/components/ui/SetupScreen';
import { Surface } from '../../../../src/components/ui/Surface';
import { getGame } from '../../../../src/domain/games';
import { useSetup } from '../../../../src/domain/impostor/SetupContext';
import { useLiarSetup } from '../../../../src/domain/liar/SetupContext';
import { useMostLikelySetup } from '../../../../src/domain/mostLikely/SetupContext';
import { useTabooSetup } from '../../../../src/domain/taboo/SetupContext';
import { useWouldRatherSetup } from '../../../../src/domain/wouldRather/SetupContext';
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

export default function OptionsScreen() {
  const { gameId } = useLocalSearchParams<{ gameId: string }>();
  const game = getGame(String(gameId));
  const accent = game?.accent ?? color.gameImpostor;
  if (gameId === 'whos_the_liar') {
    return <LiarOptions gameId={String(gameId)} accent={accent} />;
  }
  if (gameId === 'taboo') {
    return <TabooOptions gameId={String(gameId)} accent={accent} />;
  }
  if (gameId === 'most_likely') {
    return <MostLikelyOptions gameId={String(gameId)} accent={accent} />;
  }
  if (gameId === 'would_you_rather') return <WouldRatherOptions gameId={String(gameId)} accent={accent} />;

  return <ImpostorOptions gameId={String(gameId)} accent={accent} />;
}

function WouldRatherOptions({ gameId, accent }: { gameId: string; accent: string }) {
  const { setup, patchOptions } = useWouldRatherSetup();
  return <SetupScreen step={4} stepLabel="Options" title="How many dilemmas?" accent={accent} primaryLabel="Review" onPrimary={() => router.push(`/game/${gameId}/setup/review`)}>
    <Group label="Session length"><Segmented<number> accent={accent} value={setup.cardCount} onChange={(cardCount) => patchOptions({ cardCount })} options={[{value:10,label:'10'},{value:20,label:'20'},{value:30,label:'30'}]} /><Note text="Point left for A, right for B." /></Group>
  </SetupScreen>;
}

function MostLikelyOptions({ gameId, accent }: { gameId: string; accent: string }) {
  const { setup, patchOptions } = useMostLikelySetup();

  return (
    <SetupScreen
      step={4}
      stepLabel="Options"
      title="How many prompts?"
      accent={accent}
      primaryLabel="Review"
      onPrimary={() => router.push(`/game/${gameId}/setup/review`)}
    >
      <Group label="Session length">
        <Segmented<number>
          accent={accent}
          value={setup.cardCount}
          onChange={(cardCount) => patchOptions({ cardCount })}
          options={[
            { value: 10, label: '10' },
            { value: 20, label: '20' },
            { value: 30, label: '30' },
          ]}
        />
        <Note text="Point together. No scores." />
      </Group>
    </SetupScreen>
  );
}

function ImpostorOptions({ gameId, accent }: { gameId: string; accent: string }) {
  const { setup, patchOptions } = useSetup();
  const twoImpostorsLocked = setup.players.length < 8;

  return (
    <SetupScreen
      step={4}
      stepLabel="Options"
      title="Game options"
      subtitle="Keep it simple, or make the vote private."
      accent={accent}
      primaryLabel="Review"
      onPrimary={() => router.push(`/game/${gameId}/setup/review`)}
    >
      <Group label="Impostors">
        <Segmented<1 | 2>
          accent={accent}
          value={setup.impostorCount}
          onChange={(impostorCount) => patchOptions({ impostorCount })}
          options={[
            { value: 1, label: '1 Impostor' },
            { value: 2, label: '2 · needs 8+', disabled: twoImpostorsLocked },
          ]}
        />
        {setup.impostorCount === 2 ? (
          <Note text="Advanced mode. Two Impostors win and lose as a team." />
        ) : null}
      </Group>

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
          label="Show category to Impostor"
          hint="No direct word hint — category only."
          value={setup.showCategoryToImpostor}
          onPress={() =>
            patchOptions({ showCategoryToImpostor: !setup.showCategoryToImpostor })
          }
        />
        <View style={styles.divider} />
        <Toggle
          accent={accent}
          label="Random starting player"
          value={setup.randomStartPlayer}
          onPress={() => patchOptions({ randomStartPlayer: !setup.randomStartPlayer })}
        />
        <View style={styles.divider} />
        <Toggle
          accent={accent}
          label="2-minute discussion timer"
          hint="Off by default."
          value={setup.discussionTimerSeconds === 120}
          onPress={() =>
            patchOptions({
              discussionTimerSeconds: setup.discussionTimerSeconds === 120 ? null : 120,
            })
          }
        />
        <View style={styles.divider} />
        <Toggle
          accent={accent}
          label="Scoring"
          hint="Off for casual play."
          value={setup.scoringEnabled}
          onPress={() => patchOptions({ scoringEnabled: !setup.scoringEnabled })}
        />
      </Group>
    </SetupScreen>
  );
}

function TabooOptions({ gameId, accent }: { gameId: string; accent: string }) {
  const { setup, patchOptions } = useTabooSetup();

  return (
    <SetupScreen
      step={4}
      stepLabel="Options"
      title="Game options"
      subtitle="Two teams. Describe without forbidden words."
      accent={accent}
      primaryLabel="Review"
      onPrimary={() => router.push(`/game/${gameId}/setup/review`)}
    >
      <Group label="Round">
        <Segmented<number>
          accent={accent}
          value={setup.roundSeconds}
          onChange={(roundSeconds) => patchOptions({ roundSeconds })}
          options={[
            { value: 45, label: '45s' },
            { value: 60, label: '60s' },
            { value: 90, label: '90s' },
          ]}
        />
        <Note text="Sudden-death turns always use 30 seconds." />
      </Group>

      <Group label="Win">
        <Segmented<number>
          accent={accent}
          value={setup.pointsToWin}
          onChange={(pointsToWin) => patchOptions({ pointsToWin })}
          options={[
            { value: 10, label: '10 pts' },
            { value: 15, label: '15 pts' },
            { value: 25, label: '25 pts' },
          ]}
        />
        <Note text="Both teams get the same number of turns before a winner is declared." />
      </Group>

      <Group label="Rules">
        <Toggle
          accent={accent}
          label="Skip costs a point"
          hint="Off by default — skips are free."
          value={setup.skipPenalty}
          onPress={() => patchOptions({ skipPenalty: !setup.skipPenalty })}
        />
        <Note text="Max 3 skips per turn. Violation always costs 1. Teams are randomly balanced." />
      </Group>
    </SetupScreen>
  );
}

function LiarOptions({ gameId, accent }: { gameId: string; accent: string }) {
  const { setup, patchOptions } = useLiarSetup();

  return (
    <SetupScreen
      step={4}
      stepLabel="Options"
      title="Game options"
      subtitle="Set the pace for answers and discussion."
      accent={accent}
      primaryLabel="Review"
      onPrimary={() => router.push(`/game/${gameId}/setup/review`)}
    >
      <Group label="Answers">
        <Toggle
          accent={accent}
          label="Random answer order"
          hint="On by default. The Liar may go first."
          value={setup.randomAnswerOrder}
          onPress={() => patchOptions({ randomAnswerOrder: !setup.randomAnswerOrder })}
        />
        <View style={styles.divider} />
        <Toggle
          accent={accent}
          label="20-second answer timer"
          hint="Off by default."
          value={setup.answerTimerSeconds === 20}
          onPress={() =>
            patchOptions({
              answerTimerSeconds: setup.answerTimerSeconds === 20 ? null : 20,
            })
          }
        />
      </Group>

      <Group label="Round">
        <Toggle
          accent={accent}
          label="2-minute discussion timer"
          hint="Off by default."
          value={setup.discussionTimerSeconds === 120}
          onPress={() =>
            patchOptions({
              discussionTimerSeconds: setup.discussionTimerSeconds === 120 ? null : 120,
            })
          }
        />
        <View style={styles.divider} />
        <Toggle
          accent={accent}
          label="Scoring"
          hint="Off for casual play."
          value={setup.scoringEnabled}
          onPress={() => patchOptions({ scoringEnabled: !setup.scoringEnabled })}
        />
        <Note text="Voting is always private pass-the-phone. Ties runoff once, then the Liar wins." />
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
