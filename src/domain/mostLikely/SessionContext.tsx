import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  beginCountdown,
  createMostLikelySession,
  endSession,
  nextPrompt,
  rematchSession,
  skipPrompt,
  tickCountdown,
} from './machine';
import type { MostLikelySession, MostLikelySetup } from './types';
import { useSettings } from '../settings/SettingsContext';

type SessionContextValue = {
  session: MostLikelySession | null;
  error: string | null;
  startSession: (
    setup: MostLikelySetup,
  ) => { session: MostLikelySession } | { error: string };
  clearSession: () => void;
  clearError: () => void;
  dispatch: {
    beginCountdown: () => void;
    tickCountdown: () => void;
    nextPrompt: () => void;
    skipPrompt: () => void;
    endSession: () => void;
    rematch: () => MostLikelySession | null;
  };
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function MostLikelySessionProvider({ children }: { children: ReactNode }) {
  const { settings } = useSettings();
  const [session, setSession] = useState<MostLikelySession | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startSession = useCallback(
    (setup: MostLikelySetup) => {
      const created = createMostLikelySession(setup, settings.contentLanguage);
      if ('error' in created) {
        setError(created.error);
        return { error: created.error };
      }
      setError(null);
      setSession(created);
      return { session: created };
    },
    [settings.contentLanguage],
  );

  const clearSession = useCallback(() => {
    setSession(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const update = useCallback((fn: (current: MostLikelySession) => MostLikelySession) => {
    setSession((current) => (current ? fn(current) : current));
  }, []);

  const dispatch = useMemo(
    () => ({
      beginCountdown: () => update(beginCountdown),
      tickCountdown: () => update(tickCountdown),
      nextPrompt: () => update(nextPrompt),
      skipPrompt: () => update(skipPrompt),
      endSession: () => update(endSession),
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

export function useMostLikelySession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useMostLikelySession must be used within MostLikelySessionProvider');
  return ctx;
}
