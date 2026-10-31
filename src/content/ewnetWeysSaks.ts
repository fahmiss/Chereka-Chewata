import categoriesJson from '../../content/categories/ewnet_weys_saks.json';
import questionsJson from '../../content/ewnet_weys_saks/questions.en.json';
import type { ContentLanguage, ContentLevel } from '../domain/shared/types';
import type { EwnetQuestion } from '../domain/ewnetWeysSaks/types';
import { shuffle } from '../domain/shared/utils';

export type EwnetCategory = {
  id: string;
  name_en: string;
  name_am?: string;
  sort_order: number;
  active: boolean;
};

const categories = (categoriesJson as EwnetCategory[])
  .filter((item) => item.active)
  .sort((a, b) => a.sort_order - b.sort_order);
const questions = (questionsJson as EwnetQuestion[]).filter((item) => item.active);

export function getEwnetCategories(): EwnetCategory[] {
  return categories;
}

export function getEwnetQuestions({
  categoryIds,
  contentLevels,
  contentLanguage: _contentLanguage,
}: {
  categoryIds: string[];
  contentLevels: ContentLevel[];
  contentLanguage: ContentLanguage;
}): EwnetQuestion[] {
  return questions.filter(
    (item) => categoryIds.includes(item.category_id) && contentLevels.includes(item.content_level),
  );
}

export function countEwnetQuestions(query: Parameters<typeof getEwnetQuestions>[0]): number {
  return getEwnetQuestions(query).length;
}

export function buildEwnetDeck(
  query: Parameters<typeof getEwnetQuestions>[0],
  roundCount: number,
): EwnetQuestion[] {
  const eligible = getEwnetQuestions(query);
  if (!eligible.length) return [];
  const deck: EwnetQuestion[] = [];
  while (deck.length < roundCount) deck.push(...shuffle(eligible));
  return deck.slice(0, roundCount);
}
