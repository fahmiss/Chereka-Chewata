import { useEffect, useRef } from 'react';
import { Animated, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { duration, easeOut, useReducedMotion } from '../../theme/motion';
import { alpha, color, overlay, radius, space } from '../../theme/tokens';
import { type } from '../../theme/typography';
import { MoonFace, type MoonExpression } from '../brand/MoonFace';
import { Icon, type IconName } from './Icon';
import { PrimaryButton, type ButtonTone } from './PrimaryButton';
import { SecondaryButton } from './SecondaryButton';
import { Surface } from './Surface';

type Props = {
  visible: boolean;
  icon?: IconName;
  /** Soft 3D mascot — when set, replaces the Lucide badge icon. */
  moon?: MoonExpression;
  accent?: string;
  title: string;
  message?: string;
  confirmLabel: string;
  onConfirm: () => void;
  confirmTone?: ButtonTone;
  /** Omit both for a single-button notice dialog. */
  cancelLabel?: string;
  onCancel?: () => void;
};

/**
 * Centred modal — the one screen element allowed to keep
 * `transform-origin: center`, since a dialog isn't anchored to a trigger.
 * Replaces `Alert.alert` so a stock system sheet never interrupts the
 * lit-room aesthetic. Enters from scale(0.94) + opacity, never scale(0).
 */
export function Dialog({
  visible,
  icon = 'alert',
  moon,
  accent = color.dangerUrgency,
  title,
  message,
  confirmLabel,
  onConfirm,
  confirmTone = 'danger',
  cancelLabel,
  onCancel,
}: Props) {
  const progress = useRef(new Animated.Value(0)).current;
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!visible) return;
    if (reduced) {
      progress.setValue(1);
      return;
    }
    progress.setValue(0);
    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: duration.modal,
      easing: easeOut,
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [visible, progress, reduced]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onCancel ?? onConfirm}
    >
      <View style={styles.root}>
        <Animated.View style={[StyleSheet.absoluteFill, styles.scrim, { opacity: progress }]} />
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onCancel}
          accessibilityLabel="Dismiss"
          accessibilityRole="button"
        />
        <Animated.View
          style={[
            styles.cardWrap,
            {
              opacity: progress,
              transform: [
                {
                  scale: progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.94, 1],
                  }),
                },
              ],
            },
          ]}
        >
          <Surface accent={accent} active contentStyle={styles.card}>
            {moon ? (
              <MoonFace expression={moon} size={56} glow={false} />
            ) : (
              <View
                style={[
                  styles.badge,
                  { backgroundColor: alpha(accent, 0.16), borderColor: alpha(accent, 0.4) },
                ]}
              >
                <Icon name={icon} size={24} color={accent} strokeWidth={1.9} />
              </View>
            )}
            <Text style={[type.titleLg, styles.title]}>{title}</Text>
            {message ? <Text style={[type.body, styles.message]}>{message}</Text> : null}
            <View style={styles.actions}>
              <PrimaryButton label={confirmLabel} tone={confirmTone} onPress={onConfirm} />
              {cancelLabel && onCancel ? (
                <SecondaryButton label={cancelLabel} quiet onPress={onCancel} />
              ) : null}
            </View>
          </Surface>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: space[6],
  },
  scrim: {
    backgroundColor: overlay.scrim,
  },
  cardWrap: {
    width: '100%',
    maxWidth: 360,
  },
  card: {
    padding: space[6],
    gap: space[2],
    alignItems: 'center',
  },
  badge: {
    width: 52,
    height: 52,
    borderRadius: radius.medium,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space[2],
  },
  title: {
    color: color.textPrimary,
    textAlign: 'center',
  },
  message: {
    color: color.textSecondary,
    textAlign: 'center',
    marginTop: space[1],
  },
  actions: {
    width: '100%',
    gap: space[2],
    marginTop: space[4],
  },
});
