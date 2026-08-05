import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { alpha, color, radius, space } from '../../theme/tokens';
import { type } from '../../theme/typography';
import { Backdrop } from './Backdrop';
import { Icon } from './Icon';
import { PrimaryButton } from './PrimaryButton';
import { ProgressRail } from './ProgressRail';
import { IconButton } from './Screen';

type Props = {
  /** 1-based position in the setup flow; omit on the review step. */
  step?: number;
  totalSteps?: number;
  stepLabel: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
  primaryLabel: string;
  onPrimary: () => void;
  primaryDisabled?: boolean;
  footerNote?: string;
  accent?: string;
};

/**
 * Shared setup chrome: a fixed header with visible flow progress, a scrolling
 * body that fades under the footer, and a pinned primary action.
 */
export function SetupScreen({
  step,
  totalSteps = 4,
  stepLabel,
  title,
  subtitle,
  children,
  primaryLabel,
  onPrimary,
  primaryDisabled,
  footerNote,
  accent = color.gameImpostor,
}: Props) {
  return (
    <View style={styles.root}>
      <Backdrop accent={accent} intensity={0.7} />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.top}>
          <View style={styles.navRow}>
            <IconButton name="arrowLeft" label="Back" onPress={() => router.back()} />
            <View style={styles.stepMeta}>
              <Text style={[type.eyebrow, { color: accent }]}>{stepLabel}</Text>
              {step ? (
                <Text style={[type.numeric, styles.stepCount]}>
                  {String(step).padStart(2, '0')}/{String(totalSteps).padStart(2, '0')}
                </Text>
              ) : null}
            </View>
          </View>

          {step ? (
            <ProgressRail activeIndex={step - 1} count={totalSteps} accent={accent} />
          ) : null}

          <View style={styles.heading}>
            <Text style={[type.displayLg, styles.title]}>{title}</Text>
            {subtitle ? <Text style={[type.body, styles.subtitle]}>{subtitle}</Text> : null}
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>

        <View style={styles.footer}>
          <LinearGradient
            colors={['transparent', color.void]}
            style={styles.footerScrim}
            pointerEvents="none"
          />
          {footerNote ? (
            <View style={styles.note}>
              <Icon name="alert" size={15} color={color.dangerUrgency} strokeWidth={2.2} />
              <Text style={[type.bodySm, styles.noteText]}>{footerNote}</Text>
            </View>
          ) : null}
          <PrimaryButton label={primaryLabel} onPress={onPrimary} disabled={primaryDisabled} />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: color.background,
  },
  safe: {
    flex: 1,
    paddingHorizontal: space[6],
  },
  top: {
    gap: space[4],
    paddingTop: space[2],
    paddingBottom: space[5],
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[4],
  },
  stepMeta: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepCount: {
    color: color.textMuted,
  },
  heading: {
    gap: space[2],
  },
  title: {
    color: color.textPrimary,
  },
  subtitle: {
    color: color.textSecondary,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: space[8],
    gap: space[3],
  },
  footer: {
    gap: space[3],
    paddingTop: space[3],
    paddingBottom: space[3],
  },
  footerScrim: {
    position: 'absolute',
    left: -space[6],
    right: -space[6],
    bottom: '100%',
    height: space[8],
  },
  note: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space[2],
    paddingHorizontal: space[4],
    paddingVertical: space[2],
    borderRadius: radius.pill,
    backgroundColor: alpha(color.dangerUrgency, 0.12),
  },
  noteText: {
    color: color.dangerUrgency,
    flexShrink: 1,
  },
});
