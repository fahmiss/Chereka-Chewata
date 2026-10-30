import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useT } from '../../i18n';
import { color, space } from '../../theme/tokens';
import { family } from '../../theme/typography';
import { IconButton } from './Screen';

type Props = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  /** Sits top-right, level with the eyebrow (e.g. a small text action). */
  action?: ReactNode;
};

/**
 * Heading for screens opened from the home header (Players, Settings): a back
 * button, then the page title in the same voice as the home screen labels.
 */
export function PageHeader({ eyebrow, title, subtitle, action }: Props) {
  const { t, uiFont } = useT();
  const font = uiFont ? { fontFamily: uiFont } : null;

  return (
    <View style={styles.root}>
      <View style={styles.topRow}>
        <IconButton
          name="arrowLeft"
          label={t('common.back')}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/home'))}
        />
        {action}
      </View>
      {eyebrow ? <Text style={[styles.eyebrow, font]}>{eyebrow}</Text> : null}
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
    marginBottom: space[3],
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
