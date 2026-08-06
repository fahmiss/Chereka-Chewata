import categoriesJson from '../../content/categories/would_you_rather.json';
import dilemmasJson from '../../content/would_you_rather/dilemmas.en.json';
import type { ContentLevel, WouldRatherCategory, WouldRatherDilemma } from '../domain/wouldRather/types';
import { prioritizeFresh, reportedIds } from '../storage/contentHistory';

const categories = categoriesJson as WouldRatherCategory[];
const dilemmas = dilemmasJson as WouldRatherDilemma[];

export function getWouldRatherCategories(): WouldRatherCategory[] {
  return categories.filter((item) => item.active).sort((a, b) => a.sort_order - b.sort_order);
}

export function getWouldRatherDilemmas(options: {
  categoryIds: string[];
  contentLevels: ContentLevel[];
}): WouldRatherDilemma[] {
  const categories = new Set(options.categoryIds);
  const levels = new Set(options.contentLevels);
  return dilemmas.filter((item) => item.active && categories.has(item.category_id) && levels.has(item.content_level) && !reportedIds('would_you_rather').has(item.id));
}

export function pickWouldRatherDeck(options: {
  categoryIds: string[];
  contentLevels: ContentLevel[];
  count: number;
}): WouldRatherDilemma[] {
  const pool = prioritizeFresh(getWouldRatherDilemmas(options), 'would_you_rather');
  const picked = pool.slice(0, Math.min(options.count, pool.length));
  return picked;
}

export function countWouldRatherDilemmas(options: {
  categoryIds: string[];
  contentLevels: ContentLevel[];
}): number {
  return getWouldRatherDilemmas(options).length;
}
