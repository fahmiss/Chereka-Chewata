import { useEffect, useState, type ReactNode } from 'react';
import { AppState, StyleSheet, Text, View } from 'react-native';
import { color, space } from '../../theme/tokens';
import { type } from '../../theme/typography';
import { PrimaryButton } from '../ui/PrimaryButton';
import { Screen } from '../ui/Screen';

/** Preserves the in-memory draft, but covers private content until its owner resumes. */
export function PrivateScreenGuard({ name, accent, children }: { name: string; accent: string; children: ReactNode }) {
  const [covered, setCovered] = useState(AppState.currentState !== 'active');
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state !== 'active') setCovered(true);
    });
    return () => subscription.remove();
  }, []);
  return (
    <View style={styles.root}>
      <View style={[styles.root, covered && styles.hidden]} accessibilityElementsHidden={covered} importantForAccessibility={covered ? 'no-hide-descendants' : 'auto'}>{children}</View>
      {covered ? <Screen accent={accent} style={styles.cover}>
        <Text style={[type.displayMd, styles.title]}>Private screen hidden</Text>
        <Text style={[type.body, styles.body]}>Hand the phone back to {name}. Everyone else, look away before continuing.</Text>
        <PrimaryButton label={`I'm ${name} — resume`} icon="lock" onPress={() => setCovered(false)} />
      </Screen> : null}
    </View>
  );
}

const styles = StyleSheet.create({ root: { flex: 1 }, hidden: { display: 'none' }, cover: { flex: 1, padding: space[6], justifyContent: 'center', gap: space[5] }, title: { color: color.textPrimary }, body: { color: color.textSecondary } });
