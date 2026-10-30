import type { IconName } from '../components/ui/Icon';
import { gameAccent, type GameAccentKey } from '../theme/tokens';

export type GameId = GameAccentKey;

export type GameCatalogEntry = {
  id: GameId;
  name: string;
  tagline: string;
  /** Short punchline for the home card — the tagline stays for the details screen. */
  hook: string;
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
    hook: 'One of you is faking it. Find them.',
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
    hook: 'Spot the lie. Call them out.',
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
    hook: 'Describe it without saying it.',
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
    hook: 'Everyone points. No take-backs.',
    playerCountLabel: '3+ players',
    sessionLengthLabel: '~10 min',
    accent: gameAccent.most_likely,
    icon: 'users',
    playable: true,
  },
  {
    id: 'bomb',
    name: "Who's Got the Bomb?",
    tagline: 'Name an answer, pass the phone, and hope the hidden fuse keeps ticking.',
    hook: 'Answer fast. Pass faster.',
    playerCountLabel: '2–15 players',
    sessionLengthLabel: '~10 min',
    accent: gameAccent.bomb,
    icon: 'bomb',
    playable: true,
  },
  {
    id: 'would_you_rather',
    name: 'Would You Rather',
    tagline: 'Pick between two difficult choices and defend your answer.',
    hook: 'Tough choices. Loud arguments.',
    playerCountLabel: '2+ players',
    sessionLengthLabel: '~10 min',
    accent: gameAccent.would_you_rather,
    icon: 'shuffle',
    playable: true,
  },
  {
    id: 'quiz',
    name: 'Quiz',
    tagline: 'Answer four-choice trivia casually or compete for the top score.',
    hook: 'Who really knows the most?',
    playerCountLabel: '2+ players',
    sessionLengthLabel: '~10–20 min',
    accent: gameAccent.quiz,
    icon: 'question',
    playable: true,
  },
  {
    id: 'gimbar',
    name: 'Gimbar',
    tagline: 'Hold the phone to your forehead while friends act, hum and describe.',
    hook: 'Guess the word on your forehead.',
    playerCountLabel: '2–20 players',
    sessionLengthLabel: '~10 min',
    accent: gameAccent.gimbar,
    icon: 'phone',
    playable: true,
  },
  {
    id: 'mesob',
    name: 'Mesob',
    tagline: 'Fill the basket with names, then guess them three ways: talk, one word, act.',
    hook: 'Three rounds. Same names. Chaos.',
    playerCountLabel: '4–20 players',
    sessionLengthLabel: '~20 min',
    accent: gameAccent.mesob,
    icon: 'box',
    playable: true,
  },
  {
    id: 'mizan',
    name: 'Mizan',
    tagline: 'One clue, one hidden point on a scale. Read each other’s minds.',
    hook: 'Read minds on a sliding scale.',
    playerCountLabel: '2–20 players',
    sessionLengthLabel: '~15 min',
    accent: gameAccent.mizan,
    icon: 'gauge',
    playable: true,
  },
  {
    id: 'wink_killer',
    name: 'Wink Killer',
    tagline: 'A secret killer strikes with a wink. Catch them before the room empties.',
    hook: 'One wink can kill. Watch closely.',
    playerCountLabel: '4–30 players',
    sessionLengthLabel: '~10 min',
    accent: gameAccent.wink_killer,
    icon: 'eyeOff',
    playable: true,
  },
  {
    id: 'insider',
    name: 'Insider',
    tagline: 'Guess the secret word with yes/no questions, then expose who already knew it.',
    hook: 'Someone already knows the answer.',
    playerCountLabel: '4–12 players',
    sessionLengthLabel: '~10 min',
    accent: gameAccent.insider,
    icon: 'search',
    playable: true,
  },
];

export function getGame(id: string): GameCatalogEntry | undefined {
  return GAMES.find((game) => game.id === id);
}
