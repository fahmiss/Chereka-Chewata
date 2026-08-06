import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  adjustTurnScore,
  beginPlaying,
  confirmTurnSummary,
  createTabooSession,
  discardCard,
  expireTurn,
  markCorrect,
  markSkip,
  markViolation,
  pauseTurn,
  rematchKeepTeams,
  rematchSession,
  resumeTurn,
} from './machine';
import type { TabooSession, TabooSetup } from './types';

type SessionContextValue = {
  session: TabooSession | null;
  error: string | null;
  startSession: (setup: TabooSetup) => { session: TabooSession } | { error: string };
  clearSession: () => void;
  clearError: () => void;
  dispatch: {
    beginPlaying: () => void;
    pauseTurn: () => void;
    resumeTurn: () => void;
    markCorrect: () => void;
    markSkip: () => void;
    markViolation: () => void;
    discardCard: () => void;
    expireTurn: () => void;
    adjustTurnScore: (delta: number) => void;
    confirmTurnSummary: () => void;
    rematch: () => TabooSession | null;
    rematchKeepTeams: () => TabooSession | null;
  };
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function TabooSessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<TabooSession | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startSession = useCallback((setup: TabooSetup) => {
    const created = createTabooSession(setup);
    if ('error' in created) {
      setError(created.error);
      return { error: created.error };
    }
    setError(null);
    setSession(created);
    return { session: created };
  }, []);

  const clearSession = useCallback(() => {
    setSession(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const update = useCallback((fn: (current: TabooSession) => TabooSession) => {
    setSession((current) => (current ? fn(current) : current));
  }, []);

  const dispatch = useMemo(
    () => ({
      beginPlaying: () => update(beginPlaying),
      pauseTurn: () => update(pauseTurn),
      resumeTurn: () => update(resumeTurn),
      markCorrect: () => update(markCorrect),
      markSkip: () => update(markSkip),
      markViolation: () => update(markViolation),
      discardCard: () => update(discardCard),
      expireTurn: () => update(expireTurn),
      adjustTurnScore: (delta: number) =>
        update((current) => adjustTurnScore(current, delta)),
      confirmTurnSummary: () => update(confirmTurnSummary),
      rematch: () => {
        const current = session;
        if (!current) return null;
        const created = rematchSession(current);
        if ('error' in created) {
          setError(created.error);
          return null;
        }
        setError(null);
        setSession(created);
        return created;
      },
      rematchKeepTeams: () => {
        const current = session;
        if (!current) return null;
        const created = rematchKeepTeams(current);
        if ('error' in created) {
          setError(created.error);
          return null;
        }
        setError(null);
        setSession(created);
        return created;
      },
    }),
    [update, session],
  );

  const value = useMemo(
    () => ({
      session,
      error,
      startSession,
      clearSession,
      clearError,
      dispatch,
    }),
    [session, error, startSession, clearSession, clearError, dispatch],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useTabooSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useTabooSession must be used within TabooSessionProvider');
  return ctx;
}
