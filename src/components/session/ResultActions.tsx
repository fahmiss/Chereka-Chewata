import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import type { GameId } from '../../domain/games';
import { color, space } from '../../theme/tokens';
import { type } from '../../theme/typography';
import { PrimaryButton } from '../ui/PrimaryButton';
import { SecondaryButton } from '../ui/SecondaryButton';
import { useT } from '../../i18n';

type Props = {
  gameId: GameId;
  onPlayAgain: () => void;
  onLeave: () => void;
  replayHint?: string;
  alternateReplay?: { label: string; onPress: () => void };
};

/** Same ending controls everywhere; leaving clears only the active session. */
export function ResultActions({ gameId, onPlayAgain, onLeave, replayHint, alternateReplay }: Props) {
  const { t, uiFont } = useT();
  return (
    <View style={styles.actions}>
      {replayHint ? <Text style={[type.bodySm, styles.hint, uiFont ? { fontFamily: uiFont } : null]}>{replayHint}</Text> : null}
      <PrimaryButton label={t('common.playAgain')} icon="refresh" onPress={onPlayAgain} />
      <View style={styles.row}>
        <SecondaryButton label={t('common.changeSetup')} style={styles.half} onPress={() => {
          router.replace({ pathname: '/game/[gameId]/setup/review', params: { gameId } });
          onLeave();
        }} />
        <SecondaryButton label={t('common.anotherGame')} style={styles.half} onPress={() => {
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
