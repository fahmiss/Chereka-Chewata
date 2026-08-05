import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { alpha, color, radius } from '../../theme/tokens';
import { type } from '../../theme/typography';
import { Icon, type IconName } from './Icon';

type MetaProps = {
  icon: IconName;
  label: string;
  tint?: string;
};

/** Icon + value pair used for player counts, durations, card counts. */
export function MetaChip({ icon, label, tint = color.textMuted }: MetaProps) {
  return (
    <View style={styles.meta}>
      <Icon name={icon} size={14} color={tint} strokeWidth={2.2} />
      <Text style={[type.mono, { color: tint }]}>{label}</Text>
    </View>
  );
}

type PillProps = {
  label: string;
  tint?: string;
  icon?: IconName;
  style?: StyleProp<ViewStyle>;
};

/** Small status marker — HERO, SOON, step counters. */
export function Pill({ label, tint = color.brandPrimary, icon, style }: PillProps) {
  return (
    <View
      style={[
        styles.pill,
        { backgroundColor: alpha(tint, 0.14), borderColor: alpha(tint, 0.32) },
        style,
      ]}
    >
      {icon ? <Icon name={icon} size={12} color={tint} strokeWidth={2.4} /> : null}
      <Text style={[type.eyebrow, { color: tint }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
});
