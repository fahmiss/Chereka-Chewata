import { Animated, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { Player } from '../../domain/shared/types';
import { useEnterAnimation } from '../../theme/motion';
import { alpha, color, glow, overlay, radius, space } from '../../theme/tokens';
import { type } from '../../theme/typography';
import { Icon } from '../ui/Icon';
import { PressableScale } from '../ui/PressableScale';

type Props = {
  players: Player[];
  selectedId: string | null;
  onSelect: (playerId: string) => void;
  accent: string;
  /** Muted rows stay visible but cannot be picked (e.g. players already out). */
  disabledIds?: string[];
  /** Small trailing note per player, e.g. "Out". */
  noteFor?: (playerId: string) => string | undefined;
};

/** Scrollable single-choice list of players, shared by accuse and vote steps. */
export function PlayerPicker({
  players,
  selectedId,
  onSelect,
  accent,
  disabledIds = [],
  noteFor,
}: Props) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
      {players.map((player, index) => (
        <PlayerRow
          key={player.id}
          index={index}
          name={player.displayName}
          accent={accent}
          selected={selectedId === player.id}
          disabled={disabledIds.includes(player.id)}
          note={noteFor?.(player.id)}
          onPress={() => onSelect(player.id)}
        />
      ))}
    </ScrollView>
  );
}

function PlayerRow({
  name,
  selected,
  disabled,
  note,
  onPress,
  index,
  accent,
}: {
  name: string;
  selected: boolean;
  disabled: boolean;
  note?: string;
  onPress: () => void;
  index: number;
  accent: string;
}) {
  const enter = useEnterAnimation(index);
  const initial = name.trim().charAt(0).toUpperCase() || '?';

  return (
    <Animated.View style={enter}>
      <PressableScale
        accessibilityRole="radio"
        accessibilityState={{ selected, disabled }}
        accessibilityLabel={note ? `${name}, ${note}` : name}
        disabled={disabled}
        onPress={onPress}
        haptic="selection"
        scaleTo={0.98}
        style={[
          styles.row,
          {
            borderColor: selected ? alpha(accent, 0.6) : color.borderSubtle,
            backgroundColor: selected ? alpha(accent, 0.12) : overlay.glass,
          },
          selected ? glow(accent, 0.25, 14) : null,
          disabled && styles.disabled,
        ]}
      >
        <View
          style={[
            styles.avatar,
            {
              backgroundColor: alpha(accent, selected ? 0.24 : 0.12),
              borderColor: alpha(accent, selected ? 0.5 : 0.2),
            },
          ]}
        >
          <Text style={[type.titleMd, { color: selected ? accent : color.textSecondary }]}>
            {initial}
          </Text>
        </View>
        <Text style={[type.titleMd, styles.name]} numberOfLines={1}>
          {name}
        </Text>
        {note ? <Text style={[type.label, styles.note]}>{note}</Text> : null}
        <View
          style={[
            styles.radio,
            selected
              ? { backgroundColor: accent, borderColor: accent }
              : { borderColor: alpha(color.textPrimary, 0.26) },
          ]}
        >
          {selected ? <Icon name="check" size={14} color={color.void} strokeWidth={3} /> : null}
        </View>
      </PressableScale>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: space[2],
    paddingBottom: space[2],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    padding: space[3],
    borderRadius: radius.medium,
    borderWidth: 1,
  },
  disabled: {
    opacity: 0.38,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    color: color.textPrimary,
    flex: 1,
  },
  note: {
    color: color.textMuted,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: radius.pill,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
