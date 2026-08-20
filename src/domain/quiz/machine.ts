import { pickQuizQuestions } from '../../content/quiz';
import { recordPlayed } from '../../storage/contentHistory';
import {
  createId,
  QUIZ_MAX_PLAYERS,
  QUIZ_MIN_PLAYERS,
  type ContentLanguage,
  type QuizAnswer,
  type QuizQuestion,
  type QuizSession,
  type QuizSetup,
} from './types';

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swap]] = [copy[swap]!, copy[index]!];
  }
  return copy;
}

export function shuffledAnswers(question: QuizQuestion): QuizAnswer[] {
  return shuffle([
    {
      id: 'correct',
      text_en: question.correct_answer_en,
      text_am: question.correct_answer_am,
      correct: true,
    },
    ...question.incorrect_answers_en.map((text, index) => ({
      id: `incorrect_${index}`,
      text_en: text,
      text_am: question.incorrect_answers_am?.[index],
      correct: false,
    })),
  ]);
}

export function currentQuizQuestion(session: QuizSession): QuizQuestion | null {
  return session.questions[session.questionIndex] ?? null;
}

export function currentQuizPlayer(session: QuizSession) {
  if (session.setup.playMode !== 'compete') return null;
  return session.setup.players[session.currentPlayerIndex] ?? null;
}

export function selectedQuizAnswer(session: QuizSession): QuizAnswer | null {
  return session.currentAnswers.find((answer) => answer.id === session.selectedAnswerId) ?? null;
}

export function createQuizSession(
  setup: QuizSetup,
  options: { contentLanguage?: ContentLanguage; sessionId?: string } = {},
): QuizSession | { error: string } {
  if (!setup.categoryIds.length) return { error: 'Pick at least one category.' };
  if (
    setup.playMode === 'compete' &&
    (setup.players.length < QUIZ_MIN_PLAYERS || setup.players.length > QUIZ_MAX_PLAYERS)
  ) {
    return { error: `Compete needs ${QUIZ_MIN_PLAYERS}–${QUIZ_MAX_PLAYERS} players.` };
  }
  if (
    setup.playMode === 'compete' &&
    setup.players.some((player) => !player.displayName.trim())
  ) {
    return { error: 'Every competitive player needs a name.' };
  }

  const contentLanguage = options.contentLanguage ?? 'en';
  const questions = pickQuizQuestions({
    categoryIds: setup.categoryIds,
    difficulty: setup.difficulty,
    contentLanguage,
    count: setup.questionCount,
  });
  if (!questions.length) return { error: 'No Quiz questions match these filters.' };

  return {
    sessionId: options.sessionId ?? createId('sess'),
    setup,
    contentLanguage,
    phase: 'ready',
    questions,
    questionIndex: 0,
    currentPlayerIndex: 0,
    currentAnswers: shuffledAnswers(questions[0]!),
    selectedAnswerId: null,
    scores: Object.fromEntries(setup.players.map((player) => [player.id, 0])),
    correctCount: 0,
    incorrectCount: 0,
  };
}

export function beginQuiz(session: QuizSession): QuizSession {
  if (session.phase !== 'ready') return session;
  const question = currentQuizQuestion(session);
  if (!question) return { ...session, phase: 'result' };
  recordPlayed('quiz', question.id);
  return { ...session, phase: 'question' };
}

export function selectQuizAnswer(session: QuizSession, answerId: string): QuizSession {
  if (session.phase !== 'question' || session.selectedAnswerId) return session;
  const answer = session.currentAnswers.find((item) => item.id === answerId);
  if (!answer) return session;

  const player = currentQuizPlayer(session);
  const scores =
    answer.correct && player
      ? { ...session.scores, [player.id]: (session.scores[player.id] ?? 0) + 1 }
      : session.scores;

  return {
    ...session,
    phase: 'answer_reveal',
    selectedAnswerId: answerId,
    scores,
    correctCount: session.correctCount + (answer.correct ? 1 : 0),
    incorrectCount: session.incorrectCount + (answer.correct ? 0 : 1),
  };
}

function advanceQuestion(session: QuizSession): QuizSession {
  const questionIndex = session.questionIndex + 1;
  const question = session.questions[questionIndex];
  if (!question) return { ...session, phase: 'result', selectedAnswerId: null };

  recordPlayed('quiz', question.id);
  return {
    ...session,
    phase: 'question',
    questionIndex,
    currentPlayerIndex:
      session.setup.playMode === 'compete'
        ? (session.currentPlayerIndex + 1) % session.setup.players.length
        : session.currentPlayerIndex,
    currentAnswers: shuffledAnswers(question),
    selectedAnswerId: null,
  };
}

export function continueAfterReveal(session: QuizSession): QuizSession {
  if (session.phase !== 'answer_reveal') return session;
  const finished = session.questionIndex + 1 >= session.questions.length;
  if (finished) return { ...session, phase: 'result' };
  return advanceQuestion(session);
}

export function endQuiz(session: QuizSession): QuizSession {
  return session.phase === 'result' ? session : { ...session, phase: 'result' };
}

export function rematchQuiz(session: QuizSession): QuizSession | { error: string } {
  return createQuizSession(session.setup, {
    contentLanguage: session.contentLanguage,
    sessionId: session.sessionId,
  });
}
