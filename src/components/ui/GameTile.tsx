import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';
import type { GameCatalogEntry } from '../../domain/games';
import { alpha, color, overlay, radius, space } from '../../theme/tokens';
import { type } from '../../theme/typography';
import { GAME_MOON_EXPRESSION } from '../brand/gameMoonExpression';
import { MoonFace } from '../brand/MoonFace';
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
 * Compact home game surface. Every playable title stays visible and easy to
 * scan; one consistent mascot changes pose to communicate each mechanic.
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
          colors={[alpha(accent, 0.1), alpha(accent, 0.025), color.surface]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0.8 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.body}>
          <View style={styles.mascotFrame}>
            <MoonFace expression={GAME_MOON_EXPRESSION[game.id]} size={64} />
          </View>

          <Text style={[type.titleLg, styles.name]} numberOfLines={2}>
            {game.name}
          </Text>

          <View style={[styles.arrow, { borderColor: alpha(accent, 0.24) }]}>
            <Icon name="chevronRight" size={19} color={color.textSecondary} strokeWidth={2.2} />
          </View>
        </View>
      </PressableScale>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    borderRadius: radius.large,
    borderWidth: 1,
    overflow: 'hidden',
    backgroundColor: color.surface,
    minHeight: 92,
  },
  locked: {
    opacity: 0.72,
  },
  body: {
    minHeight: 92,
    paddingHorizontal: space[4],
    paddingVertical: space[3],
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
  },
  mascotFrame: {
    width: 64,
    height: 66,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    color: color.textPrimary,
    flex: 1,
    lineHeight: 25,
  },
  nameMuted: {
    color: color.textSecondary,
  },
  taglineMuted: {
    color: color.textMuted,
  },
  arrow: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    borderWidth: 1,
    backgroundColor: overlay.glass,
    alignItems: 'center',
    justifyContent: 'center',
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
