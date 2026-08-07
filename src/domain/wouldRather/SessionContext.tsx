import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { chooseSide, createWouldRatherSession, endSession, nextDilemma, rematchSession, skipDilemma } from './machine';
import type { WouldRatherSession, WouldRatherSetup, WouldRatherSide } from './types';
import { useSettings } from '../settings/SettingsContext';

type Value = {
  session: WouldRatherSession | null;
  error: string | null;
  startSession: (setup: WouldRatherSetup) => { session: WouldRatherSession } | { error: string };
  clearSession: () => void;
  clearError: () => void;
  dispatch: {
    chooseSide: (side: WouldRatherSide) => void;
    nextDilemma: () => void;
    skipDilemma: () => void;
    endSession: () => void;
    rematch: () => WouldRatherSession | null;
  };
};

const Context = createContext<Value | null>(null);

export function WouldRatherSessionProvider({ children }: { children: ReactNode }) {
  const { settings } = useSettings();
  const [session, setSession] = useState<WouldRatherSession | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startSession = useCallback(
    (setup: WouldRatherSetup) => {
      const created = createWouldRatherSession(setup, settings.contentLanguage);
      if ('error' in created) {
        setError(created.error);
        return created;
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
  const update = useCallback(
    (fn: (value: WouldRatherSession) => WouldRatherSession) =>
      setSession((value) => (value ? fn(value) : value)),
    [],
  );
  const dispatch = useMemo(
    () => ({
      chooseSide: (side: WouldRatherSide) => update((value) => chooseSide(value, side)),
      nextDilemma: () => update(nextDilemma),
      skipDilemma: () => update(skipDilemma),
      endSession: () => update(endSession),
      rematch: () => {
        if (!session) return null;
        const created = rematchSession(session);
        if ('error' in created) {
          setError(created.error);
          return null;
        }
        setSession(created);
        return created;
      },
    }),
    [session, update],
  );
  const value = useMemo(
    () => ({ session, error, startSession, clearSession, clearError, dispatch }),
    [session, error, startSession, clearSession, clearError, dispatch],
  );
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useWouldRatherSession() {
  const value = useContext(Context);
  if (!value) throw new Error('useWouldRatherSession must be used within WouldRatherSessionProvider');
  return value;
}
