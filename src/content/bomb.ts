import categoriesJson from '../../content/categories/bomb.json';
import cardsJson from '../../content/bomb/cards.json';
import type {
  BombCard,
  BombCategory,
  ContentLevel,
} from '../domain/bomb/types';
import type { ContentLanguage } from '../domain/settings/types';
import { prioritizeFresh, reportedIds } from '../storage/contentHistory';
import { matchesContentLanguage } from './localize';

const categories = categoriesJson as BombCategory[];
const cards = cardsJson as BombCard[];

export function getBombCategories(): BombCategory[] {
  return categories
    .filter((category) => category.active)
    .sort((a, b) => a.sort_order - b.sort_order);
}

export function getBombCards(options: {
  categoryIds: string[];
  contentLevels: ContentLevel[];
  contentLanguage?: ContentLanguage;
}): BombCard[] {
  const selectedCategories = new Set(options.categoryIds);
  const selectedLevels = new Set(options.contentLevels);
  const language = options.contentLanguage ?? 'en';

  return cards.filter(
    (card) =>
      card.active &&
      selectedCategories.has(card.category_id) &&
      selectedLevels.has(card.content_level) &&
      matchesContentLanguage(language, { en: card.prompt_en, am: card.prompt_am }) &&
      !reportedIds('bomb').has(card.id),
  );
}

export function pickBombDeck(options: {
  categoryIds: string[];
  contentLevels: ContentLevel[];
  contentLanguage?: ContentLanguage;
}): BombCard[] {
  return prioritizeFresh(getBombCards(options), 'bomb');
}

export function countBombCards(options: {
  categoryIds: string[];
  contentLevels: ContentLevel[];
  contentLanguage?: ContentLanguage;
}): number {
  return getBombCards(options).length;
}
