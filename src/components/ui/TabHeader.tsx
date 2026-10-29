import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useT } from '../../i18n';
import { color, space } from '../../theme/tokens';
import { family } from '../../theme/typography';

type Props = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  /** Sits top-right, level with the eyebrow (e.g. a small text action). */
  action?: ReactNode;
};

/** Page heading for the top-level tabs — same voice as the home screen labels. */
export function TabHeader({ eyebrow, title, subtitle, action }: Props) {
  const { uiFont } = useT();
  const font = uiFont ? { fontFamily: uiFont } : null;

  return (
    <View style={styles.root}>
      {eyebrow || action ? (
        <View style={styles.topRow}>
          {eyebrow ? <Text style={[styles.eyebrow, font]}>{eyebrow}</Text> : <View />}
          {action}
        </View>
      ) : null}
      <Text style={[styles.title, font]}>{title}</Text>
      {subtitle ? <Text style={[styles.subtitle, font]}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: space[2],
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 24,
  },
  eyebrow: {
    color: color.brandPrimary,
    fontFamily: family.grotesque.semibold,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  title: {
    color: color.textPrimary,
    fontFamily: family.grotesque.bold,
    fontSize: 30,
    lineHeight: 36,
    letterSpacing: -0.6,
  },
  subtitle: {
    color: color.textSecondary,
    fontFamily: family.grotesque.medium,
    fontSize: 15,
    lineHeight: 22,
  },
});
