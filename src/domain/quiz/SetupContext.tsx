import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { getQuizCategories } from '../../content/quiz';
import { loadLastPlayerGroup, saveLastPlayerGroup } from '../../storage/players';
import {
  createId,
  defaultPlayers,
  defaultQuizSetup,
  QUIZ_MAX_PLAYERS,
  QUIZ_MIN_PLAYERS,
  type QuizPlayer,
  type QuizSetup,
  type QuizCompatibilityContentLevel,
} from './types';

type Value = {
  setup: QuizSetup;
  hydrated: boolean;
  setPlayers: (players: QuizPlayer[]) => void;
  addPlayer: () => void;
  removePlayer: (id: string) => void;
  renamePlayer: (id: string, name: string) => void;
  movePlayer: (id: string, direction: -1 | 1) => void;
  fillDefaultNames: () => void;
  useLastGroup: () => Promise<boolean>;
  setCategoryIds: (ids: string[]) => void;
  toggleCategory: (id: string) => void;
  selectAllCategories: () => void;
  setContentLevels: (levels: QuizCompatibilityContentLevel[]) => void;
  toggleContentLevel: (level: QuizCompatibilityContentLevel) => void;
  acknowledgeSpicy: () => void;
  patchOptions: (patch: Partial<QuizSetup>) => void;
  resetSetup: () => void;
  persistPlayers: () => Promise<void>;
  validation: { playersOk: boolean; categoriesOk: boolean; contentOk: boolean; spicyOk: boolean };
};

const Context = createContext<Value | null>(null);

function initialSetup(): QuizSetup {
  return {
    ...defaultQuizSetup(),
    categoryIds: getQuizCategories().map((category) => category.id),
  };
}

export function QuizSetupProvider({ children }: { children: ReactNode }) {
  const [setup, setSetup] = useState<QuizSetup>(initialSetup);
  const [hydrated, setHydrated] = useState(false);
  const [lastGroup, setLastGroup] = useState<QuizPlayer[] | null>(null);

  useEffect(() => {
    let active = true;
    loadLastPlayerGroup().then((group) => {
      if (!active) return;
      setLastGroup(group);
      setHydrated(true);
    });
    return () => { active = false; };
  }, []);

  const setPlayers = useCallback((players: QuizPlayer[]) => {
    setSetup((value) => ({ ...value, players }));
  }, []);
  const addPlayer = useCallback(() => {
    setSetup((value) =>
      value.players.length >= QUIZ_MAX_PLAYERS
        ? value
        : {
            ...value,
            players: [
              ...value.players,
              { id: createId('p'), displayName: `Player ${value.players.length + 1}` },
            ],
          },
    );
  }, []);
  const removePlayer = useCallback((id: string) => {
    setSetup((value) =>
      value.players.length <= QUIZ_MIN_PLAYERS
        ? value
        : { ...value, players: value.players.filter((player) => player.id !== id) },
    );
  }, []);
  const renamePlayer = useCallback((id: string, displayName: string) => {
    setSetup((value) => ({
      ...value,
      players: value.players.map((player) =>
        player.id === id ? { ...player, displayName } : player,
      ),
    }));
  }, []);
  const movePlayer = useCallback((id: string, direction: -1 | 1) => {
    setSetup((value) => {
      const index = value.players.findIndex((player) => player.id === id);
      const next = index + direction;
      if (index < 0 || next < 0 || next >= value.players.length) return value;
      const players = [...value.players];
      const [player] = players.splice(index, 1);
      players.splice(next, 0, player!);
      return { ...value, players };
    });
  }, []);
  const fillDefaultNames = useCallback(() => {
    setSetup((value) => ({
      ...value,
      players: defaultPlayers(Math.max(value.players.length, QUIZ_MIN_PLAYERS)),
    }));
  }, []);
  const useLastGroup = useCallback(async () => {
    const group = lastGroup ?? (await loadLastPlayerGroup());
    if (!group || group.length < QUIZ_MIN_PLAYERS) return false;
    const players = group.slice(0, QUIZ_MAX_PLAYERS);
    setLastGroup(players);
    setSetup((value) => ({ ...value, players }));
    return true;
  }, [lastGroup]);

  const setCategoryIds = useCallback((categoryIds: string[]) => {
    setSetup((value) => ({ ...value, categoryIds }));
  }, []);
  const toggleCategory = useCallback((id: string) => {
    setSetup((value) => ({
      ...value,
      categoryIds: value.categoryIds.includes(id)
        ? value.categoryIds.filter((categoryId) => categoryId !== id)
        : [...value.categoryIds, id],
    }));
  }, []);
  const selectAllCategories = useCallback(() => {
    setSetup((value) => ({
      ...value,
      categoryIds: getQuizCategories().map((category) => category.id),
    }));
  }, []);
  const patchOptions = useCallback((patch: Partial<QuizSetup>) => {
    setSetup((value) => ({ ...value, ...patch }));
  }, []);
  const resetSetup = useCallback(() => setSetup(initialSetup()), []);
  const persistPlayers = useCallback(async () => {
    if (setup.playMode !== 'compete') return;
    await saveLastPlayerGroup(setup.players);
    setLastGroup(setup.players);
  }, [setup.playMode, setup.players]);
  const noop = useCallback(() => {}, []);
  const noopLevels = useCallback((_levels: QuizCompatibilityContentLevel[]) => {}, []);
  const noopLevel = useCallback((_level: QuizCompatibilityContentLevel) => {}, []);

  const validation = useMemo(() => ({
    playersOk:
      setup.playMode === 'pass_play' ||
      (setup.players.length >= QUIZ_MIN_PLAYERS &&
        setup.players.length <= QUIZ_MAX_PLAYERS &&
        setup.players.every((player) => !!player.displayName.trim())),
    categoriesOk: setup.categoryIds.length > 0,
    contentOk: true,
    spicyOk: true,
  }), [setup]);

  const value = useMemo(() => ({
    setup,
    hydrated,
    setPlayers,
    addPlayer,
    removePlayer,
    renamePlayer,
    movePlayer,
    fillDefaultNames,
    useLastGroup,
    setCategoryIds,
    toggleCategory,
    selectAllCategories,
    setContentLevels: noopLevels,
    toggleContentLevel: noopLevel,
    acknowledgeSpicy: noop,
    patchOptions,
    resetSetup,
    persistPlayers,
    validation,
  }), [setup, hydrated, setPlayers, addPlayer, removePlayer, renamePlayer, movePlayer,
    fillDefaultNames, useLastGroup, setCategoryIds, toggleCategory, selectAllCategories,
    noop, noopLevels, noopLevel, patchOptions, resetSetup, persistPlayers, validation]);

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useQuizSetup() {
  const value = useContext(Context);
  if (!value) throw new Error('useQuizSetup must be used within QuizSetupProvider');
  return value;
}
