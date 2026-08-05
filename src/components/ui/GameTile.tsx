import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';
import type { GameCatalogEntry } from '../../domain/games';
import { alpha, color, overlay, radius, space } from '../../theme/tokens';
import { type } from '../../theme/typography';
import { Pill } from './Chip';
import { Icon } from './Icon';
import { PressableScale } from './PressableScale';

type Props = {
  game: GameCatalogEntry;
  /** Quiet row for unreleased games — never used for playable titles. */
  compact?: boolean;
  onPress: () => void;
};

/**
 * Home game surface. Playable games share one equal card language —
 * no featured/hero size hierarchy between titles.
 */
export function GameTile({ game, compact, onPress }: Props) {
  const locked = !game.playable;
  const accent = game.accent;

  if (compact) {
    return (
      <View>
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel={`${game.name}. ${game.tagline}${locked ? '. Coming soon' : ''}`}
          onPress={onPress}
          haptic="selection"
          scaleTo={0.98}
          style={[styles.compact, locked && styles.locked]}
        >
          <View
            style={[
              styles.compactIcon,
              {
                backgroundColor: alpha(accent, 0.08),
                borderColor: alpha(accent, 0.16),
              },
            ]}
          >
            <Icon name={game.icon} size={18} color={color.textMuted} strokeWidth={1.9} />
          </View>
          <View style={styles.compactCopy}>
            <Text style={[type.titleMd, styles.nameMuted]} numberOfLines={1}>
              {game.name}
            </Text>
            <Text style={[type.bodySm, styles.taglineMuted]} numberOfLines={1}>
              {game.tagline}
            </Text>
          </View>
          <Pill label="Soon" tint={color.textMuted} icon="lock" />
        </PressableScale>
      </View>
    );
  }

  return (
    <View>
      <PressableScale
        accessibilityRole="button"
        accessibilityLabel={`${game.name}. ${game.tagline}`}
        onPress={onPress}
        haptic="medium"
        scaleTo={0.97}
        style={[styles.tile, { borderColor: alpha(accent, 0.22) }]}
      >
        <LinearGradient
          colors={[alpha(accent, 0.075), color.surface]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.55, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.body}>
          <View style={styles.topRow}>
            <View
              style={[
                styles.medallion,
                {
                  backgroundColor: alpha(accent, 0.18),
                  borderColor: alpha(accent, 0.4),
                },
              ]}
            >
              <Icon name={game.icon} size={24} color={accent} strokeWidth={1.9} />
            </View>
            <Icon name="chevronRight" size={20} color={color.textMuted} strokeWidth={2} />
          </View>

          <View style={styles.copy}>
            <Text style={[type.displayMd, styles.name]} numberOfLines={1}>
              {game.name}
            </Text>
            <Text style={[type.body, styles.tagline]} numberOfLines={2}>
              {game.tagline}
            </Text>
          </View>

          <Text style={[type.mono, styles.meta]}>
            {game.playerCountLabel} · {game.sessionLengthLabel}
          </Text>
        </View>
      </PressableScale>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    borderRadius: radius.extraLarge,
    borderWidth: 1,
    overflow: 'hidden',
    backgroundColor: color.surface,
    minHeight: 168,
  },
  locked: {
    opacity: 0.72,
  },
  body: {
    padding: space[5],
    gap: space[4],
    minHeight: 168,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space[3],
  },
  medallion: {
    width: 42,
    height: 42,
    borderRadius: radius.small,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    gap: 6,
  },
  name: {
    color: color.textPrimary,
  },
  nameMuted: {
    color: color.textSecondary,
  },
  tagline: {
    color: color.textSecondary,
  },
  taglineMuted: {
    color: color.textMuted,
  },
  meta: {
    color: color.textMuted,
  },
  compact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    minHeight: 64,
    paddingHorizontal: space[3],
    paddingVertical: space[3],
    borderRadius: radius.medium,
    borderWidth: 1,
    borderColor: color.borderSubtle,
    backgroundColor: overlay.glass,
  },
  compactIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.small,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactCopy: {
    flex: 1,
    gap: 2,
  },
});
