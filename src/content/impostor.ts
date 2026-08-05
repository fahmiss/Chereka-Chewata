import type { ContentLevel, ImpostorCategory, ImpostorWord } from '../domain/impostor/types';
import categoriesJson from '../../content/categories/impostor.json';
import wordsJson from '../../content/impostor/words.en.json';

const categories = categoriesJson as ImpostorCategory[];
const words = wordsJson as ImpostorWord[];

export function getImpostorCategories(): ImpostorCategory[] {
  return categories
    .filter((category) => category.active)
    .sort((a, b) => a.sort_order - b.sort_order);
}

export function getImpostorWords(options: {
  categoryIds: string[];
  contentLevels: ContentLevel[];
  excludeIds?: string[];
}): ImpostorWord[] {
  const exclude = new Set(options.excludeIds ?? []);
  const levels = new Set(options.contentLevels);
  const cats = new Set(options.categoryIds);

  return words.filter(
    (word) =>
      word.active &&
      cats.has(word.category_id) &&
      levels.has(word.content_level) &&
      !exclude.has(word.id),
  );
}

export function pickImpostorWord(options: {
  categoryIds: string[];
  contentLevels: ContentLevel[];
  excludeIds?: string[];
}): ImpostorWord | null {
  const pool = getImpostorWords(options);
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)] ?? null;
}

export function countImpostorWords(options: {
  categoryIds: string[];
  contentLevels: ContentLevel[];
}): number {
  return getImpostorWords(options).length;
}
