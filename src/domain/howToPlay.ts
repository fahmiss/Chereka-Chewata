import type { GameId } from './games';

/**
 * Short “How to play” steps for every game.
 * Used on the game-details screen and the in-session pause menu — keep them
 * identical so first-time and mid-game reads never disagree.
 *
 * Spec §11.1: about three short steps. Full rules can come later.
 */
export const GAME_HOW_TO_PLAY: Record<GameId, string[]> = {
  impostor: [
    'Everyone sees the same secret word — except the Impostor.',
    'Take turns giving one short clue. Never say, spell, or translate the word.',
    'Argue, vote, then let a caught Impostor guess the word.',
  ],
  whos_the_liar: [
    'Everyone gets a question privately — one player got a different one.',
    'Answer aloud in order. Do not read your question out loud.',
    'Argue it out, then tap who the group thinks is the Liar.',
  ],
  taboo: [
    'Split into two teams. One describer sees the word and the forbidden list.',
    'Get teammates to guess before time runs out — without saying banned words.',
    'Correct +1, violation −1. First team to the target score wins.',
  ],
  most_likely: [
    'Read a “Who is most likely to…” prompt aloud.',
    'Countdown together — then everyone points at once.',
    'Laugh, argue, next prompt. No scores required.',
  ],
  would_you_rather: [
    'Read both choices out loud. No neutral answers allowed.',
    'Argue it out — everyone has to defend a side.',
    'Tap the one the room agreed on, then move to the next dilemma.',
  ],
  bomb: [
    'Read the category and start the hidden fuse.',
    'Say a new valid answer (no repeats), then pass the phone.',
    'Whoever holds the phone when it explodes loses the round.',
  ],
  quiz: [
    'Each question has four choices. Pick one, then reveal the answer and a short explanation.',
    'Pass & Play is casual — no scores, just pass the phone.',
    'Compete uses named players, turns, and a leaderboard.',
  ],
  gimbar: [
    'The guesser holds the phone sideways on their forehead, screen facing the room.',
    'Everyone else acts, hums, and describes — never say the word.',
    'Tap the right half when you get it, left to pass. Most cards wins.',
  ],
  mesob: [
    'Everyone secretly drops a few names or things into the mesob. Then split into two teams.',
    'Round 1: describe freely. Round 2: one word only. Round 3: act it out in silence.',
    'The same slips return every round, so jokes build. Most slips guessed wins.',
  ],
  mizan: [
    'A scale sits between two opposites — like Mild ← → Spicy. Only the psychic sees a hidden target on it.',
    'They give one clue that belongs on that scale (near Spicy → “Grandma’s mitmita”), then stay quiet.',
    'Everyone else slides the needle to where the clue sits. Closer to the target scores more (4, 3, or 2).',
  ],
  wink_killer: [
    'The phone secretly deals roles. One player is the Killer.',
    'The Killer winks at victims; when winked, count to five, then fall dramatically.',
    'Accuse if you saw it. Catch the Killer before the room empties — a wrong accuse can knock you out.',
  ],
  insider: [
    'The Master knows the secret word and may only answer Yes, No, or I don’t know.',
    'Phase 1: ask yes/no questions and find the word before time runs out.',
    'Phase 2: one of you already knew it — vote to catch the Insider.',
  ],
  ewnet_weys_saks: [
    'Everyone privately writes a believable fake answer to the same question.',
    'The real answer is mixed with the bluffs. Pass the phone and vote privately.',
    'Earn 2 points for finding the truth and 1 point each time someone picks your bluff.',
  ],
};

export function getHowToPlay(gameId: string): string[] | null {
  return GAME_HOW_TO_PLAY[gameId as GameId] ?? null;
}
