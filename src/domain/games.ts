import type { IconName } from '../components/ui/Icon';
import { gameAccent, type GameAccentKey } from '../theme/tokens';

export type GameId = GameAccentKey;

export type GameCatalogEntry = {
  id: GameId;
  name: string;
  tagline: string;
  playerCountLabel: string;
  sessionLengthLabel: string;
  accent: string;
  /** Sits in the tile medallion — one glyph per game, no emoji. */
  icon: IconName;
  /** Catalog gate — false shows Soon on home / details. */
  playable: boolean;
};

export const GAMES: GameCatalogEntry[] = [
  {
    id: 'impostor',
    name: 'Impostor',
    tagline: 'Find the player who does not know the secret word.',
    playerCountLabel: '3–15 players',
    sessionLengthLabel: '~10 min',
    accent: gameAccent.impostor,
    icon: 'mask',
    playable: true,
  },
  {
    id: 'whos_the_liar',
    name: "Who's the Liar?",
    tagline: 'One player answers a different question. Spot them.',
    playerCountLabel: '3–15 players',
    sessionLengthLabel: '~10 min',
    accent: gameAccent.whos_the_liar,
    icon: 'eye',
    playable: true,
  },
  {
    id: 'taboo',
    name: 'Taboo',
    tagline: 'Help your team guess the word without saying the forbidden clues.',
    playerCountLabel: '4–20 players',
    sessionLengthLabel: '~15 min',
    accent: gameAccent.taboo,
    icon: 'megaphone',
    playable: true,
  },
  {
    id: 'most_likely',
    name: "Who's Most Likely To",
    tagline: 'Read a prompt and point to the person who fits it best.',
    playerCountLabel: '3+ players',
    sessionLengthLabel: '~10 min',
    accent: gameAccent.most_likely,
    icon: 'users',
    playable: true,
  },
  {
    id: 'would_you_rather',
    name: 'Would You Rather',
    tagline: 'Pick between two difficult choices and defend your answer.',
    playerCountLabel: '2+ players',
    sessionLengthLabel: '~10 min',
    accent: gameAccent.would_you_rather,
    icon: 'shuffle',
    playable: true,
  },
];

export function getGame(id: string): GameCatalogEntry | undefined {
  return GAMES.find((game) => game.id === id);
}
