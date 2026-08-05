import { getImpostorCategories } from './impostor';
import { getLiarCategories } from './liar';
import { getMostLikelyCategories } from './mostLikely';
import { getTabooCategories } from './taboo';
import { getWouldRatherCategories } from './wouldRather';

export function getCategoryName(categoryId: string): string {
  return (
    getImpostorCategories().find((category) => category.id === categoryId)?.name_en ??
    getLiarCategories().find((category) => category.id === categoryId)?.name_en ??
    getTabooCategories().find((category) => category.id === categoryId)?.name_en ??
    getMostLikelyCategories().find((category) => category.id === categoryId)?.name_en ??
    getWouldRatherCategories().find((category) => category.id === categoryId)?.name_en ??
    'Category'
  );
}
