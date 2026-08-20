import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useSettings } from '../settings/SettingsContext';
import {
  beginQuiz,
  continueAfterReveal,
  createQuizSession,
  endQuiz,
  rematchQuiz,
  selectQuizAnswer,
} from './machine';
import type { QuizSession, QuizSetup } from './types';

type Value = {
  session: QuizSession | null;
  error: string | null;
  startSession: (setup: QuizSetup) => { session: QuizSession } | { error: string };
  clearSession: () => void;
  clearError: () => void;
  dispatch: {
    begin: () => void;
    selectAnswer: (answerId: string) => void;
    continueAfterReveal: () => void;
    endSession: () => void;
    rematch: () => QuizSession | null;
  };
};

const Context = createContext<Value | null>(null);

export function QuizSessionProvider({ children }: { children: ReactNode }) {
  const { settings } = useSettings();
  const [session, setSession] = useState<QuizSession | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startSession = useCallback((setup: QuizSetup) => {
    const created = createQuizSession(setup, { contentLanguage: settings.contentLanguage });
    if ('error' in created) {
      setError(created.error);
      return created;
    }
    setError(null);
    setSession(created);
    return { session: created };
  }, [settings.contentLanguage]);

  const clearSession = useCallback(() => {
    setSession(null);
    setError(null);
  }, []);
  const clearError = useCallback(() => setError(null), []);
  const update = useCallback((fn: (value: QuizSession) => QuizSession) => {
    setSession((value) => (value ? fn(value) : value));
  }, []);

  const dispatch = useMemo(() => ({
    begin: () => update(beginQuiz),
    selectAnswer: (answerId: string) => update((value) => selectQuizAnswer(value, answerId)),
    continueAfterReveal: () => update(continueAfterReveal),
    endSession: () => update(endQuiz),
    rematch: () => {
      if (!session) return null;
      const created = rematchQuiz(session);
      if ('error' in created) {
        setError(created.error);
        return null;
      }
      setError(null);
      setSession(created);
      return created;
    },
  }), [session, update]);

  const value = useMemo(() => ({
    session,
    error,
    startSession,
    clearSession,
    clearError,
    dispatch,
  }), [session, error, startSession, clearSession, clearError, dispatch]);

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useQuizSession() {
  const value = useContext(Context);
  if (!value) throw new Error('useQuizSession must be used within QuizSessionProvider');
  return value;
}
