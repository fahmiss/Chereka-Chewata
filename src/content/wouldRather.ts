import categoriesJson from '../../content/categories/would_you_rather.json';
import dilemmasJson from '../../content/would_you_rather/dilemmas.en.json';
import type { ContentLevel, WouldRatherCategory, WouldRatherDilemma } from '../domain/wouldRather/types';
import type { ContentLanguage } from '../domain/settings/types';
import { prioritizeFresh, reportedIds } from '../storage/contentHistory';
import { matchesContentLanguage } from './localize';

const categories = categoriesJson as WouldRatherCategory[];
const dilemmas = dilemmasJson as WouldRatherDilemma[];

export function getWouldRatherCategories(): WouldRatherCategory[] {
  return categories.filter((item) => item.active).sort((a, b) => a.sort_order - b.sort_order);
}

export function getWouldRatherDilemmas(options: {
  categoryIds: string[];
  contentLevels: ContentLevel[];
  contentLanguage?: ContentLanguage;
}): WouldRatherDilemma[] {
  const cats = new Set(options.categoryIds);
  const levels = new Set(options.contentLevels);
  const language = options.contentLanguage ?? 'en';
  return dilemmas.filter(
    (item) =>
      item.active &&
      cats.has(item.category_id) &&
      levels.has(item.content_level) &&
      matchesContentLanguage(language, {
        en: item.option_a_en,
        am: item.option_a_am,
      }) &&
      !reportedIds('would_you_rather').has(item.id),
  );
}

export function pickWouldRatherDeck(options: {
  categoryIds: string[];
  contentLevels: ContentLevel[];
  contentLanguage?: ContentLanguage;
  count: number;
}): WouldRatherDilemma[] {
  const pool = prioritizeFresh(getWouldRatherDilemmas(options), 'would_you_rather');
  return pool.slice(0, Math.min(options.count, pool.length));
}

export function countWouldRatherDilemmas(options: {
  categoryIds: string[];
  contentLevels: ContentLevel[];
  contentLanguage?: ContentLanguage;
}): number {
  return getWouldRatherDilemmas(options).length;
}
