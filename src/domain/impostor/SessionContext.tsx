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
  beginClues,
  beginVoteSelect,
  castVote,
  continueAfterAccusation,
  createImpostorSession,
  hideRevealAndContinue,
  nextClueOrDiscuss,
  readyToReveal,
  rematchSession,
  resolveFinalGuess,
  resolveGroupDeadlock,
  startVoting,
} from './machine';
import type { ImpostorSession, ImpostorSetup } from './types';
import { useSettings } from '../settings/SettingsContext';

type SessionContextValue = {
  session: ImpostorSession | null;
  error: string | null;
  startSession: (setup: ImpostorSetup) => { session: ImpostorSession } | { error: string };
  clearSession: () => void;
  clearError: () => void;
  dispatch: {
    readyToReveal: () => void;
    hideRevealAndContinue: () => void;
    beginClues: () => void;
    nextClueOrDiscuss: () => void;
    startVoting: () => void;
    beginVoteSelect: () => void;
    castVote: (suspectId: string) => void;
    accusePlayer: (playerId: string) => void;
    resolveGroupDeadlock: () => void;
    continueAfterAccusation: () => void;
    resolveFinalGuess: (correct: boolean) => void;
    rematch: () => ImpostorSession | null;
  };
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const { settings } = useSettings();
  const [session, setSession] = useState<ImpostorSession | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startSession = useCallback(
    (setup: ImpostorSetup) => {
      const created = createImpostorSession(setup, [], settings.contentLanguage);
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

  const update = useCallback((fn: (current: ImpostorSession) => ImpostorSession) => {
    setSession((current) => (current ? fn(current) : current));
  }, []);

  const dispatch = useMemo(
    () => ({
      readyToReveal: () => update(readyToReveal),
      hideRevealAndContinue: () => update(hideRevealAndContinue),
      beginClues: () => update(beginClues),
      nextClueOrDiscuss: () => update(nextClueOrDiscuss),
      startVoting: () => update(startVoting),
      beginVoteSelect: () => update(beginVoteSelect),
      castVote: (suspectId: string) => update((current) => castVote(current, suspectId)),
      accusePlayer: (playerId: string) => update((current) => accusePlayer(current, playerId)),
      resolveGroupDeadlock: () => update(resolveGroupDeadlock),
      continueAfterAccusation: () => update(continueAfterAccusation),
      resolveFinalGuess: (correct: boolean) =>
        update((current) => resolveFinalGuess(current, correct)),
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

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used within SessionProvider');
  return ctx;
}
