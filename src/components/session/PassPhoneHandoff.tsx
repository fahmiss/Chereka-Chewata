import { Animated, StyleSheet, Text, View } from 'react-native';
import { useEnterAnimation } from '../../theme/motion';
import { color, space } from '../../theme/tokens';
import { family, type } from '../../theme/typography';
import { MoonFace } from '../brand/MoonFace';
import { Icon } from '../ui/Icon';
import { PrimaryButton } from '../ui/PrimaryButton';
import { SessionShell } from './SessionShell';

type Props = {
  name: string;
  index: number;
  total: number;
  accent: string;
  eyebrow: string;
  stage?: string;
  stages?: readonly string[];
  note?: string;
  readyLabel?: string;
  onReady: () => void;
  onEndGame?: () => void;
};

/** Shared pass-the-phone identity screen — no secrets. */
export function PassPhoneHandoff({
  name,
  index,
  total,
  accent,
  eyebrow,
  stage = 'reveal',
  stages,
  note = 'Face the screen away from the table. Nobody else should see.',
  readyLabel = "I'm ready",
  onReady,
  onEndGame,
}: Props) {
  const enter = useEnterAnimation(1, 20);

  return (
    <SessionShell
      eyebrow={eyebrow}
      stage={stage}
      stages={stages}
      accent={accent}
      onEndGame={onEndGame}
      footer={<PrimaryButton label={readyLabel} icon="checkCircle" onPress={onReady} />}
    >
      <Animated.View style={[styles.handoff, enter]}>
        <MoonFace expression="secret" size={72} glow={false} />
        <Text style={[type.numeric, { color: accent, marginBottom: space[2] }]}>
          {String(index).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </Text>
        <Text style={[type.eyebrow, styles.label]}>Hand the phone to</Text>
        <Text style={styles.name} numberOfLines={2} adjustsFontSizeToFit>
          {name}
        </Text>
        <View style={styles.note}>
          <Icon name="eye" size={16} color={color.textMuted} />
          <Text style={[type.bodySm, styles.noteText]}>{note}</Text>
        </View>
      </Animated.View>
    </SessionShell>
  );
}

const styles = StyleSheet.create({
  handoff: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: space[3],
  },
  label: {
    color: color.textMuted,
  },
  name: {
    color: color.textPrimary,
    fontFamily: family.display.black,
    fontSize: 56,
    lineHeight: 58,
    letterSpacing: -2.4,
  },
  note: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
    marginTop: space[3],
  },
  noteText: {
    color: color.textMuted,
    flex: 1,
  },
});
