import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useSettings } from '../settings/SettingsContext';
import type { ContentLanguage } from './types';

type Created<TSession> = TSession | { error: string };

export type GameSessionValue<TSession, TSetup> = {
  session: TSession | null;
  error: string | null;
  startSession: (setup: TSetup) => { session: TSession } | { error: string };
  clearSession: () => void;
  clearError: () => void;
  /** Run one pure machine transition against the live session. */
  apply: (transition: (current: TSession) => TSession) => void;
  /** Fresh round with the same setup; null when the deck cannot supply one. */
  rematch: () => TSession | null;
};

type Config<TSession, TSetup> = {
  name: string;
  create: (setup: TSetup, contentLanguage: ContentLanguage) => Created<TSession>;
  rematch: (session: TSession) => Created<TSession>;
};

/**
 * In-memory session store for the newer games. Machines stay pure; this only
 * holds the current value, so secrets live and die with the provider state.
 */
export function createGameSession<TSession, TSetup>(config: Config<TSession, TSetup>) {
  const Context = createContext<GameSessionValue<TSession, TSetup> | null>(null);

  function Provider({ children }: { children: ReactNode }) {
    const { settings } = useSettings();
    const [session, setSession] = useState<TSession | null>(null);
    const [error, setError] = useState<string | null>(null);

    const startSession = useCallback(
      (setup: TSetup) => {
        const created = config.create(setup, settings.contentLanguage);
        if (typeof created === 'object' && created !== null && 'error' in created) {
          setError(created.error);
          return { error: created.error };
        }
        setError(null);
        setSession(created as TSession);
        return { session: created as TSession };
      },
      [settings.contentLanguage],
    );

    const clearSession = useCallback(() => {
      setSession(null);
      setError(null);
    }, []);

    const clearError = useCallback(() => setError(null), []);

    const apply = useCallback((transition: (current: TSession) => TSession) => {
      setSession((current) => (current ? transition(current) : current));
    }, []);

    const rematch = useCallback(() => {
      if (!session) return null;
      const created = config.rematch(session);
      if (typeof created === 'object' && created !== null && 'error' in created) {
        setError(created.error);
        return null;
      }
      setError(null);
      setSession(created as TSession);
      return created as TSession;
    }, [session]);

    const value = useMemo(
      () => ({ session, error, startSession, clearSession, clearError, apply, rematch }),
      [session, error, startSession, clearSession, clearError, apply, rematch],
    );

    return <Context.Provider value={value}>{children}</Context.Provider>;
  }

  function useValue(): GameSessionValue<TSession, TSetup> {
    const ctx = useContext(Context);
    if (!ctx) throw new Error(`${config.name} session must be used within its provider`);
    return ctx;
  }

  return { Provider, useSession: useValue };
}
