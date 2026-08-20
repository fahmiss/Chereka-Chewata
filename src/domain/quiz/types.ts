import type { ContentLanguage } from '../settings/types';

export type { ContentLanguage };

export type QuizPlayMode = 'pass_play' | 'compete';
export type QuizDifficulty = 'easy' | 'medium' | 'hard';
export type QuizDifficultyFilter = QuizDifficulty | 'mixed';
export type QuizCompatibilityContentLevel = 'family' | 'friends' | 'spicy';

export type QuizQuestion = {
  id: string;
  question_en: string;
  question_am?: string;
  correct_answer_en: string;
  correct_answer_am?: string;
  incorrect_answers_en: [string, string, string];
  incorrect_answers_am?: [string, string, string];
  explanation_en?: string | null;
  explanation_am?: string | null;
  category_id: string;
  difficulty: QuizDifficulty;
  tags?: string[];
  source_name?: string | null;
  source_url?: string | null;
  source_license?: string | null;
  verified_at?: string | null;
  active: boolean;
};

export type QuizCategory = {
  id: string;
  name_en: string;
  name_am?: string;
  sort_order: number;
  active: boolean;
};

export type QuizPlayer = {
  id: string;
  displayName: string;
};

export type QuizSetup = {
  playMode: QuizPlayMode;
  players: QuizPlayer[];
  categoryIds: string[];
  difficulty: QuizDifficultyFilter;
  questionCount: 10 | 20 | 30;
  /** Shared setup compatibility only; Quiz difficulty is not a maturity level. */
  contentLevels: QuizCompatibilityContentLevel[];
  spicyAcknowledged: boolean;
};

export type QuizAnswer = {
  id: string;
  text_en: string;
  text_am?: string;
  correct: boolean;
};

export type QuizPhase = 'ready' | 'question' | 'answer_reveal' | 'result';

export type QuizSession = {
  sessionId: string;
  setup: QuizSetup;
  contentLanguage: ContentLanguage;
  phase: QuizPhase;
  questions: QuizQuestion[];
  questionIndex: number;
  currentPlayerIndex: number;
  currentAnswers: QuizAnswer[];
  selectedAnswerId: string | null;
  scores: Record<string, number>;
  correctCount: number;
  incorrectCount: number;
};

export const QUIZ_MIN_PLAYERS = 2;
export const QUIZ_MAX_PLAYERS = 12;

export function defaultQuizSetup(players?: QuizPlayer[]): QuizSetup {
  return {
    playMode: 'pass_play',
    players: players ?? defaultPlayers(2),
    categoryIds: [],
    difficulty: 'mixed',
    questionCount: 20,
    contentLevels: ['family'],
    spicyAcknowledged: false,
  };
}

export function defaultPlayers(count: number): QuizPlayer[] {
  return Array.from({ length: count }, (_, index) => ({
    id: createId('p'),
    displayName: `Player ${index + 1}`,
  }));
}

export function createId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}
