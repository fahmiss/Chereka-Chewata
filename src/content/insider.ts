import type { ContentLevel, ImpostorWord } from '../domain/impostor/types';
import type { ContentLanguage } from '../domain/settings/types';
import { prioritizeFresh, recentIds, recordPlayed, reportedIds } from '../storage/contentHistory';
import { getImpostorWords } from './impostor';

/**
 * Insider plays the Impostor word deck with its own recently-played history.
 * A word reported in either game is hidden here.
 */
export function getInsiderWords(options: {
  categoryIds: string[];
  contentLevels: ContentLevel[];
  contentLanguage?: ContentLanguage;
  excludeIds?: string[];
}): ImpostorWord[] {
  const hidden = reportedIds('insider');
  return getImpostorWords(options).filter((word) => !hidden.has(word.id));
}

export function pickInsiderWord(options: {
  categoryIds: string[];
  contentLevels: ContentLevel[];
  contentLanguage?: ContentLanguage;
  excludeIds?: string[];
}): ImpostorWord | null {
  const pool = prioritizeFresh(getInsiderWords(options), 'insider');
  if (pool.length === 0) return null;
  const freshCount = pool.filter((item) => !recentIds('insider').has(item.id)).length;
  const candidates = freshCount > 0 ? pool.slice(0, freshCount) : pool;
  const picked = candidates[Math.floor(Math.random() * candidates.length)] ?? null;
  if (picked) recordPlayed('insider', picked.id);
  return picked;
}

export function countInsiderWords(options: {
  categoryIds: string[];
  contentLevels: ContentLevel[];
  contentLanguage?: ContentLanguage;
}): number {
  return getInsiderWords(options).length;
}
