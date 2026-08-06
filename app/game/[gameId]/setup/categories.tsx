import { router, useLocalSearchParams } from 'expo-router';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { Icon, type IconName } from '../../../../src/components/ui/Icon';
import { PressableScale } from '../../../../src/components/ui/PressableScale';
import { SecondaryButton } from '../../../../src/components/ui/SecondaryButton';
import { SetupScreen } from '../../../../src/components/ui/SetupScreen';
import {
  countImpostorWords,
  getImpostorCategories,
} from '../../../../src/content/impostor';
import { countLiarPairs, getLiarCategories } from '../../../../src/content/liar';
import {
  countMostLikelyPrompts,
  getMostLikelyCategories,
} from '../../../../src/content/mostLikely';
import { countTabooCards, getTabooCategories } from '../../../../src/content/taboo';
import { countWouldRatherDilemmas, getWouldRatherCategories } from '../../../../src/content/wouldRather';
import { useGameSetup } from '../../../../src/domain/useGameSetup';
import { useSettings } from '../../../../src/domain/settings/SettingsContext';
import type { ContentLevel } from '../../../../src/domain/impostor/types';
import { useT } from '../../../../src/i18n';
import { localizeText } from '../../../../src/content/localize';
import { useEnterAnimation } from '../../../../src/theme/motion';
import { alpha, color, glow, overlay, radius, space } from '../../../../src/theme/tokens';
import { type } from '../../../../src/theme/typography';

const IMPOSTOR_ICONS: Record<string, IconName> = {
  everyday_objects: 'box',
  food_and_drink: 'utensils',
  places: 'mapPin',
  entertainment: 'film',
  school_and_work: 'book',
  people_and_personality: 'smile',
  football: 'target',
};

const LIAR_ICONS: Record<string, IconName> = {
  food: 'utensils',
  addis_life: 'mapPin',
  friends: 'users',
  school_and_university: 'book',
  family: 'home',
  music_and_entertainment: 'film',
  travel: 'mapPin',
  relationships: 'smile',
  everyday_preferences: 'sliders',
};

const TABOO_ICONS: Record<string, IconName> = {
  ethiopian_food: 'utensils',
  everyday_life: 'home',
  places: 'mapPin',
  music_and_entertainment: 'film',
  school: 'book',
  jobs: 'target',
  animals: 'smile',
  sports: 'trophy',
  general_words: 'layers',
};

const LIKELY_ICONS: Record<string, IconName> = {
  friends: 'users',
  family: 'home',
  school_and_university: 'book',
  addis_life: 'mapPin',
  relationships: 'smile',
  work: 'target',
  diaspora: 'shuffle',
  weddings_and_events: 'users',
  general_funny: 'megaphone',
};

