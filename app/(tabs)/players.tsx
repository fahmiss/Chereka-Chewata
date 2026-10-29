import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { Animated, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { MoonFace } from '../../src/components/brand/MoonFace';
import { Dialog } from '../../src/components/ui/Dialog';
import { Icon } from '../../src/components/ui/Icon';
import { PressableScale } from '../../src/components/ui/PressableScale';
import { Screen } from '../../src/components/ui/Screen';
import { useTabBarClearance } from '../../src/components/ui/TabBar';
import { TabHeader } from '../../src/components/ui/TabHeader';
import type { Player } from '../../src/domain/impostor/types';
import { createId } from '../../src/domain/shared/utils';
import { useT } from '../../src/i18n';
import {
  loadLastPlayerGroup,
  SAVED_PLAYERS_MAX,
  saveLastPlayerGroup,
} from '../../src/storage/players';
import { useEnterAnimation } from '../../src/theme/motion';
import { alpha, color, glow, overlay, radius, space } from '../../src/theme/tokens';
import { family } from '../../src/theme/typography';

/** Each seat borrows a game colour, so the list reads as people, not a form. */
const SEAT_COLORS = [
  color.gameImpostor,
  color.gameLiar,
  color.gameMostLikely,
  color.gameTaboo,
  color.gameWouldRather,
  color.gameQuiz,
  color.gameMizan,
  color.gameWinkKiller,
  color.gameGimbar,
  color.gameMesob,
  color.gameInsider,
  color.gameBomb,
];

/**
 * The saved table. Every game's setup starts from this group, and starting a
 * game writes its players back here — one shared list, edited from either side.
 */
export default function PlayersScreen() {
  const { t, uiFont } = useT();
  const clearance = useTabBarClearance();
  const [players, setPlayers] = useState<Player[] | null>(null);
  const [draft, setDraft] = useState('');
  const [clearVisible, setClearVisible] = useState(false);
  const addInput = useRef<TextInput>(null);
  const font = uiFont ? { fontFamily: uiFont } : null;

  // Reload on focus: a game started since last visit may have changed the group.
  useFocusEffect(
    useCallback(() => {
      let active = true;
      void loadLastPlayerGroup().then((group) => {
        if (active) setPlayers(group ?? []);
      });
      return () => {
        active = false;
      };
    }, []),
  );

  const update = (next: Player[]) => {
    setPlayers(next);
    void saveLastPlayerGroup(next.filter((player) => player.displayName.trim()));
  };

  const list = players ?? [];
  const atLimit = list.length >= SAVED_PLAYERS_MAX;
  const names = list.map((player) => player.displayName.trim().toLowerCase());
  const hasDuplicates = names.some((name, index) => name && names.indexOf(name) !== index);

  const addDraft = () => {
    const name = draft.trim();
    if (!name || atLimit) return;
    update([...list, { id: createId('p'), displayName: name }]);
    setDraft('');
  };

  return (
    <Screen edges={['top']} accent={color.brandPrimary} intensity={0.8}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: clearance }]}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
        showsVerticalScrollIndicator={false}
      >
        <TabHeader
          eyebrow={t('players.eyebrow')}
          title={t('players.title')}
          subtitle={t('players.subtitle')}
          action={
            list.length > 0 ? (
              <PressableScale
                accessibilityRole="button"
                onPress={() => setClearVisible(true)}
                haptic="selection"
                scaleTo={0.94}
                style={styles.clear}
              >
                <Text style={[styles.clearText, font]}>{t('players.clear')}</Text>
              </PressableScale>
            ) : null
          }
        />

        {players && list.length === 0 ? (
          <View style={styles.empty}>
            <MoonFace expression="pointing" size={96} />
            <Text style={[styles.emptyTitle, font]}>{t('players.emptyTitle')}</Text>
            <Text style={[styles.emptyBody, font]}>{t('players.emptyBody')}</Text>
          </View>
        ) : null}

        {list.length > 0 ? (
          <View style={styles.countRow}>
            <Text style={[styles.countLabel, font]}>{t('players.atTable')}</Text>
            <Text style={styles.count}>
              {list.length}/{SAVED_PLAYERS_MAX}
            </Text>
          </View>
        ) : null}

        <View style={styles.list}>
          {list.map((player, index) => (
            <PlayerRow
              key={player.id}
              index={index}
              name={player.displayName}
              label={t('players.rename', { n: index + 1 })}
              removeLabel={t('players.remove', {
                name: player.displayName.trim() || String(index + 1),
              })}
              onChange={(displayName) =>
                update(list.map((item) => (item.id === player.id ? { ...item, displayName } : item)))
              }
              onRemove={() => update(list.filter((item) => item.id !== player.id))}
            />
          ))}
        </View>

        {players ? (
          <View style={[styles.addRow, atLimit && styles.addRowDisabled]}>
            <TextInput
              ref={addInput}
              value={draft}
              onChangeText={setDraft}
              onSubmitEditing={() => {
                addDraft();
                // Keep the keyboard up so a whole table can be typed in one go.
                addInput.current?.focus();
              }}
              submitBehavior="submit"
              editable={!atLimit}
              placeholder={t('players.addPlaceholder')}
              placeholderTextColor={color.textMuted}
              returnKeyType="done"
              autoCapitalize="words"
              autoCorrect={false}
              maxLength={24}
              style={[styles.addInput, font]}
              accessibilityLabel={t('players.addPlaceholder')}
            />
            <PressableScale
              accessibilityRole="button"
              accessibilityLabel={t('players.add')}
              accessibilityState={{ disabled: !draft.trim() || atLimit }}
              disabled={!draft.trim() || atLimit}
              onPress={addDraft}
              haptic="light"
              scaleTo={0.9}
              style={[styles.addButton, (!draft.trim() || atLimit) && styles.addButtonIdle]}
            >
              <Icon name="plus" size={20} color={color.void} strokeWidth={2.6} />
            </PressableScale>
          </View>
        ) : null}

        {atLimit ? (
          <Text style={[styles.note, font]}>
            {t('players.limit', { max: SAVED_PLAYERS_MAX })}
          </Text>
        ) : hasDuplicates ? (
          <Text style={[styles.note, font]}>{t('players.duplicates')}</Text>
        ) : null}
      </ScrollView>

      <Dialog
        visible={clearVisible}
        icon="users"
        accent={color.dangerUrgency}
        title={t('players.clearTitle')}
        message={t('players.clearMessage')}
        confirmLabel={t('players.clearConfirm')}
        confirmTone="danger"
        onConfirm={() => {
          update([]);
          setClearVisible(false);
        }}
        cancelLabel={t('common.back')}
        onCancel={() => setClearVisible(false)}
      />
    </Screen>
  );
}

