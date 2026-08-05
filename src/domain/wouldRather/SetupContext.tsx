import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { getWouldRatherCategories } from '../../content/wouldRather';
import { defaultWouldRatherSetup, type ContentLevel, type WouldRatherSetup } from './types';

type Value = {
  setup: WouldRatherSetup;
  hydrated: boolean;
  addPlayer: () => void;
  removePlayer: (id: string) => void;
  renamePlayer: (id: string, name: string) => void;
  movePlayer: (id: string, direction: -1 | 1) => void;
  fillDefaultNames: () => void;
  useLastGroup: () => Promise<boolean>;
  setCategoryIds: (ids: string[]) => void;
  toggleCategory: (id: string) => void;
  selectAllCategories: () => void;
  setContentLevels: (levels: ContentLevel[]) => void;
  toggleContentLevel: (level: ContentLevel) => void;
  acknowledgeSpicy: () => void;
  patchOptions: (patch: Partial<WouldRatherSetup>) => void;
  resetSetup: () => void;
  persistPlayers: () => Promise<void>;
  validation: { playersOk: boolean; categoriesOk: boolean; contentOk: boolean; spicyOk: boolean };
};

const Context = createContext<Value | null>(null);

function initialSetup() {
  return { ...defaultWouldRatherSetup(), categoryIds: getWouldRatherCategories().map((item) => item.id) };
}

export function WouldRatherSetupProvider({ children }: { children: ReactNode }) {
  const [setup, setSetup] = useState<WouldRatherSetup>(initialSetup);
  const setCategoryIds = useCallback((categoryIds: string[]) => setSetup((value) => ({ ...value, categoryIds })), []);
  const toggleCategory = useCallback((id: string) => setSetup((value) => ({ ...value, categoryIds: value.categoryIds.includes(id) ? value.categoryIds.filter((item) => item !== id) : [...value.categoryIds, id] })), []);
  const selectAllCategories = useCallback(() => setSetup((value) => ({ ...value, categoryIds: getWouldRatherCategories().map((item) => item.id) })), []);
  const setContentLevels = useCallback((contentLevels: ContentLevel[]) => setSetup((value) => ({ ...value, contentLevels })), []);
  const toggleContentLevel = useCallback((level: ContentLevel) => setSetup((value) => value.contentLevels.includes(level) && value.contentLevels.length === 1 ? value : ({ ...value, contentLevels: value.contentLevels.includes(level) ? value.contentLevels.filter((item) => item !== level) : [...value.contentLevels, level] })), []);
  const acknowledgeSpicy = useCallback(() => setSetup((value) => ({ ...value, spicyAcknowledged: true })), []);
  const patchOptions = useCallback((patch: Partial<WouldRatherSetup>) => setSetup((value) => ({ ...value, ...patch })), []);
  const resetSetup = useCallback(() => setSetup(initialSetup()), []);
  const validation = useMemo(() => ({ playersOk: true, categoriesOk: setup.categoryIds.length > 0, contentOk: setup.contentLevels.length > 0, spicyOk: !setup.contentLevels.includes('spicy') || setup.spicyAcknowledged }), [setup]);
  const noop = useCallback(() => {}, []);
  const noopAsync = useCallback(async () => false, []);
  const persistPlayers = useCallback(async () => {}, []);
  const value = useMemo(() => ({ setup, hydrated: true, addPlayer: noop, removePlayer: noop, renamePlayer: noop, movePlayer: noop, fillDefaultNames: noop, useLastGroup: noopAsync, setCategoryIds, toggleCategory, selectAllCategories, setContentLevels, toggleContentLevel, acknowledgeSpicy, patchOptions, resetSetup, persistPlayers, validation }), [setup, noop, noopAsync, setCategoryIds, toggleCategory, selectAllCategories, setContentLevels, toggleContentLevel, acknowledgeSpicy, patchOptions, resetSetup, persistPlayers, validation]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useWouldRatherSetup() {
  const value = useContext(Context);
  if (!value) throw new Error('useWouldRatherSetup must be used within WouldRatherSetupProvider');
  return value;
}
