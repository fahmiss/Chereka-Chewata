import type { ContentLevel, TabooCard, TabooCategory } from '../domain/taboo/types';
import type { ContentLanguage } from '../domain/settings/types';
import categoriesJson from '../../content/categories/taboo.json';
import cardsJson from '../../content/taboo/cards.en.json';
import { prioritizeFresh, recentIds, recordPlayed, reportedIds } from '../storage/contentHistory';
import { matchesContentLanguage } from './localize';

const categories = categoriesJson as TabooCategory[];
const cards = cardsJson as TabooCard[];

export function getTabooCategories(): TabooCategory[] {
  return categories
    .filter((category) => category.active)
    .sort((a, b) => a.sort_order - b.sort_order);
}

export function getTabooCards(options: {
  categoryIds: string[];
  contentLevels: ContentLevel[];
  contentLanguage?: ContentLanguage;
  excludeIds?: string[];
}): TabooCard[] {
  const exclude = new Set(options.excludeIds ?? []);
  const levels = new Set(options.contentLevels);
  const cats = new Set(options.categoryIds);
  const language = options.contentLanguage ?? 'en';

  return cards.filter(
    (card) =>
      card.active &&
      cats.has(card.category_id) &&
      levels.has(card.content_level) &&
      matchesContentLanguage(language, {
        en: card.target_en,
        am: card.target_am,
      }) &&
      !exclude.has(card.id) &&
      !reportedIds('taboo').has(card.id),
  );
}

export function pickTabooCard(options: {
  categoryIds: string[];
  contentLevels: ContentLevel[];
  contentLanguage?: ContentLanguage;
  excludeIds?: string[];
}): TabooCard | null {
  const pool = prioritizeFresh(getTabooCards(options), 'taboo');
  if (pool.length === 0) return null;
  const freshCount = pool.filter((item) => !recentIds('taboo').has(item.id)).length;
  const candidates = freshCount ? pool.slice(0, freshCount) : pool;
  const picked = candidates[Math.floor(Math.random() * candidates.length)] ?? null;
  if (picked) recordPlayed('taboo', picked.id);
  return picked;
}

export function countTabooCards(options: {
  categoryIds: string[];
  contentLevels: ContentLevel[];
  contentLanguage?: ContentLanguage;
}): number {
  return getTabooCards(options).length;
}
