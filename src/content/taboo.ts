import type { ContentLevel, TabooCard, TabooCategory } from '../domain/taboo/types';
import categoriesJson from '../../content/categories/taboo.json';
import cardsJson from '../../content/taboo/cards.en.json';

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
  excludeIds?: string[];
}): TabooCard[] {
  const exclude = new Set(options.excludeIds ?? []);
  const levels = new Set(options.contentLevels);
  const cats = new Set(options.categoryIds);

  return cards.filter(
    (card) =>
      card.active &&
      cats.has(card.category_id) &&
      levels.has(card.content_level) &&
      !exclude.has(card.id),
  );
}

export function pickTabooCard(options: {
  categoryIds: string[];
  contentLevels: ContentLevel[];
  excludeIds?: string[];
}): TabooCard | null {
  const pool = getTabooCards(options);
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)] ?? null;
}

export function countTabooCards(options: {
  categoryIds: string[];
  contentLevels: ContentLevel[];
}): number {
  return getTabooCards(options).length;
}
