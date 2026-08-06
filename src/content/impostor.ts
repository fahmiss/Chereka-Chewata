import type { ContentLevel, ImpostorCategory, ImpostorWord } from '../domain/impostor/types';
import type { ContentLanguage } from '../domain/settings/types';
import categoriesJson from '../../content/categories/impostor.json';
import wordsJson from '../../content/impostor/words.en.json';
import { prioritizeFresh, recentIds, recordPlayed, reportedIds } from '../storage/contentHistory';

const categories = categoriesJson as ImpostorCategory[];
const words = wordsJson as ImpostorWord[];

export function getImpostorCategories(): ImpostorCategory[] {
  return categories
    .filter((category) => category.active)
    .sort((a, b) => a.sort_order - b.sort_order);
}

function matchesContentLanguage(word: ImpostorWord, language: ContentLanguage): boolean {
  if (language === 'en') return Boolean(word.word_en?.trim());
  // Amharic / mixed require an Amharic field (Latin player names may equal word_en).
  return Boolean(word.word_am?.trim());
}

export function getImpostorWords(options: {
  categoryIds: string[];
  contentLevels: ContentLevel[];
  contentLanguage?: ContentLanguage;
  excludeIds?: string[];
}): ImpostorWord[] {
  const exclude = new Set(options.excludeIds ?? []);
  const levels = new Set(options.contentLevels);
  const cats = new Set(options.categoryIds);
  const language = options.contentLanguage ?? 'en';

  return words.filter(
    (word) =>
      word.active &&
      cats.has(word.category_id) &&
      levels.has(word.content_level) &&
      matchesContentLanguage(word, language) &&
      !exclude.has(word.id) &&
      !reportedIds('impostor').has(word.id),
  );
}

export function pickImpostorWord(options: {
  categoryIds: string[];
  contentLevels: ContentLevel[];
  contentLanguage?: ContentLanguage;
  excludeIds?: string[];
}): ImpostorWord | null {
  const pool = prioritizeFresh(getImpostorWords(options), 'impostor');
  if (pool.length === 0) return null;
  const freshCount = pool.filter((item) => !recentIds('impostor').has(item.id)).length;
  const candidates = freshCount > 0 ? pool.slice(0, freshCount) : pool;
  const picked = candidates[Math.floor(Math.random() * candidates.length)] ?? null;
  if (picked) recordPlayed('impostor', picked.id);
  return picked;
}

export function countImpostorWords(options: {
  categoryIds: string[];
  contentLevels: ContentLevel[];
  contentLanguage?: ContentLanguage;
}): number {
  return getImpostorWords(options).length;
}
