import { router, useLocalSearchParams } from 'expo-router';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { Icon, type IconName } from '../../../../src/components/ui/Icon';
import { PressableScale } from '../../../../src/components/ui/PressableScale';
import { SecondaryButton } from '../../../../src/components/ui/SecondaryButton';
import { SetupScreen } from '../../../../src/components/ui/SetupScreen';
import { countBombCards, getBombCategories } from '../../../../src/content/bomb';
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
import { countQuizQuestions, getQuizCategories } from '../../../../src/content/quiz';
import { useGameSetup } from '../../../../src/domain/useGameSetup';
import { useSettings } from '../../../../src/domain/settings/SettingsContext';
import type { ContentLevel } from '../../../../src/domain/impostor/types';
import type { QuizSetup } from '../../../../src/domain/quiz/types';
import { useT } from '../../../../src/i18n';
import { localizeText } from '../../../../src/content/localize';
import { useEnterAnimation } from '../../../../src/theme/motion';
import { alpha, color, glow, overlay, radius, space } from '../../../../src/theme/tokens';
import { type } from '../../../../src/theme/typography';

// One shared icon set, keyed by the standardized category vocabulary — every
// game now draws from the same category ids (see content/categories/*.json),
// so a single map keeps icons consistent instead of six near-duplicate ones.
const CATEGORY_ICONS: Record<string, IconName> = {
  everyday_life: 'home',
  food_and_drink: 'utensils',
  entertainment_pop_culture: 'film',
  football: 'target',
  sports: 'trophy',
  places_and_travel: 'mapPin',
  school_and_work: 'book',
  people_and_relationships: 'users',
  ethiopia_and_culture: 'mapPin',
  animals_and_nature: 'smile',
  random: 'shuffle',
  general_knowledge: 'question',
  geography_places: 'mapPin',
  history: 'book',
  science_technology: 'question',
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
    isBomb,
    isQuiz,
  } = useGameSetup(gameId);
  const { settings } = useSettings();

  const categories = isQuiz
    ? getQuizCategories()
    : isBomb
      ? getBombCategories()
    : isWouldRather
      ? getWouldRatherCategories()
    : isMostLikely
    ? getMostLikelyCategories()
    : isTaboo
      ? getTabooCategories()
      : isLiar
        ? getLiarCategories()
        : getImpostorCategories();
  const levels: ContentLevel[] = setup.contentLevels.length
    ? setup.contentLevels
    : ['family'];

  const lang = settings.contentLanguage;
  const countFor = (categoryIds: string[]) =>
    isQuiz
      ? countQuizQuestions({
          categoryIds,
          difficulty: (setup as QuizSetup).difficulty,
          contentLanguage: lang,
        })
      : isBomb
        ? countBombCards({
          categoryIds,
          contentLevels: levels,
          contentLanguage: lang,
        })
      : isWouldRather
        ? countWouldRatherDilemmas({
          categoryIds,
          contentLevels: levels,
          contentLanguage: lang,
        })
      : isMostLikely
        ? countMostLikelyPrompts({
            categoryIds,
            contentLevels: levels,
            contentLanguage: lang,
          })
        : isTaboo
          ? countTabooCards({
              categoryIds,
              contentLevels: levels,
              contentLanguage: lang,
            })
          : isLiar
            ? countLiarPairs({
                categoryIds,
                contentLevels: levels,
                contentLanguage: lang,
              })
            : countImpostorWords({
                categoryIds,
                contentLevels: levels,
                contentLanguage: lang,
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
              icon={CATEGORY_ICONS[category.id] ?? 'layers'}
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
