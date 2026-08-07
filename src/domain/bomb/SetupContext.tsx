import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { getBombCategories } from '../../content/bomb';
import { loadLastPlayerGroup, saveLastPlayerGroup } from '../../storage/players';
import {
  BOMB_MAX_PLAYERS,
  BOMB_MIN_PLAYERS,
  createId,
  defaultBombSetup,
  defaultPlayers,
  type BombSetup,
  type ContentLevel,
  type Player,
} from './types';

type BombSetupContextValue = {
  setup: BombSetup;
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
  patchOptions: (patch: Partial<BombSetup>) => void;
  resetSetup: () => void;
  persistPlayers: () => Promise<void>;
  validation: {
    playersOk: boolean;
    categoriesOk: boolean;
    contentOk: boolean;
    spicyOk: boolean;
  };
};

const BombSetupContext = createContext<BombSetupContextValue | null>(null);

export function BombSetupProvider({ children }: { children: ReactNode }) {
  const [setup, setSetup] = useState<BombSetup>(() => ({
    ...defaultBombSetup(),
    categoryIds: getBombCategories().map((category) => category.id),
  }));
  const [hydrated, setHydrated] = useState(false);
  const [lastGroup, setLastGroup] = useState<Player[] | null>(null);

  useEffect(() => {
    let active = true;
    loadLastPlayerGroup().then((group) => {
      if (!active) return;
      setLastGroup(group);
      setHydrated(true);
    });
    return () => { active = false; };
  }, []);

  const setPlayers = useCallback((players: Player[]) => {
    setSetup((previous) => ({ ...previous, players }));
  }, []);
  const addPlayer = useCallback(() => {
    setSetup((previous) =>
      previous.players.length >= BOMB_MAX_PLAYERS
        ? previous
        : {
            ...previous,
            players: [
              ...previous.players,
              { id: createId('p'), displayName: `Player ${previous.players.length + 1}` },
            ],
          },
    );
  }, []);
  const removePlayer = useCallback((id: string) => {
    setSetup((previous) =>
      previous.players.length <= BOMB_MIN_PLAYERS
        ? previous
        : { ...previous, players: previous.players.filter((player) => player.id !== id) },
    );
  }, []);
  const renamePlayer = useCallback((id: string, displayName: string) => {
    setSetup((previous) => ({
      ...previous,
      players: previous.players.map((player) =>
        player.id === id ? { ...player, displayName } : player,
      ),
    }));
  }, []);
  const movePlayer = useCallback((id: string, direction: -1 | 1) => {
    setSetup((previous) => {
      const index = previous.players.findIndex((player) => player.id === id);
      const next = index + direction;
      if (index < 0 || next < 0 || next >= previous.players.length) return previous;
      const players = [...previous.players];
      const [player] = players.splice(index, 1);
      players.splice(next, 0, player!);
      return { ...previous, players };
    });
  }, []);
  const fillDefaultNames = useCallback(() => {
    setSetup((previous) => ({
      ...previous,
      players: defaultPlayers(Math.max(previous.players.length, BOMB_MIN_PLAYERS)),
    }));
  }, []);
  const useLastGroup = useCallback(async () => {
    const group = lastGroup ?? (await loadLastPlayerGroup());
    if (!group || group.length < BOMB_MIN_PLAYERS) return false;
    const players = group.slice(0, BOMB_MAX_PLAYERS);
    setLastGroup(players);
    setSetup((previous) => ({ ...previous, players }));
    return true;
  }, [lastGroup]);

  const setCategoryIds = useCallback((categoryIds: string[]) => {
    setSetup((previous) => ({ ...previous, categoryIds }));
  }, []);
  const toggleCategory = useCallback((id: string) => {
    setSetup((previous) => ({
      ...previous,
      categoryIds: previous.categoryIds.includes(id)
        ? previous.categoryIds.filter((categoryId) => categoryId !== id)
        : [...previous.categoryIds, id],
    }));
  }, []);
  const selectAllCategories = useCallback(() => {
    setSetup((previous) => ({
      ...previous,
      categoryIds: getBombCategories().map((category) => category.id),
    }));
  }, []);
  const setContentLevels = useCallback((contentLevels: ContentLevel[]) => {
    setSetup((previous) => ({ ...previous, contentLevels }));
  }, []);
  const toggleContentLevel = useCallback((level: ContentLevel) => {
    setSetup((previous) => {
      const selected = previous.contentLevels.includes(level);
      if (selected && previous.contentLevels.length === 1) return previous;
      return {
        ...previous,
        contentLevels: selected
          ? previous.contentLevels.filter((item) => item !== level)
          : [...previous.contentLevels, level],
      };
    });
  }, []);
  const acknowledgeSpicy = useCallback(() => {
    setSetup((previous) => ({ ...previous, spicyAcknowledged: true }));
  }, []);
  const patchOptions = useCallback((patch: Partial<BombSetup>) => {
    setSetup((previous) => ({ ...previous, ...patch }));
  }, []);
  const resetSetup = useCallback(() => {
    setSetup({
      ...defaultBombSetup(),
      categoryIds: getBombCategories().map((category) => category.id),
    });
  }, []);
  const persistPlayers = useCallback(async () => {
    await saveLastPlayerGroup(setup.players);
    setLastGroup(setup.players);
  }, [setup.players]);

  const validation = useMemo(() => {
    const spicySelected = setup.contentLevels.includes('spicy');
    return {
      playersOk:
        setup.players.length >= BOMB_MIN_PLAYERS &&
        setup.players.length <= BOMB_MAX_PLAYERS &&
        setup.players.every((player) => !!player.displayName.trim()),
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
    [setup, hydrated, setPlayers, addPlayer, removePlayer, renamePlayer, movePlayer,
      fillDefaultNames, useLastGroup, setCategoryIds, toggleCategory,
      selectAllCategories, setContentLevels, toggleContentLevel, acknowledgeSpicy,
      patchOptions, resetSetup, persistPlayers, validation],
  );

  return <BombSetupContext.Provider value={value}>{children}</BombSetupContext.Provider>;
}

export function useBombSetup() {
  const value = useContext(BombSetupContext);
  if (!value) throw new Error('useBombSetup must be used within BombSetupProvider');
  return value;
}