type RowProps = {
  index: number;
  name: string;
  label: string;
  removeLabel: string;
  onChange: (name: string) => void;
  onRemove: () => void;
};

function PlayerRow({ index, name, label, removeLabel, onChange, onRemove }: RowProps) {
  const [focused, setFocused] = useState(false);
  const enter = useEnterAnimation(index);
  const seat = SEAT_COLORS[index % SEAT_COLORS.length]!;
  const initial = name.trim().charAt(0).toUpperCase() || String(index + 1);

  return (
    <Animated.View
      style={[
        styles.row,
        enter,
        {
          borderColor: focused ? alpha(seat, 0.55) : overlay.hairline,
          borderTopColor: focused ? alpha(seat, 0.55) : overlay.hairlineTop,
          backgroundColor: focused ? alpha(seat, 0.1) : overlay.glass,
        },
        focused ? glow(seat, 0.25, 14) : null,
      ]}
    >
      <View
        style={[
          styles.avatar,
          { backgroundColor: alpha(seat, 0.18), borderColor: alpha(seat, 0.45) },
        ]}
      >
        <Text style={[styles.avatarText, { color: seat }]}>{initial}</Text>
      </View>
      <TextInput
        value={name}
        onChangeText={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={`Player ${index + 1}`}
        placeholderTextColor={color.textMuted}
        autoCapitalize="words"
        autoCorrect={false}
        maxLength={24}
        style={styles.input}
        accessibilityLabel={label}
      />
      <PressableScale
        accessibilityRole="button"
        accessibilityLabel={removeLabel}
        onPress={onRemove}
        haptic="selection"
        scaleTo={0.9}
        style={styles.remove}
      >
        <Icon name="close" size={16} color={color.textMuted} strokeWidth={2.4} />
      </PressableScale>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: space[4],
    paddingTop: space[4],
    gap: space[4],
  },
  clear: {
    paddingHorizontal: space[3],
    paddingVertical: space[1],
    borderRadius: radius.pill,
    backgroundColor: overlay.glass,
  },
  clearText: {
    color: color.textSecondary,
    fontFamily: family.grotesque.semibold,
    fontSize: 13,
    lineHeight: 18,
  },
  empty: {
    alignItems: 'center',
    gap: space[2],
    paddingVertical: space[6],
  },
  emptyTitle: {
    color: color.textPrimary,
    fontFamily: family.grotesque.bold,
    fontSize: 19,
    lineHeight: 24,
    marginTop: space[2],
  },
  emptyBody: {
    color: color.textSecondary,
    fontFamily: family.grotesque.medium,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    maxWidth: 260,
  },
  countRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: space[2],
  },
  countLabel: {
    color: color.textSecondary,
    fontFamily: family.grotesque.semibold,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  count: {
    color: color.brandPrimary,
    fontFamily: family.grotesque.bold,
    fontSize: 14,
    lineHeight: 18,
  },
  list: {
    gap: space[2],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    minHeight: 60,
    paddingLeft: space[3],
    paddingRight: space[2],
    borderRadius: radius.medium,
    borderWidth: 1,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: family.grotesque.bold,
    fontSize: 15,
    lineHeight: 18,
  },
  input: {
    flex: 1,
    color: color.textPrimary,
    fontFamily: family.grotesque.medium,
    fontSize: 17,
    paddingVertical: space[3],
  },
  remove: {
    width: 36,
    height: 36,
    borderRadius: radius.small,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
    minHeight: 60,
    paddingLeft: space[4],
    paddingRight: space[2],
    borderRadius: radius.medium,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: alpha(color.brandPrimary, 0.4),
    backgroundColor: alpha(color.brandPrimary, 0.05),
  },
  addRowDisabled: {
    opacity: 0.4,
  },
  addInput: {
    flex: 1,
    color: color.textPrimary,
    fontFamily: family.grotesque.medium,
    fontSize: 17,
    paddingVertical: space[3],
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: color.brandPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    ...glow(color.brandPrimary, 0.35, 12),
  },
  addButtonIdle: {
    opacity: 0.35,
  },
  note: {
    color: color.textMuted,
    fontFamily: family.grotesque.medium,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
});
