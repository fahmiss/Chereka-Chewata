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
  continueAfterExplosion,
  createBombSession,
  explodeBomb,
  pauseBomb,
  resumeBomb,
  skipBombCard,
  startBomb,
} from './machine';
import type { BombSession, BombSetup } from './types';

type BombSessionContextValue = {
  session: BombSession | null;
  error: string | null;
  startSession: (setup: BombSetup) => { session: BombSession } | { error: string };
  clearSession: () => void;
  clearError: () => void;
  dispatch: {
    startBomb: () => void;
    pauseBomb: () => void;
    resumeBomb: () => void;
    explodeBomb: () => void;
    continueAfterExplosion: () => void;
    skipCard: () => void;
  };
};

const BombSessionContext = createContext<BombSessionContextValue | null>(null);

export function BombSessionProvider({ children }: { children: ReactNode }) {
  const { settings } = useSettings();
  const [session, setSession] = useState<BombSession | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startSession = useCallback(
    (setup: BombSetup) => {
      const created = createBombSession(setup, settings.contentLanguage);
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
  const update = useCallback((fn: (current: BombSession) => BombSession) => {
    setSession((current) => (current ? fn(current) : current));
  }, []);

  const dispatch = useMemo(
    () => ({
      startBomb: () => update(startBomb),
      pauseBomb: () => update(pauseBomb),
      resumeBomb: () => update(resumeBomb),
      explodeBomb: () => update(explodeBomb),
      continueAfterExplosion: () => update(continueAfterExplosion),
      skipCard: () => update(skipBombCard),
    }),
    [update],
  );

  const value = useMemo(
    () => ({ session, error, startSession, clearSession, clearError, dispatch }),
    [session, error, startSession, clearSession, clearError, dispatch],
  );

  return <BombSessionContext.Provider value={value}>{children}</BombSessionContext.Provider>;
}

export function useBombSession() {
  const value = useContext(BombSessionContext);
  if (!value) throw new Error('useBombSession must be used within BombSessionProvider');
  return value;
}
