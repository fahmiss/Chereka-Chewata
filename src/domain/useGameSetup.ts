import { getGame } from './games';
import { useBombSetup } from './bomb/SetupContext';
import { useSetup } from './impostor/SetupContext';
import { useLiarSetup } from './liar/SetupContext';
import { useMostLikelySetup } from './mostLikely/SetupContext';
import { useTabooSetup } from './taboo/SetupContext';
import { useWouldRatherSetup } from './wouldRather/SetupContext';
import { useQuizSetup } from './quiz/SetupContext';
import { color } from '../theme/tokens';
import { countGimbarCards, getGimbarCategories } from '../content/gimbar';
import { getImpostorCategories } from '../content/impostor';
import { countInsiderWords } from '../content/insider';
import { countMizanSpectra } from '../content/mizan';
import { useGimbarSetup } from './gimbar/context';
import { GIMBAR_MAX_PLAYERS, GIMBAR_MIN_PLAYERS } from './gimbar/types';
import { useInsiderSetup } from './insider/context';
import { INSIDER_MAX_PLAYERS, INSIDER_MIN_PLAYERS } from './insider/types';
import { useMesobSetup } from './mesob/context';
import { MESOB_MAX_PLAYERS, MESOB_MIN_PLAYERS } from './mesob/types';
import { useMizanSetup } from './mizan/context';
import { MIZAN_MAX_PLAYERS, MIZAN_MIN_PLAYERS } from './mizan/types';
import type { ContentLanguage, ContentLevel } from './shared/types';
import { useWinkKillerSetup } from './winkKiller/context';
import { WINK_MAX_PLAYERS, WINK_MIN_PLAYERS } from './winkKiller/types';

type CardCountQuery = {
  categoryIds: string[];
  contentLevels: ContentLevel[];
  contentLanguage: ContentLanguage;
};

/**
 * What the shared setup screens need to know about the newer games.
 * The first seven games keep their original branches in each screen.
 */
export type GameSetupSpec = {
  minPlayers: number;
  maxPlayers: number;
  getCategories: () => { id: string; name_en: string; name_am?: string }[];
  countCards: (query: CardCountQuery) => number;
};

const NO_CATEGORIES = () => [];

export const GAME_SETUP_SPECS: Record<string, GameSetupSpec> = {
  gimbar: {
    minPlayers: GIMBAR_MIN_PLAYERS,
    maxPlayers: GIMBAR_MAX_PLAYERS,
    getCategories: getGimbarCategories,
    countCards: countGimbarCards,
  },
  mesob: {
    minPlayers: MESOB_MIN_PLAYERS,
    maxPlayers: MESOB_MAX_PLAYERS,
    getCategories: getGimbarCategories,
    countCards: countGimbarCards,
  },
  mizan: {
    minPlayers: MIZAN_MIN_PLAYERS,
    maxPlayers: MIZAN_MAX_PLAYERS,
    getCategories: NO_CATEGORIES,
    countCards: countMizanSpectra,
  },
  wink_killer: {
    minPlayers: WINK_MIN_PLAYERS,
    maxPlayers: WINK_MAX_PLAYERS,
    getCategories: NO_CATEGORIES,
    countCards: () => 0,
  },
  insider: {
    minPlayers: INSIDER_MIN_PLAYERS,
    maxPlayers: INSIDER_MAX_PLAYERS,
    getCategories: getImpostorCategories,
    countCards: countInsiderWords,
  },
};

/**
 * Shared setup surface for all playable games.
 * Providers stay mounted; this picks the active draft by route gameId.
 */
export function useGameSetup(gameId: string | undefined) {
  const impostor = useSetup();
  const liar = useLiarSetup();
  const taboo = useTabooSetup();
  const mostLikely = useMostLikelySetup();
  const wouldRather = useWouldRatherSetup();
  const bomb = useBombSetup();
  const quiz = useQuizSetup();
  const gimbar = useGimbarSetup();
  const mesob = useMesobSetup();
  const mizan = useMizanSetup();
  const winkKiller = useWinkKillerSetup();
  const insider = useInsiderSetup();
  const game = getGame(String(gameId ?? ''));
  const spec = GAME_SETUP_SPECS[String(gameId ?? '')] ?? null;
  const extra =
    gameId === 'gimbar'
      ? gimbar
      : gameId === 'mesob'
        ? mesob
        : gameId === 'mizan'
          ? mizan
          : gameId === 'wink_killer'
            ? winkKiller
            : gameId === 'insider'
              ? insider
              : null;

  const isLiar = gameId === 'whos_the_liar';
  const isTaboo = gameId === 'taboo';
  const isMostLikely = gameId === 'most_likely';
  const isWouldRather = gameId === 'would_you_rather';
  const isBomb = gameId === 'bomb';
  const isQuiz = gameId === 'quiz';

  const active = extra
    ? extra
    : isQuiz
    ? quiz
    : isBomb
      ? bomb
    : isWouldRather
      ? wouldRather
      : isMostLikely
        ? mostLikely
        : isTaboo
          ? taboo
          : isLiar
            ? liar
            : impostor;

  const accent =
    game?.accent ??
    (isQuiz
      ? color.gameQuiz
      : isMostLikely
      ? color.gameMostLikely
      : isBomb
        ? color.gameBomb
        : isTaboo
          ? color.gameTaboo
          : isLiar
            ? color.gameLiar
            : color.gameImpostor);

  return {
    ...active,
    isLiar,
    isTaboo,
    isMostLikely,
    isWouldRather,
    isBomb,
    isQuiz,
    isImpostor:
      !extra && !isLiar && !isTaboo && !isMostLikely && !isWouldRather && !isBomb && !isQuiz,
    spec,
    accent,
    gameName: game?.name ?? 'Game',
  };
}
