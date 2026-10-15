import { createContext, useContext, type ReactNode } from 'react';

type SessionControlsValue = {
  rules: string[];
  onRestartRound: () => void;
};

const SessionControlsContext = createContext<SessionControlsValue | null>(null);

export function SessionControlsProvider({
  children,
  rules,
  onRestartRound,
}: SessionControlsValue & { children: ReactNode }) {
  return (
    <SessionControlsContext.Provider value={{ rules, onRestartRound }}>
      {children}
    </SessionControlsContext.Provider>
  );
}

export function useSessionControls() {
  return useContext(SessionControlsContext);
}

