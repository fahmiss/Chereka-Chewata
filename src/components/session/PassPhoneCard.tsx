import { Animated, StyleSheet, Text, View } from 'react-native';
import { useEnterAnimation } from '../../theme/motion';
import { seatColor } from '../../theme/seats';
import { alpha, color, glow, radius, space } from '../../theme/tokens';
import { family, type } from '../../theme/typography';

type Props = {
  name: string;
  /** 1-based position in this pass round. */
  index: number;
  total: number;
  accent: string;
  note?: string;
};

/** Above this many players the dots get too small to read; show a count. */
const MAX_PIPS = 16;

/**
 * Pass-the-phone body: who's next, big enough to read across the table.
 * The player wears their seat colour from the Players tab; progress uses
 * the game colour. No secrets on this screen.
 */
export function PassPhoneCard({
  name,
  index,
  total,
  accent,
  note = 'Face the screen away from the table. Nobody else should see.',
}: Props) {
  const enter = useEnterAnimation(1, 20);
  const seat = seatColor(index - 1);
  const initial = name.trim().charAt(0).toUpperCase() || String(index);

  return (
    <Animated.View style={[styles.root, enter]}>
      <View
        style={[
          styles.avatar,
          { backgroundColor: alpha(seat, 0.16), borderColor: alpha(seat, 0.55) },
          glow(seat, 0.4, 26),
        ]}
      >
        <Text style={[styles.initial, { color: seat }]}>{initial}</Text>
      </View>

      <Text style={[type.eyebrow, styles.label]}>Hand the phone to</Text>
      <Text style={styles.name} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.6}>
        {name}
      </Text>

      {total <= MAX_PIPS ? (
        <View
          style={styles.pips}
          accessible
          accessibilityLabel={`Player ${index} of ${total}`}
        >
          {Array.from({ length: total }, (_, i) => (
            <View
              key={i}
              style={[
                styles.pip,
                i < index
                  ? { backgroundColor: accent, width: i === index - 1 ? 18 : 8 }
                  : { backgroundColor: alpha(color.textPrimary, 0.16) },
              ]}
            />
          ))}
        </View>
      ) : (
        <Text style={[type.numeric, { color: accent }]}>
          {index} / {total}
        </Text>
      )}

      <Text style={[type.bodySm, styles.note]}>{note}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: space[3],
  },
  avatar: {
    width: 104,
    height: 104,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space[3],
  },
  initial: {
    fontFamily: family.brush.regular,
    fontSize: 52,
    lineHeight: 60,
    // Knewave leans right; nudge back to optical centre.
    marginLeft: -2,
  },
  label: {
    color: color.textMuted,
  },
  name: {
    color: color.textPrimary,
    fontFamily: family.brush.regular,
    fontSize: 58,
    lineHeight: 66,
    textAlign: 'center',
    textTransform: 'uppercase',
    paddingHorizontal: 6,
  },
  pips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
    marginTop: space[1],
  },
  pip: {
    width: 8,
    height: 8,
    borderRadius: radius.pill,
  },
  note: {
    color: color.textMuted,
    textAlign: 'center',
    marginTop: space[4],
    maxWidth: 300,
  },
});
