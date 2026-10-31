import type { IconName } from '../components/ui/Icon';
import { gameAccent, type GameAccentKey } from '../theme/tokens';

export type GameId = GameAccentKey;

export type GameCatalogEntry = {
  id: GameId;
  name: string;
  tagline: string;
  /** One-line punchline for the home card (fits a half card) — the tagline stays for details. */
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
    hook: 'One of you is faking.',
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
    hook: 'Spot the lie.',
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
    hook: 'Don\'t say the word.',
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
    hook: 'Everyone points.',
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
    hook: 'Answer. Pass. Boom.',
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
    hook: 'No neutral answers.',
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
    hook: 'Who knows the most?',
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
    hook: 'Guess your forehead.',
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
    hook: 'Talk. One word. Act.',
    playerCountLabel: '4–20 players',
    sessionLengthLabel: '~20 min',
    accent: gameAccent.mesob,
    icon: 'box',
    playable: true,
  },
  {
    id: 'mizan',
    name: 'Mizan',
    tagline: 'Read each other’s minds on a scale between two opposites.',
    hook: 'One clue. Find the spot.',
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
    hook: 'One wink can kill.',
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
    hook: 'One of you knows.',
    playerCountLabel: '4–12 players',
    sessionLengthLabel: '~10 min',
    accent: gameAccent.insider,
    icon: 'search',
    playable: true,
  },
  {
    id: 'ewnet_weys_saks',
    name: 'Ewnet weys Saks',
    tagline: 'Invent believable answers, find the truth, and score when your friends fall for your bluff.',
    hook: 'Sell the lie. Find the truth.',
    playerCountLabel: '3–8 players',
    sessionLengthLabel: '~15 min',
    accent: gameAccent.ewnet_weys_saks,
    icon: 'pencil',
    playable: true,
  },
  {
    id: 'man_negn',
    name: 'Man Negn?',
    tagline: "See everyone else's identity, then discover your own with yes/no questions.",
    hook: 'Everyone knows but you.',
    playerCountLabel: '2–5 players',
    sessionLengthLabel: '~15 min',
    accent: gameAccent.man_negn,
    icon: 'question',
    playable: true,
  },
];

export function getGame(id: string): GameCatalogEntry | undefined {
  return GAMES.find((game) => game.id === id);
}
