import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { getImpostorCategories } from '../../content/impostor';
import { loadLastPlayerGroup, saveLastPlayerGroup } from '../../storage/players';
import {
  createId,
  defaultImpostorSetup,
  defaultPlayers,
  IMPOSTOR_MAX_PLAYERS,
  IMPOSTOR_MIN_PLAYERS,
  type ContentLevel,
  type ImpostorSetup,
  type Player,
} from './types';

type SetupContextValue = {
  setup: ImpostorSetup;
  hydrated: boolean;
  setPlayers: (players: Player[]) => void;
  addPlayer: () => void;
  removePlayer: (id: string) => void;
  renamePlayer: (id: string, displayName: string) => void;
  movePlayer: (id: string, direction: -1 | 1) => void;
  fillDefaultNames: () => void;
  useLastGroup: () => Promise<boolean>;
  setCategoryIds: (ids: string[]) => void;
  toggleCategory: (id: string) => void;
  selectAllCategories: () => void;
  setContentLevels: (levels: ContentLevel[]) => void;
  toggleContentLevel: (level: ContentLevel) => void;
  acknowledgeSpicy: () => void;
  patchOptions: (patch: Partial<ImpostorSetup>) => void;
  resetSetup: () => void;
  persistPlayers: () => Promise<void>;
  validation: {
    playersOk: boolean;
    categoriesOk: boolean;
    contentOk: boolean;
    spicyOk: boolean;
  };
};

const SetupContext = createContext<SetupContextValue | null>(null);

export function SetupProvider({ children }: { children: ReactNode }) {
  const [setup, setSetup] = useState<ImpostorSetup>(() => {
    const categories = getImpostorCategories().map((category) => category.id);
    return { ...defaultImpostorSetup(), categoryIds: categories };
  });
  const [hydrated, setHydrated] = useState(false);
  const [lastGroup, setLastGroup] = useState<Player[] | null>(null);

  useEffect(() => {
    let active = true;
    loadLastPlayerGroup().then((group) => {
      if (!active) return;
      setLastGroup(group);
      setHydrated(true);
    });
    return () => {
      active = false;
    };
  }, []);

  const setPlayers = useCallback((players: Player[]) => {
    setSetup((prev) => ({
      ...prev,
      players,
      impostorCount: players.length < 8 ? 1 : prev.impostorCount,
    }));
  }, []);

  const addPlayer = useCallback(() => {
    setSetup((prev) => {
      if (prev.players.length >= IMPOSTOR_MAX_PLAYERS) return prev;
      return {
        ...prev,
        players: [
          ...prev.players,
          {
            id: createId('p'),
            displayName: `Player ${prev.players.length + 1}`,
          },
        ],
      };
    });
  }, []);

  const removePlayer = useCallback((id: string) => {
    setSetup((prev) => {
      if (prev.players.length <= IMPOSTOR_MIN_PLAYERS) return prev;
      const players = prev.players.filter((player) => player.id !== id);
      return {
        ...prev,
        players,
        impostorCount: players.length < 8 ? 1 : prev.impostorCount,
      };
    });
  }, []);

  const renamePlayer = useCallback((id: string, displayName: string) => {
    setSetup((prev) => ({
      ...prev,
      players: prev.players.map((player) =>
        player.id === id ? { ...player, displayName } : player,
      ),
    }));
  }, []);

  const movePlayer = useCallback((id: string, direction: -1 | 1) => {
    setSetup((prev) => {
      const index = prev.players.findIndex((player) => player.id === id);
      const next = index + direction;
      if (index < 0 || next < 0 || next >= prev.players.length) return prev;
      const players = [...prev.players];
      const [item] = players.splice(index, 1);
      players.splice(next, 0, item!);
      return { ...prev, players };
    });
  }, []);

  const fillDefaultNames = useCallback(() => {
    setSetup((prev) => ({
      ...prev,
      players: defaultPlayers(Math.max(prev.players.length, IMPOSTOR_MIN_PLAYERS)),
    }));
  }, []);

  const useLastGroup = useCallback(async () => {
    const group = lastGroup ?? (await loadLastPlayerGroup());
    if (!group || group.length < IMPOSTOR_MIN_PLAYERS) return false;
    setLastGroup(group);
    setSetup((prev) => ({
      ...prev,
      players: group,
      impostorCount: group.length < 8 ? 1 : prev.impostorCount,
    }));
    return true;
  }, [lastGroup]);

  const setCategoryIds = useCallback((categoryIds: string[]) => {
    setSetup((prev) => ({ ...prev, categoryIds }));
  }, []);

  const toggleCategory = useCallback((id: string) => {
    setSetup((prev) => {
      const exists = prev.categoryIds.includes(id);
      return {
        ...prev,
        categoryIds: exists
          ? prev.categoryIds.filter((categoryId) => categoryId !== id)
          : [...prev.categoryIds, id],
      };
    });
  }, []);

  const selectAllCategories = useCallback(() => {
    setSetup((prev) => ({
      ...prev,
      categoryIds: getImpostorCategories().map((category) => category.id),
    }));
  }, []);

  const setContentLevels = useCallback((contentLevels: ContentLevel[]) => {
    setSetup((prev) => ({ ...prev, contentLevels }));
  }, []);

  const toggleContentLevel = useCallback((level: ContentLevel) => {
    setSetup((prev) => {
      const exists = prev.contentLevels.includes(level);
      if (exists && prev.contentLevels.length === 1) return prev;
      return {
        ...prev,
        contentLevels: exists
          ? prev.contentLevels.filter((item) => item !== level)
          : [...prev.contentLevels, level],
      };
    });
  }, []);

  const acknowledgeSpicy = useCallback(() => {
    setSetup((prev) => ({ ...prev, spicyAcknowledged: true }));
  }, []);

  const patchOptions = useCallback((patch: Partial<ImpostorSetup>) => {
    setSetup((prev) => ({ ...prev, ...patch }));
  }, []);

  const resetSetup = useCallback(() => {
    const categories = getImpostorCategories().map((category) => category.id);
    setSetup({ ...defaultImpostorSetup(), categoryIds: categories });
  }, []);

  const persistPlayers = useCallback(async () => {
    await saveLastPlayerGroup(setup.players);
    setLastGroup(setup.players);
  }, [setup.players]);

  const validation = useMemo(() => {
    const blank = setup.players.some((player) => !player.displayName.trim());
    const spicySelected = setup.contentLevels.includes('spicy');
    return {
      playersOk:
        setup.players.length >= IMPOSTOR_MIN_PLAYERS &&
        setup.players.length <= IMPOSTOR_MAX_PLAYERS &&
        !blank,
      categoriesOk: setup.categoryIds.length > 0,
      contentOk: setup.contentLevels.length > 0,
      spicyOk: !spicySelected || setup.spicyAcknowledged,
    };
  }, [setup]);

  const value = useMemo(
    () => ({
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
      setContentLevels,
      toggleContentLevel,
      acknowledgeSpicy,
      patchOptions,
      resetSetup,
      persistPlayers,
      validation,
    }),
    [
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
      setContentLevels,
      toggleContentLevel,
      acknowledgeSpicy,
      patchOptions,
      resetSetup,
      persistPlayers,
      validation,
    ],
  );

  return <SetupContext.Provider value={value}>{children}</SetupContext.Provider>;
}

export function useSetup() {
  const ctx = useContext(SetupContext);
  if (!ctx) throw new Error('useSetup must be used within SetupProvider');
  return ctx;
}
