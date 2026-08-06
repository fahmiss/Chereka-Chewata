import { getImpostorCategories } from './impostor';
import { localizeText } from './localize';
import { getLiarCategories } from './liar';
import { getMostLikelyCategories } from './mostLikely';
import { getTabooCategories } from './taboo';
import { getWouldRatherCategories } from './wouldRather';
import type { ContentLanguage } from '../domain/settings/types';

export function getCategoryName(
  categoryId: string,
  language: ContentLanguage = 'en',
): string {
  const category =
    getImpostorCategories().find((item) => item.id === categoryId) ??
    getLiarCategories().find((item) => item.id === categoryId) ??
    getTabooCategories().find((item) => item.id === categoryId) ??
    getMostLikelyCategories().find((item) => item.id === categoryId) ??
    getWouldRatherCategories().find((item) => item.id === categoryId);

  if (!category) return 'Category';
  return localizeText(language, {
    en: category.name_en,
    am: category.name_am,
  });
}
