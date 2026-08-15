import categoriesJson from '../../content/categories/quiz.json';
import questionsJson from '../../content/quiz/questions.json';
import type { ContentLanguage } from '../domain/settings/types';
import type {
  QuizCategory,
  QuizDifficultyFilter,
  QuizQuestion,
} from '../domain/quiz/types';
import { prioritizeFresh, reportedIds } from '../storage/contentHistory';
import { matchesContentLanguage } from './localize';

const categories = categoriesJson as QuizCategory[];
const questions = questionsJson as QuizQuestion[];

export function getQuizCategories(): QuizCategory[] {
  return categories.filter((item) => item.active).sort((a, b) => a.sort_order - b.sort_order);
}

export function getQuizQuestions(options: {
  categoryIds: string[];
  difficulty: QuizDifficultyFilter;
  contentLanguage?: ContentLanguage;
}): QuizQuestion[] {
  const selected = new Set(options.categoryIds);
  const language = options.contentLanguage ?? 'en';
  const hidden = reportedIds('quiz');

  return questions.filter(
    (question) =>
      question.active &&
      selected.has(question.category_id) &&
      (options.difficulty === 'mixed' || question.difficulty === options.difficulty) &&
      matchesContentLanguage(language, {
        en: question.question_en,
        am: question.question_am,
      }) &&
      !hidden.has(question.id),
  );
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swap]] = [copy[swap]!, copy[index]!];
  }
  return copy;
}

/**
 * Fresh questions come first. When a narrow filter has fewer questions than
 * requested, the eligible pool is reshuffled and recycled instead of failing.
 */
export function pickQuizQuestions(options: {
  categoryIds: string[];
  difficulty: QuizDifficultyFilter;
  contentLanguage?: ContentLanguage;
  count: number;
}): QuizQuestion[] {
  const eligible = getQuizQuestions(options);
  if (!eligible.length) return [];

  const firstPass = prioritizeFresh(eligible, 'quiz');
  const selected: QuizQuestion[] = [];
  let cycle = firstPass;

  while (selected.length < options.count) {
    const remaining = options.count - selected.length;
    selected.push(...cycle.slice(0, remaining));
    if (selected.length >= options.count) break;
    cycle = shuffle(eligible);
  }

  return selected;
}

export function countQuizQuestions(options: {
  categoryIds: string[];
  difficulty: QuizDifficultyFilter;
  contentLanguage?: ContentLanguage;
}): number {
  return getQuizQuestions(options).length;
}
