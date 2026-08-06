import type { ContentLevel, LiarCategory, LiarPair } from '../domain/liar/types';
import categoriesJson from '../../content/categories/whos_the_liar.json';
import pairsJson from '../../content/whos_the_liar/pairs.en.json';
import { prioritizeFresh, recentIds, recordPlayed, reportedIds } from '../storage/contentHistory';

const categories = categoriesJson as LiarCategory[];
const pairs = pairsJson as LiarPair[];

export function getLiarCategories(): LiarCategory[] {
  return categories
    .filter((category) => category.active)
    .sort((a, b) => a.sort_order - b.sort_order);
}

export function getLiarPairs(options: {
  categoryIds: string[];
  contentLevels: ContentLevel[];
  excludeIds?: string[];
}): LiarPair[] {
  const exclude = new Set(options.excludeIds ?? []);
  const levels = new Set(options.contentLevels);
  const cats = new Set(options.categoryIds);

  return pairs.filter(
    (pair) =>
      pair.active &&
      cats.has(pair.category_id) &&
      levels.has(pair.content_level) &&
      !exclude.has(pair.id) && !reportedIds('whos_the_liar').has(pair.id),
  );
}

export function pickLiarPair(options: {
  categoryIds: string[];
  contentLevels: ContentLevel[];
  excludeIds?: string[];
}): LiarPair | null {
  const pool = prioritizeFresh(getLiarPairs(options), 'whos_the_liar');
  if (pool.length === 0) return null;
  const freshCount = pool.filter((item) => !recentIds('whos_the_liar').has(item.id)).length;
  const candidates = freshCount ? pool.slice(0, freshCount) : pool;
  const picked = candidates[Math.floor(Math.random() * candidates.length)] ?? null;
  if (picked) recordPlayed('whos_the_liar', picked.id);
  return picked;
}

export function countLiarPairs(options: {
  categoryIds: string[];
  contentLevels: ContentLevel[];
}): number {
  return getLiarPairs(options).length;
}