export default function CategoriesScreen() {
  const { gameId } = useLocalSearchParams<{ gameId: string }>();
  const { t, isAmharic } = useT();
  const {
    setup,
    toggleCategory,
    selectAllCategories,
    validation,
    accent,
    isLiar,
    isTaboo,
    isMostLikely,
    isWouldRather,
  } = useGameSetup(gameId);
  const { settings } = useSettings();

  const categories = isWouldRather
    ? getWouldRatherCategories()
    : isMostLikely
    ? getMostLikelyCategories()
    : isTaboo
      ? getTabooCategories()
      : isLiar
        ? getLiarCategories()
        : getImpostorCategories();
  const icons = isMostLikely
    ? LIKELY_ICONS
    : isTaboo
      ? TABOO_ICONS
      : isLiar
        ? LIAR_ICONS
        : IMPOSTOR_ICONS;
  const levels: ContentLevel[] = setup.contentLevels.length
    ? setup.contentLevels
    : ['family'];

  const countFor = (categoryIds: string[]) =>
    isWouldRather
      ? countWouldRatherDilemmas({ categoryIds, contentLevels: levels })
      : isMostLikely
      ? countMostLikelyPrompts({ categoryIds, contentLevels: levels })
      : isTaboo
        ? countTabooCards({ categoryIds, contentLevels: levels })
        : isLiar
          ? countLiarPairs({ categoryIds, contentLevels: levels })
          : countImpostorWords({
              categoryIds,
              contentLevels: levels,
              contentLanguage: settings.contentLanguage,
            });

  const totalCards = countFor(setup.categoryIds);
  const categoryLabel = (category: { name_en: string; name_am?: string }) =>
    localizeText(isAmharic ? 'am' : 'en', {
      en: category.name_en,
      am: category.name_am,
    });

  return (
    <SetupScreen
      stepLabel={t('setup.categories')}
      title={t('setup.categoriesTitle')}
      subtitle={t('setup.categoriesSubtitle')}
      accent={accent}
      primaryLabel="Done"
      primaryDisabled={!validation.categoriesOk}
      footerNote={!validation.categoriesOk ? 'Select at least one category.' : undefined}
      onPrimary={() => router.back()}
    >
      <View style={styles.topRow}>
        <View style={styles.tally}>
          <Text style={[type.displayMd, { color: accent }]}>{totalCards}</Text>
          <Text style={[type.mono, styles.tallyLabel]}>cards in the deck</Text>
        </View>
        <SecondaryButton
          label={t('setup.selectAll')}
          onPress={selectAllCategories}
          style={styles.selectAll}
        />
      </View>

      <View style={styles.grid}>
        {categories.map((category, index) => {
          const count = countFor([category.id]);
          return (
            <CategoryCard
              key={category.id}
              index={index}
              name={categoryLabel(category)}
              accent={accent}
              icon={icons[category.id] ?? 'layers'}
              count={count}
              selected={setup.categoryIds.includes(category.id)}
              onPress={() => toggleCategory(category.id)}
            />
          );
        })}
      </View>
    </SetupScreen>
  );
}

function CategoryCard({
  index,
  name,
  accent,
  icon,
  count,
  selected,
  onPress,
}: {
  index: number;
  name: string;
  accent: string;
  icon: IconName;
  count: number;
  selected: boolean;
  onPress: () => void;
}) {
  const enter = useEnterAnimation(index);

  return (
    <Animated.View style={[styles.cell, enter]}>
      <PressableScale
        accessibilityRole="checkbox"
        accessibilityState={{ checked: selected }}
        accessibilityLabel={`${name}, ${count} cards`}
        onPress={onPress}
        haptic="selection"
        scaleTo={0.97}
        style={[
          styles.card,
          {
            borderColor: selected ? alpha(accent, 0.6) : color.borderSubtle,
            backgroundColor: selected ? alpha(accent, 0.12) : overlay.glass,
          },
          selected ? glow(accent, 0.28, 16) : null,
        ]}
      >
        <View style={styles.cardTop}>
          <Icon
            name={icon}
            size={24}
            color={selected ? accent : color.textSecondary}
            strokeWidth={1.8}
          />
          <View
            style={[
              styles.tick,
              selected
                ? { backgroundColor: accent, borderColor: accent }
                : { borderColor: alpha(color.textPrimary, 0.24) },
            ]}
          >
            {selected ? (
              <Icon name="check" size={13} color={color.void} strokeWidth={3.2} />
            ) : null}
          </View>
        </View>
        <Text style={[type.titleMd, styles.cardName]} numberOfLines={2}>
          {name}
        </Text>
        <Text style={[type.mono, styles.cardMeta]}>{count} cards</Text>
      </PressableScale>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
  },
  tally: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: space[2],
    flex: 1,
  },
  tallyLabel: {
    color: color.textMuted,
    flexShrink: 1,
  },
  selectAll: {
    minHeight: 44,
    paddingHorizontal: space[4],
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space[3],
    marginTop: space[2],
  },
  cell: {
    width: '48%',
    flexGrow: 1,
  },
  card: {
    borderRadius: radius.medium,
    borderWidth: 1,
    padding: space[4],
    gap: space[2],
    minHeight: 124,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: space[1],
  },
  tick: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardName: {
    color: color.textPrimary,
  },
  cardMeta: {
    color: color.textMuted,
  },
});
