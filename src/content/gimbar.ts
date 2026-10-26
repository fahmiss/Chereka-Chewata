import type { ContentLevel, GimbarCard, GimbarCategory } from '../domain/gimbar/types';
import type { ContentLanguage } from '../domain/settings/types';
import { isContentLevelAvailable } from '../config/features';
import categoriesJson from '../../content/categories/gimbar.json';
import cardsJson from '../../content/gimbar/cards.en.json';
import impostorJson from '../../content/impostor/words.en.json';
import tabooJson from '../../content/taboo/cards.en.json';
import type { ImpostorWord } from '../domain/impostor/types';
import type { TabooCard } from '../domain/taboo/types';
import { prioritizeFresh, reportedIds } from '../storage/contentHistory';
import { matchesContentLanguage } from './localize';

const categories = categoriesJson as GimbarCategory[];

/**
 * Gimbar's own act-it-out cards first, then every Taboo target and Impostor
 * word. Same text appears once; ids keep their source so reports stay exact.
 */
const cards: GimbarCard[] = (() => {
  const merged: GimbarCard[] = [];
  const seen = new Set<string>();
  const add = (card: GimbarCard) => {
    const key = card.text_en.trim().toLowerCase();
    if (!key || seen.has(key)) return;
    seen.add(key);
    merged.push(card);
  };

  (cardsJson as GimbarCard[]).forEach(add);
  (tabooJson as TabooCard[]).forEach((card) =>
    add({
      id: `taboo:${card.id}`,
      text_en: card.target_en,
      text_am: card.target_am,
      category_id: card.category_id,
      tags: card.tags,
      content_level: card.content_level,
      active: card.active,
    }),
  );
  (impostorJson as ImpostorWord[]).forEach((word) =>
    add({
      id: `impostor:${word.id}`,
      text_en: word.word_en,
      text_am: word.word_am,
      category_id: word.category_id,
      tags: word.tags,
      content_level: word.content_level,
      active: word.active,
    }),
  );
  return merged;
})();

export function getGimbarCategories(): GimbarCategory[] {
  return categories
    .filter((category) => category.active)
    .sort((a, b) => a.sort_order - b.sort_order);
}

export function getGimbarCards(options: {
  categoryIds: string[];
  contentLevels: ContentLevel[];
  contentLanguage?: ContentLanguage;
}): GimbarCard[] {
  const levels = new Set(options.contentLevels.filter(isContentLevelAvailable));
  const cats = new Set(options.categoryIds);
  const language = options.contentLanguage ?? 'en';
  const hidden = reportedIds('gimbar');

  return cards.filter(
    (card) =>
      card.active &&
      cats.has(card.category_id) &&
      levels.has(card.content_level) &&
      matchesContentLanguage(language, { en: card.text_en, am: card.text_am }) &&
      !hidden.has(card.id),
  );
}

/** Shuffled deck with recently played cards at the back. */
export function pickGimbarDeck(options: {
  categoryIds: string[];
  contentLevels: ContentLevel[];
  contentLanguage?: ContentLanguage;
}): GimbarCard[] {
  return prioritizeFresh(getGimbarCards(options), 'gimbar');
}

export function countGimbarCards(options: {
  categoryIds: string[];
  contentLevels: ContentLevel[];
  contentLanguage?: ContentLanguage;
}): number {
  return getGimbarCards(options).length;
}
