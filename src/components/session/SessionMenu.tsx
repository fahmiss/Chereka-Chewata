import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSettings } from '../../domain/settings/SettingsContext';
import { useReducedMotion } from '../../theme/motion';
import { alpha, color, overlay, radius, space } from '../../theme/tokens';
import { type } from '../../theme/typography';
import { Icon } from '../ui/Icon';
import { PrimaryButton } from '../ui/PrimaryButton';
import { PressableScale } from '../ui/PressableScale';
import { SecondaryButton } from '../ui/SecondaryButton';
import { Toggle } from '../ui/Selectable';
import { Surface } from '../ui/Surface';

type Props = {
  visible: boolean;
  accent: string;
  canRestart: boolean;
  onClose: () => void;
  onShowRules: () => void;
  onRestart: () => void;
  onEnd: () => void;
};

export function SessionMenu({
  visible,
  accent,
  canRestart,
  onClose,
  onShowRules,
  onRestart,
  onEnd,
}: Props) {
  const { settings, setSoundEnabled, setVibrationEnabled } = useSettings();
  const reducedMotion = useReducedMotion();

  return (
    <Modal
      visible={visible}
      transparent
      animationType={reducedMotion ? 'none' : 'fade'}
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.root} accessibilityViewIsModal>
        <View style={[StyleSheet.absoluteFill, styles.scrim]} />
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Dismiss game menu"
        />
        <Surface accent={accent} active style={styles.wrap} contentStyle={styles.card}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            <View style={styles.heading}>
              <View style={[styles.badge, { backgroundColor: alpha(accent, 0.16) }]}>
                <Icon name="sliders" size={22} color={accent} />
              </View>
              <View style={styles.headingCopy}>
                <Text style={[type.titleLg, styles.title]}>Game menu</Text>
                <Text style={[type.bodySm, styles.subtitle]}>Rules and feedback controls stay one tap away.</Text>
              </View>
            </View>

            <PrimaryButton label="Back to game" icon="chevronRight" onPress={onClose} />
            <SecondaryButton label="How to play" icon="book" onPress={onShowRules} />

            <View style={styles.divider} />
            <Toggle
              label="Sound"
              hint="Gameplay cues and effects"
              value={settings.soundEnabled}
              onPress={() => setSoundEnabled(!settings.soundEnabled)}
              accent={accent}
            />
            <View style={styles.divider} />
            <Toggle
              label="Vibration"
              hint="Feedback on taps, reveals, and votes"
              value={settings.vibrationEnabled}
              onPress={() => setVibrationEnabled(!settings.vibrationEnabled)}
              accent={accent}
            />

            {canRestart ? (
              <>
                <View style={styles.divider} />
                <SecondaryButton label="Restart round" icon="refresh" onPress={onRestart} />
              </>
            ) : null}

            <PressableScale
              accessibilityRole="button"
              accessibilityLabel="End game"
              onPress={onEnd}
              haptic="selection"
              scaleTo={0.98}
              style={styles.endButton}
            >
              <Icon name="close" size={17} color={color.dangerUrgency} strokeWidth={2.4} />
              <Text style={[type.button, styles.endLabel]}>End game</Text>
            </PressableScale>
          </ScrollView>
        </Surface>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    padding: space[6],
  },
  scrim: {
    backgroundColor: overlay.scrim,
  },
  wrap: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '88%',
    alignSelf: 'center',
  },
  card: {
    padding: space[5],
  },
  content: {
    gap: space[3],
  },
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    marginBottom: space[2],
  },
  badge: {
    width: 44,
    height: 44,
    borderRadius: radius.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headingCopy: {
    flex: 1,
    gap: 2,
  },
  title: {
    color: color.textPrimary,
  },
  subtitle: {
    color: color.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: color.borderSubtle,
  },
  endButton: {
    minHeight: 52,
    borderRadius: radius.medium,
    borderWidth: 1,
    borderColor: alpha(color.dangerUrgency, 0.35),
    backgroundColor: alpha(color.dangerUrgency, 0.08),
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: space[2],
    marginTop: space[1],
  },
  endLabel: {
    color: color.dangerUrgency,
  },
});
