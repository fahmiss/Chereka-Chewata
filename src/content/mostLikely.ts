import type {
  ContentLevel,
  MostLikelyCategory,
  MostLikelyPrompt,
} from '../domain/mostLikely/types';
import type { ContentLanguage } from '../domain/settings/types';
import categoriesJson from '../../content/categories/most_likely.json';
import promptsJson from '../../content/most_likely/prompts.en.json';
import { prioritizeFresh, reportedIds } from '../storage/contentHistory';
import { matchesContentLanguage } from './localize';

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
  contentLanguage?: ContentLanguage;
  excludeIds?: string[];
}): MostLikelyPrompt[] {
  const exclude = new Set(options.excludeIds ?? []);
  const levels = new Set(options.contentLevels);
  const cats = new Set(options.categoryIds);
  const language = options.contentLanguage ?? 'en';

  return prompts.filter(
    (prompt) =>
      prompt.active &&
      cats.has(prompt.category_id) &&
      levels.has(prompt.content_level) &&
      matchesContentLanguage(language, {
        en: prompt.prompt_en,
        am: prompt.prompt_am,
      }) &&
      !exclude.has(prompt.id) &&
      !reportedIds('most_likely').has(prompt.id),
  );
}

export function pickMostLikelyDeck(options: {
  categoryIds: string[];
  contentLevels: ContentLevel[];
  contentLanguage?: ContentLanguage;
  count: number;
}): MostLikelyPrompt[] {
  const pool = prioritizeFresh(getMostLikelyPrompts(options), 'most_likely');
  return pool.slice(0, Math.min(options.count, pool.length));
}

export function countMostLikelyPrompts(options: {
  categoryIds: string[];
  contentLevels: ContentLevel[];
  contentLanguage?: ContentLanguage;
}): number {
  return getMostLikelyPrompts(options).length;
}
