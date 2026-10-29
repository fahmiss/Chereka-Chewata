import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { loadLastPlayerGroup, saveLastPlayerGroup } from '../../storage/players';
import type { BasePlayerSetup, ContentLevel, Player } from './types';
import { createId, defaultPlayers } from './utils';

export type PlayerSetupValue<TSetup extends BasePlayerSetup> = {
  setup: TSetup;
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
  patchOptions: (patch: Partial<TSetup>) => void;
  resetSetup: () => void;
  persistPlayers: () => Promise<void>;
  validation: {
    playersOk: boolean;
    categoriesOk: boolean;
    contentOk: boolean;
    spicyOk: boolean;
  };
};

type Config<TSetup extends BasePlayerSetup> = {
  /** Used in the missing-provider error only. */
  name: string;
  minPlayers: number;
  maxPlayers: number;
  /** Fresh defaults, categories included. */
  defaults: () => TSetup;
  allCategoryIds: () => string[];
  /** Games without a category step always validate categories. */
  usesCategories: boolean;
};

/**
 * Setup draft shared by the named-player games added after the first seven.
 * Same surface as the hand-written setup contexts, so the shared setup screens
 * work unchanged.
 */
export function createPlayerSetup<TSetup extends BasePlayerSetup>(config: Config<TSetup>) {
  const Context = createContext<PlayerSetupValue<TSetup> | null>(null);

  function Provider({ children }: { children: ReactNode }) {
    const [setup, setSetup] = useState<TSetup>(config.defaults);
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
      setSetup((prev) => ({ ...prev, players }));
    }, []);

    const addPlayer = useCallback(() => {
      setSetup((prev) => {
        if (prev.players.length >= config.maxPlayers) return prev;
        return {
          ...prev,
          players: [
            ...prev.players,
            { id: createId('p'), displayName: `Player ${prev.players.length + 1}` },
          ],
        };
      });
    }, []);

    const removePlayer = useCallback((id: string) => {
      setSetup((prev) => {
        if (prev.players.length <= config.minPlayers) return prev;
        return { ...prev, players: prev.players.filter((player) => player.id !== id) };
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
        players: defaultPlayers(Math.max(prev.players.length, config.minPlayers)),
      }));
    }, []);

    const useLastGroup = useCallback(async () => {
      // Always read storage: the Players tab can change the group at any time.
      const group = await loadLastPlayerGroup();
      if (!group || group.length < config.minPlayers) return false;
      setLastGroup(group);
      setSetup((prev) => ({ ...prev, players: group.slice(0, config.maxPlayers) }));
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
      setSetup((prev) => ({ ...prev, categoryIds: config.allCategoryIds() }));
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

    const patchOptions = useCallback((patch: Partial<TSetup>) => {
      setSetup((prev) => ({ ...prev, ...patch }));
    }, []);

    const resetSetup = useCallback(() => setSetup(config.defaults()), []);

    const persistPlayers = useCallback(async () => {
      await saveLastPlayerGroup(setup.players);
      setLastGroup(setup.players);
    }, [setup.players]);

    const validation = useMemo(() => {
      const blank = setup.players.some((player) => !player.displayName.trim());
      return {
        playersOk:
          setup.players.length >= config.minPlayers &&
          setup.players.length <= config.maxPlayers &&
          !blank,
        categoriesOk: !config.usesCategories || setup.categoryIds.length > 0,
        contentOk: setup.contentLevels.length > 0,
        spicyOk: !setup.contentLevels.includes('spicy') || setup.spicyAcknowledged,
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

    return <Context.Provider value={value}>{children}</Context.Provider>;
  }

  function useValue(): PlayerSetupValue<TSetup> {
    const ctx = useContext(Context);
    if (!ctx) throw new Error(`${config.name} setup must be used within its provider`);
    return ctx;
  }

  return { Provider, useSetup: useValue };
}
