import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  accusePlayer,
  beginVoteSelect,
  castVote,
  createLiarSession,
  hideRevealAndContinue,
  readyToReveal,
  rematchSession,
  resolveGroupDeadlock,
  startDiscussion,
  startVoting,
} from './machine';
import type { LiarSession, LiarSetup } from './types';
import { useSettings } from '../settings/SettingsContext';

type SessionContextValue = {
  session: LiarSession | null;
  error: string | null;
  startSession: (setup: LiarSetup) => { session: LiarSession } | { error: string };
  clearSession: () => void;
  clearError: () => void;
  dispatch: {
    readyToReveal: () => void;
    hideRevealAndContinue: () => void;
    startDiscussion: () => void;
    startVoting: () => void;
    beginVoteSelect: () => void;
    castVote: (suspectId: string) => void;
    accusePlayer: (playerId: string) => void;
    resolveGroupDeadlock: () => void;
    rematch: () => LiarSession | null;
  };
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function LiarSessionProvider({ children }: { children: ReactNode }) {
  const { settings } = useSettings();
  const [session, setSession] = useState<LiarSession | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startSession = useCallback(
    (setup: LiarSetup) => {
      const created = createLiarSession(setup, {
        contentLanguage: settings.contentLanguage,
      });
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

  const update = useCallback((fn: (current: LiarSession) => LiarSession) => {
    setSession((current) => (current ? fn(current) : current));
  }, []);

  const dispatch = useMemo(
    () => ({
      readyToReveal: () => update(readyToReveal),
      hideRevealAndContinue: () => update(hideRevealAndContinue),
      startDiscussion: () => update(startDiscussion),
      startVoting: () => update(startVoting),
      beginVoteSelect: () => update(beginVoteSelect),
      castVote: (suspectId: string) => update((current) => castVote(current, suspectId)),
      accusePlayer: (playerId: string) =>
        update((current) => accusePlayer(current, playerId)),
      resolveGroupDeadlock: () => update(resolveGroupDeadlock),
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

export function useLiarSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useLiarSession must be used within LiarSessionProvider');
  return ctx;
}
