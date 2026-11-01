import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import type { GameId } from '../../domain/games';
import { color, space } from '../../theme/tokens';
import { type } from '../../theme/typography';
import { PrimaryButton } from '../ui/PrimaryButton';
import { SecondaryButton } from '../ui/SecondaryButton';

type Props = {
  gameId: GameId;
  onPlayAgain: () => void;
  onLeave: () => void;
  replayHint?: string;
  alternateReplay?: { label: string; onPress: () => void };
};

/** Same ending controls everywhere; leaving clears only the active session. */
export function ResultActions({ gameId, onPlayAgain, onLeave, replayHint, alternateReplay }: Props) {
  return (
    <View style={styles.actions}>
      {replayHint ? <Text style={[type.bodySm, styles.hint]}>{replayHint}</Text> : null}
      <PrimaryButton label="Play again" icon="refresh" onPress={onPlayAgain} />
      <View style={styles.row}>
        <SecondaryButton label="Change setup" style={styles.half} onPress={() => {
          router.replace({ pathname: '/game/[gameId]/setup/review', params: { gameId } });
          onLeave();
        }} />
        <SecondaryButton label="Another game" style={styles.half} onPress={() => {
          router.replace('/home');
          onLeave();
        }} />
      </View>
      {alternateReplay ? <SecondaryButton label={alternateReplay.label} quiet onPress={alternateReplay.onPress} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  actions: { gap: space[3] },
  row: { flexDirection: 'row', gap: space[3] },
  half: { flex: 1 },
  hint: { color: color.textSecondary, textAlign: 'center' },
});
