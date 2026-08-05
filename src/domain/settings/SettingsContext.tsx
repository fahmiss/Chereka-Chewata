import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { clearCardHistory, loadSettings, saveSettings } from '../../storage/settings';
import { setSettingsSnapshot } from './snapshot';
import {
  defaultSettings,
  type AppSettings,
  type ContentLanguage,
  type InterfaceLanguage,
} from './types';

type SettingsContextValue = {
  settings: AppSettings;
  ready: boolean;
  setSoundEnabled: (value: boolean) => void;
  setVibrationEnabled: (value: boolean) => void;
  setReduceMotion: (value: boolean) => void;
  setInterfaceLanguage: (value: InterfaceLanguage) => void;
  setContentLanguage: (value: ContentLanguage) => void;
  /** Persist a full language pair (used by the first-launch gate). */
  setLanguages: (interfaceLanguage: InterfaceLanguage, contentLanguage: ContentLanguage) => void;
  resetCardHistory: () => Promise<void>;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    void loadSettings().then((loaded) => {
      if (!alive) return;
      setSettings(loaded);
      setSettingsSnapshot(loaded);
      setReady(true);
    });
    return () => {
      alive = false;
    };
  }, []);

  const commit = useCallback((next: AppSettings) => {
    setSettings(next);
    setSettingsSnapshot(next);
    void saveSettings(next);
  }, []);

  const value = useMemo<SettingsContextValue>(
    () => ({
      settings,
      ready,
      setSoundEnabled: (soundEnabled) => commit({ ...settings, soundEnabled }),
      setVibrationEnabled: (vibrationEnabled) => commit({ ...settings, vibrationEnabled }),
      setReduceMotion: (reduceMotion) => commit({ ...settings, reduceMotion }),
      setInterfaceLanguage: (interfaceLanguage) => commit({ ...settings, interfaceLanguage }),
      setContentLanguage: (contentLanguage) => commit({ ...settings, contentLanguage }),
      setLanguages: (interfaceLanguage, contentLanguage) =>
        commit({ ...settings, interfaceLanguage, contentLanguage }),
      resetCardHistory: () => clearCardHistory(),
    }),
    [settings, ready, commit],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
