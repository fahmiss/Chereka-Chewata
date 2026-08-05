import type {
  ContentLevel,
  MostLikelyCategory,
  MostLikelyPrompt,
} from '../domain/mostLikely/types';
import categoriesJson from '../../content/categories/most_likely.json';
import promptsJson from '../../content/most_likely/prompts.en.json';

const categories = categoriesJson as MostLikelyCategory[];
const prompts = promptsJson as MostLikelyPrompt[];

export function getMostLikelyCategories(): MostLikelyCategory[] {
  return categories
    .filter((category) => category.active)
    .sort((a, b) => a.sort_order - b.sort_order);
}

export function getMostLikelyPrompts(options: {
  categoryIds: string[];
  contentLevels: ContentLevel[];
  excludeIds?: string[];
}): MostLikelyPrompt[] {
  const exclude = new Set(options.excludeIds ?? []);
  const levels = new Set(options.contentLevels);
  const cats = new Set(options.categoryIds);

  return prompts.filter(
    (prompt) =>
      prompt.active &&
      cats.has(prompt.category_id) &&
      levels.has(prompt.content_level) &&
      !exclude.has(prompt.id),
  );
}

export function pickMostLikelyDeck(options: {
  categoryIds: string[];
  contentLevels: ContentLevel[];
  count: number;
}): MostLikelyPrompt[] {
  const pool = [...getMostLikelyPrompts(options)];
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j]!, pool[i]!];
  }
  return pool.slice(0, Math.min(options.count, pool.length));
}

export function countMostLikelyPrompts(options: {
  categoryIds: string[];
  contentLevels: ContentLevel[];
}): number {
  return getMostLikelyPrompts(options).length;
}
