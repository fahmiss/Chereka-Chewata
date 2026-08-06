import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Animated, StyleSheet, Text, TextInput, View } from 'react-native';
import { Icon } from '../../../../src/components/ui/Icon';
import { PressableScale } from '../../../../src/components/ui/PressableScale';
import { SecondaryButton } from '../../../../src/components/ui/SecondaryButton';
import { SetupScreen } from '../../../../src/components/ui/SetupScreen';
import { useGameSetup } from '../../../../src/domain/useGameSetup';
import { IMPOSTOR_MAX_PLAYERS, IMPOSTOR_MIN_PLAYERS } from '../../../../src/domain/impostor/types';
import { MOST_LIKELY_MAX_PLAYERS } from '../../../../src/domain/mostLikely/types';
import { TABOO_MAX_PLAYERS, TABOO_MIN_PLAYERS } from '../../../../src/domain/taboo/types';
import { useT } from '../../../../src/i18n';
import { useEnterAnimation } from '../../../../src/theme/motion';
import { alpha, color, glow, overlay, radius, space } from '../../../../src/theme/tokens';
import { type } from '../../../../src/theme/typography';

type RowProps = {
  index: number;
  name: string;
  accent: string;
  canRemove: boolean;
  onChange: (text: string) => void;
  onRemove: () => void;
};

function PlayerRow({
  index,
  name,
  accent,
  canRemove,
  onChange,
  onRemove,
}: RowProps) {
  const [focused, setFocused] = useState(false);
  const enter = useEnterAnimation(index);

  return (
    <Animated.View
      style={[
        styles.playerRow,
        enter,
        {
          borderColor: focused ? alpha(accent, 0.6) : color.borderSubtle,
          backgroundColor: focused ? alpha(accent, 0.1) : overlay.glass,
        },
        focused ? glow(accent, 0.25, 14) : null,
      ]}
    >
      <View style={styles.seat}>
        <Text style={[type.numeric, styles.seatText]}>
          {String(index + 1).padStart(2, '0')}
        </Text>
      </View>

      <TextInput
        value={name}
        onChangeText={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={`Player ${index + 1}`}
        placeholderTextColor={color.textMuted}
        selectTextOnFocus
        style={[type.titleMd, styles.input]}
        autoCapitalize="words"
        maxLength={24}
        accessibilityLabel={`Player ${index + 1} name`}
      />

      <View style={styles.rowActions}>
        <MiniButton
          icon="close"
          label={`Remove player ${index + 1}`}
          tint={color.dangerUrgency}
          disabled={!canRemove}
          onPress={onRemove}
        />
      </View>
    </Animated.View>
  );
}

function MiniButton({
  icon,
  label,
  onPress,
  disabled,
  tint,
}: {
  icon: 'close';
  label: string;
  onPress: () => void;
  disabled?: boolean;
  tint?: string;
}) {
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      haptic="selection"
      scaleTo={0.9}
      style={[styles.mini, disabled && styles.miniDisabled]}
    >
      <Icon name={icon} size={16} color={tint ?? color.textSecondary} strokeWidth={2.4} />
    </PressableScale>
  );
}

export default function PlayerSetupScreen() {
  const { gameId } = useLocalSearchParams<{ gameId: string }>();
  const { t } = useT();
  const {
    setup,
    addPlayer,
    removePlayer,
    renamePlayer,
    fillDefaultNames,
    useLastGroup,
    validation,
    accent,
    isTaboo,
    isMostLikely,
  } = useGameSetup(gameId);
  const MIN = isMostLikely ? 0 : isTaboo ? TABOO_MIN_PLAYERS : IMPOSTOR_MIN_PLAYERS;
  const MAX = isMostLikely
    ? MOST_LIKELY_MAX_PLAYERS
    : isTaboo
      ? TABOO_MAX_PLAYERS
      : IMPOSTOR_MAX_PLAYERS;

  const names = setup.players.map((player) => player.displayName.trim().toLowerCase());
  const hasDuplicates = names.some(
    (name, index) => name.length > 0 && names.indexOf(name) !== index,
  );
  const atLimit = setup.players.length >= MAX;

  return (
    <SetupScreen
      stepLabel={t('setup.players')}
      title={t('setup.playersTitle')}
      subtitle={
        isMostLikely
          ? 'Optional. Physical pointing works with no names.'
          : t('setup.playersSubtitle', { min: MIN, max: MAX })
      }
      accent={accent}
      primaryLabel="Done"
      primaryDisabled={!validation.playersOk}
      footerNote={
        !validation.playersOk
          ? isMostLikely
            ? 'Clear blank names or remove empty seats.'
            : `Add at least ${MIN} players with names.`
          : hasDuplicates
            ? 'Duplicate names work, but voting gets confusing.'
            : isMostLikely && setup.players.length === 0
              ? 'You can continue without names.'
              : undefined
      }
      onPrimary={() => router.back()}
    >
      <View style={styles.quickRow}>
        <SecondaryButton
          label="Player 1, 2…"
          icon="users"
          onPress={fillDefaultNames}
          style={styles.half}
        />
        <SecondaryButton
          label="Last group"
          icon="refresh"
          onPress={() => {
            void useLastGroup();
          }}
          style={styles.half}
        />
      </View>

      <View style={styles.countRow}>
        <Text style={[type.eyebrow, styles.countLabel]}>At the table</Text>
        <Text style={[type.numeric, { color: accent }]}>
          {setup.players.length}/{MAX}
        </Text>
      </View>

      {setup.players.map((player, index) => (
        <PlayerRow
          key={player.id}
          index={index}
          accent={accent}
          name={player.displayName}
          canRemove={isMostLikely ? setup.players.length > 0 : setup.players.length > MIN}
          onChange={(text) => renamePlayer(player.id, text)}
          onRemove={() => removePlayer(player.id)}
        />
      ))}

      <SecondaryButton
        label={atLimit ? 'Player limit reached' : 'Add player'}
        icon={atLimit ? 'lock' : 'plus'}
        onPress={addPlayer}
        disabled={atLimit}
      />
    </SetupScreen>
  );
}

const styles = StyleSheet.create({
  quickRow: {
    flexDirection: 'row',
    gap: space[3],
  },
  half: {
    flex: 1,
  },
  countRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: space[2],
  },
  countLabel: {
    color: color.textMuted,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    borderRadius: radius.medium,
    borderWidth: 1,
    paddingHorizontal: space[3],
    paddingVertical: space[2],
    minHeight: 60,
  },
  seat: {
    width: 30,
    alignItems: 'center',
  },
  seatText: {
    color: color.textMuted,
  },
  input: {
    flex: 1,
    color: color.textPrimary,
    paddingVertical: space[3],
  },
  rowActions: {
    flexDirection: 'row',
    gap: 4,
  },
  mini: {
    width: 34,
    height: 34,
    borderRadius: radius.small,
    backgroundColor: overlay.glassStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniDisabled: {
    opacity: 0.25,
  },
});
