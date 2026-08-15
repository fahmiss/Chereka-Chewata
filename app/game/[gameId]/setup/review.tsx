import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  QuickControlBlock,
  QuickControls,
  QuickDivider,
  QuickSetup,
  type QuickLink,
} from '../../../../src/components/setup/QuickSetup';
import { Segmented, Toggle } from '../../../../src/components/ui/Selectable';
import { countBombCards, getBombCategories } from '../../../../src/content/bomb';
import {
  countImpostorWords,
  getImpostorCategories,
} from '../../../../src/content/impostor';
import { countLiarPairs, getLiarCategories } from '../../../../src/content/liar';
import {
  countMostLikelyPrompts,
  getMostLikelyCategories,
} from '../../../../src/content/mostLikely';
import { countTabooCards, getTabooCategories } from '../../../../src/content/taboo';
import {
  countWouldRatherDilemmas,
  getWouldRatherCategories,
} from '../../../../src/content/wouldRather';
import { countQuizQuestions, getQuizCategories } from '../../../../src/content/quiz';
import { getGame } from '../../../../src/domain/games';
import { useBombSession } from '../../../../src/domain/bomb/SessionContext';
import { useBombSetup } from '../../../../src/domain/bomb/SetupContext';
import { useSession } from '../../../../src/domain/impostor/SessionContext';
import { useSetup } from '../../../../src/domain/impostor/SetupContext';
import { useLiarSession } from '../../../../src/domain/liar/SessionContext';
import { useLiarSetup } from '../../../../src/domain/liar/SetupContext';
import { useMostLikelySession } from '../../../../src/domain/mostLikely/SessionContext';
import { useMostLikelySetup } from '../../../../src/domain/mostLikely/SetupContext';
import { useTabooSession } from '../../../../src/domain/taboo/SessionContext';
import { useTabooSetup } from '../../../../src/domain/taboo/SetupContext';
import { useWouldRatherSession } from '../../../../src/domain/wouldRather/SessionContext';
import { useWouldRatherSetup } from '../../../../src/domain/wouldRather/SetupContext';
import { useQuizSession } from '../../../../src/domain/quiz/SessionContext';
import { useQuizSetup } from '../../../../src/domain/quiz/SetupContext';
import type { QuizDifficultyFilter } from '../../../../src/domain/quiz/types';
import { useSettings } from '../../../../src/domain/settings/SettingsContext';
import { color } from '../../../../src/theme/tokens';

type Player = { id: string; displayName: string };

export default function ReviewScreen() {
  const { gameId } = useLocalSearchParams<{ gameId: string }>();
  const id = String(gameId);

  if (id === 'whos_the_liar') return <LiarQuickSetup gameId={id} />;
  if (id === 'taboo') return <TabooQuickSetup gameId={id} />;
  if (id === 'most_likely') return <MostLikelyQuickSetup gameId={id} />;
  if (id === 'would_you_rather') return <WouldRatherQuickSetup gameId={id} />;
  if (id === 'bomb') return <BombQuickSetup gameId={id} />;
  if (id === 'quiz') return <QuizQuickSetup gameId={id} />;
  return <ImpostorQuickSetup gameId={id} />;
}

/* ------------------------------------------------------------------ *
 * Shared helpers
 * ------------------------------------------------------------------ */

/**
 * Only one session may be live at a time — starting a game clears every
 * other game's in-memory state, secrets included.
 */
function useStartGame() {
  const impostor = useSession();
  const liar = useLiarSession();
  const taboo = useTabooSession();
  const mostLikely = useMostLikelySession();
  const wouldRather = useWouldRatherSession();
  const bomb = useBombSession();
  const quiz = useQuizSession();

  return (keep: 'impostor' | 'liar' | 'taboo' | 'mostLikely' | 'wouldRather' | 'bomb' | 'quiz') => {
    if (keep !== 'impostor') impostor.clearSession();
    if (keep !== 'liar') liar.clearSession();
    if (keep !== 'taboo') taboo.clearSession();
    if (keep !== 'mostLikely') mostLikely.clearSession();
    if (keep !== 'wouldRather') wouldRather.clearSession();
    if (keep !== 'bomb') bomb.clearSession();
    if (keep !== 'quiz') quiz.clearSession();
  };
}

/* ------------------------------------------------------------------ *
 * Quiz
 * ------------------------------------------------------------------ */

function QuizQuickSetup({ gameId }: { gameId: string }) {
  const accent = getGame(gameId)?.accent ?? color.gameQuiz;
  const { setup, validation, persistPlayers, patchOptions } = useQuizSetup();
  const { startSession, clearError } = useQuizSession();
  const { settings } = useSettings();
  const clearOthers = useStartGame();
  const [startError, setStartError] = useState<string | null>(null);

  const totalCategories = getQuizCategories().length;
  const questionCount = countQuizQuestions({
    categoryIds: setup.categoryIds,
    difficulty: setup.difficulty,
    contentLanguage: settings.contentLanguage,
  });
  const canStart = validation.playersOk && validation.categoriesOk && questionCount > 0;

  const onStart = async () => {
    clearError();
    clearOthers('quiz');
    await persistPlayers();
    const result = startSession(setup);
    if ('error' in result) {
      setStartError(result.error);
      return;
    }
    router.replace(`/session/${result.session.sessionId}`);
  };

  const links: QuickLink[] = [
    {
      icon: setup.playMode === 'compete' ? 'trophy' : 'phone',
      title: 'Play mode',
      value: setup.playMode === 'compete' ? 'Compete' : 'Pass & Play',
      detail:
        setup.playMode === 'compete'
          ? 'Named players · scoring · leaderboard'
          : 'No names · no scores · pass after each answer',
      href: '/game/quiz/mode',
    },
    ...(setup.playMode === 'compete' ? [playersLink(gameId, setup.players)] : []),
    categoriesLink(
      gameId,
      setup.categoryIds.length,
      totalCategories,
      questionCount,
      'questions',
    ),
  ];

  return (
    <QuickSetup
      accent={accent}
      title="Quiz"
      subtitle={
        setup.playMode === 'compete'
          ? 'Round-robin trivia with one point per correct answer.'
          : 'Quick casual trivia. Answer, reveal, then pass the phone.'
      }
      canStart={canStart}
      footerNote={
        questionCount === 0
          ? 'No questions match these categories and difficulty.'
          : !validation.playersOk
            ? 'Add 2–12 named players before starting Compete.'
            : questionCount < setup.questionCount
              ? `${questionCount} unique questions match; the deck will recycle safely.`
              : undefined
      }
      startError={startError}
      onClearError={() => setStartError(null)}
      onStart={() => { void onStart(); }}
      links={links}
      controls={
        <QuickControls>
          <QuickControlBlock
            icon="question"
            title="Difficulty"
            hint="Knowledge difficulty, separate from content maturity."
            accent={accent}
          >
            <Segmented<QuizDifficultyFilter>
              accent={accent}
              value={setup.difficulty}
              onChange={(difficulty) => patchOptions({ difficulty })}
              options={[
                { value: 'easy', label: 'Easy' },
                { value: 'medium', label: 'Medium' },
                { value: 'hard', label: 'Hard' },
                { value: 'mixed', label: 'Mixed' },
              ]}
            />
          </QuickControlBlock>
          <QuickDivider />
          <QuickControlBlock
            icon="layers"
            title="Questions"
            hint="Total questions for the whole session."
            accent={accent}
          >
            <Segmented<10 | 20 | 30>
              accent={accent}
              value={setup.questionCount}
              onChange={(questionCount) => patchOptions({ questionCount })}
              options={[
                { value: 10, label: '10' },
                { value: 20, label: '20' },
                { value: 30, label: '30' },
              ]}
            />
          </QuickControlBlock>
        </QuickControls>
      }
    />
  );
}

/* ------------------------------------------------------------------ *
 * Who's Got the Bomb?
 * ------------------------------------------------------------------ */

function BombQuickSetup({ gameId }: { gameId: string }) {
  const accent = getGame(gameId)?.accent ?? color.gameBomb;
  const { setup, validation, persistPlayers } = useBombSetup();
  const { startSession, clearError } = useBombSession();
  const { settings } = useSettings();
  const clearOthers = useStartGame();
  const [startError, setStartError] = useState<string | null>(null);

  const totalCategories = getBombCategories().length;
  const cardCount = countBombCards({
    categoryIds: setup.categoryIds,
    contentLevels: setup.contentLevels,
    contentLanguage: settings.contentLanguage,
  });
  const canStart =
    validation.playersOk &&
    validation.categoriesOk &&
    validation.contentOk &&
    validation.spicyOk &&
    cardCount > 0;

  const onStart = async () => {
    clearError();
    clearOthers('bomb');
    await persistPlayers();
    const result = startSession(setup);
    if ('error' in result) {
      setStartError(result.error);
      return;
    }
    router.replace(`/session/${result.session.sessionId}`);
  };

  return (
    <QuickSetup
      accent={accent}
      title="Who's Got the Bomb?"
      subtitle="Say a valid answer, then pass the phone before the hidden fuse explodes."
      canStart={canStart}
      footerNote={startNote(canStart, cardCount)}
      startError={startError}
      onClearError={() => setStartError(null)}
      onStart={() => { void onStart(); }}
      links={[
        playersLink(gameId, setup.players),
        categoriesLink(gameId, setup.categoryIds.length, totalCategories, cardCount, 'categories'),
        contentLink(gameId, setup.contentLevels),
      ]}
    />
  );
}

function playersLink(
  gameId: string,
  players: Player[],
  { optional = false }: { optional?: boolean } = {},
): QuickLink {
  const names = players
    .map((player, index) => player.displayName.trim() || `Player ${index + 1}`)
    .join(', ');
  return {
    icon: 'users',
    title: optional ? 'Names (optional)' : 'Players',
    value: players.length
      ? `${players.length} at the table`
      : 'No names — pointing only',
    detail: names || 'Add names to make prompts personal',
    href: `/game/${gameId}/setup/players`,
  };
}

function categoriesLink(
  gameId: string,
  selected: number,
  total: number,
  cardCount: number,
  noun: string,
): QuickLink {
  return {
    icon: 'layers',
    title: 'Categories',
    value: selected === total ? `${total}` : `${selected}/${total}`,
    detail: `${cardCount} ${noun} available`,
    href: `/game/${gameId}/setup/categories`,
  };
}

function contentLink(gameId: string, levels: string[]): QuickLink {
  return {
    icon: 'lock',
    title: 'Content',
    value: levels.map((level) => level[0]!.toUpperCase() + level.slice(1)).join(' + '),
    detail: 'Family · Friends · Spicy',
    href: `/game/${gameId}/setup/content-level`,
  };
}

function startNote(canStart: boolean, cardCount: number): string | undefined {
  if (canStart) return undefined;
  return cardCount === 0
    ? 'No cards match these categories and levels.'
    : 'Finish the highlighted setup before starting.';
}

/* ------------------------------------------------------------------ *
 * Impostor
 * ------------------------------------------------------------------ */

function ImpostorQuickSetup({ gameId }: { gameId: string }) {
  const accent = getGame(gameId)?.accent ?? color.gameImpostor;
  const { setup, validation, persistPlayers, patchOptions } = useSetup();
  const { startSession, clearError } = useSession();
  const { settings } = useSettings();
  const clearOthers = useStartGame();
  const [startError, setStartError] = useState<string | null>(null);

  const totalCategories = getImpostorCategories().length;
  const cardCount = countImpostorWords({
    categoryIds: setup.categoryIds,
    contentLevels: setup.contentLevels,
    contentLanguage: settings.contentLanguage,
  });
  const canStart =
    validation.playersOk &&
    validation.categoriesOk &&
    validation.contentOk &&
    validation.spicyOk &&
    cardCount > 0;

  const onStart = async () => {
    clearError();
    clearOthers('impostor');
    await persistPlayers();
    const result = startSession(setup);
    if ('error' in result) {
      setStartError(result.error);
      return;
    }
    router.replace(`/session/${result.session.sessionId}`);
  };

  return (
    <QuickSetup
      accent={accent}
      title="Impostor"
      canStart={canStart}
      footerNote={startNote(canStart, cardCount)}
      startError={startError}
      onClearError={() => setStartError(null)}
      onStart={() => {
        void onStart();
      }}
      links={[
        playersLink(gameId, setup.players),
        categoriesLink(
          gameId,
          setup.categoryIds.length,
          totalCategories,
          cardCount,
          'cards',
        ),
        contentLink(gameId, setup.contentLevels),
      ]}
      more={{
        icon: 'sliders',
        title: 'More options',
        value: setup.votingMode === 'private' ? 'Private voting' : 'Group decides',
        detail: `Random start ${setup.randomStartPlayer ? 'on' : 'off'}`,
        href: `/game/${gameId}/setup/options`,
      }}
      controls={
        <QuickControls>
          <QuickControlBlock
            icon="mask"
            title="Impostors"
            hint={
              setup.players.length < 8
                ? 'Two Impostors unlock with 8 or more players.'
                : 'Two is an advanced game with a second clue and vote cycle.'
            }
            accent={accent}
          >
            <Segmented<1 | 2>
              options={[
                { value: 1, label: '1 Impostor' },
                {
                  value: 2,
                  label: '2 Impostors',
                  disabled: setup.players.length < 8,
                },
              ]}
              value={setup.impostorCount}
              onChange={(impostorCount) => patchOptions({ impostorCount })}
              accent={accent}
            />
          </QuickControlBlock>
          <QuickDivider />
          <Toggle
            accent={accent}
            label="Category hint"
            hint="The Impostor sees the category, never the word."
            value={setup.showCategoryToImpostor}
            onPress={() =>
              patchOptions({ showCategoryToImpostor: !setup.showCategoryToImpostor })
            }
          />
          <QuickDivider />
          <Toggle
            accent={accent}
            label="2-minute discussion timer"
            hint="Optional. The group can vote early."
            value={setup.discussionTimerSeconds === 120}
            onPress={() =>
              patchOptions({
                discussionTimerSeconds: setup.discussionTimerSeconds === 120 ? null : 120,
              })
            }
          />
        </QuickControls>
      }
    />
  );
}

/* ------------------------------------------------------------------ *
 * Who's the Liar?
 * ------------------------------------------------------------------ */

function LiarQuickSetup({ gameId }: { gameId: string }) {
  const accent = getGame(gameId)?.accent ?? color.gameLiar;
  const { setup, validation, persistPlayers, patchOptions } = useLiarSetup();
  const { startSession, clearError } = useLiarSession();
  const { settings } = useSettings();
  const clearOthers = useStartGame();
  const [startError, setStartError] = useState<string | null>(null);

  const totalCategories = getLiarCategories().length;
  const cardCount = countLiarPairs({
    categoryIds: setup.categoryIds,
    contentLevels: setup.contentLevels,
    contentLanguage: settings.contentLanguage,
  });
  const canStart =
    validation.playersOk &&
    validation.categoriesOk &&
    validation.contentOk &&
    validation.spicyOk &&
    cardCount > 0;

  const onStart = async () => {
    clearError();
    clearOthers('liar');
    await persistPlayers();
    const result = startSession(setup);
    if ('error' in result) {
      setStartError(result.error);
      return;
    }
    router.replace(`/session/${result.session.sessionId}`);
  };

  return (
    <QuickSetup
      accent={accent}
      title="Who's the Liar?"
      canStart={canStart}
      footerNote={startNote(canStart, cardCount)}
      startError={startError}
      onClearError={() => setStartError(null)}
      onStart={() => {
        void onStart();
      }}
      links={[
        playersLink(gameId, setup.players),
        categoriesLink(
          gameId,
          setup.categoryIds.length,
          totalCategories,
          cardCount,
          'pairs',
        ),
        contentLink(gameId, setup.contentLevels),
      ]}
      controls={
        <QuickControls>
          <Toggle
            accent={accent}
            label="Random answer order"
            hint="On by default. The Liar may go first."
            value={setup.randomAnswerOrder}
            onPress={() => patchOptions({ randomAnswerOrder: !setup.randomAnswerOrder })}
          />
          <QuickDivider />
          <Toggle
            accent={accent}
            label="Private pass-the-phone voting"
            hint="Off by default. Group decides in the room, then taps one name."
            value={setup.votingMode === 'private'}
            onPress={() =>
              patchOptions({
                votingMode: setup.votingMode === 'private' ? 'group' : 'private',
              })
            }
          />
        </QuickControls>
      }
    />
  );
}

/* ------------------------------------------------------------------ *
 * Taboo
 * ------------------------------------------------------------------ */

function TabooQuickSetup({ gameId }: { gameId: string }) {
  const accent = getGame(gameId)?.accent ?? color.gameTaboo;
  const { setup, validation, persistPlayers, patchOptions } = useTabooSetup();
  const { startSession, clearError } = useTabooSession();
  const { settings } = useSettings();
  const clearOthers = useStartGame();
  const [startError, setStartError] = useState<string | null>(null);

  const totalCategories = getTabooCategories().length;
  const cardCount = countTabooCards({
    categoryIds: setup.categoryIds,
    contentLevels: setup.contentLevels,
    contentLanguage: settings.contentLanguage,
  });
  const canStart =
    validation.playersOk &&
    validation.categoriesOk &&
    validation.contentOk &&
    validation.spicyOk &&
    cardCount > 0;

  const onStart = async () => {
    clearError();
    clearOthers('taboo');
    await persistPlayers();
    const result = startSession(setup);
    if ('error' in result) {
      setStartError(result.error);
      return;
    }
    router.replace(`/session/${result.session.sessionId}`);
  };

  return (
    <QuickSetup
      accent={accent}
      title="Taboo"
      subtitle="Two random balanced teams. Change only what your group needs."
      canStart={canStart}
      footerNote={startNote(canStart, cardCount)}
      startError={startError}
      onClearError={() => setStartError(null)}
      onStart={() => {
        void onStart();
      }}
      links={[
        playersLink(gameId, setup.players),
        categoriesLink(
          gameId,
          setup.categoryIds.length,
          totalCategories,
          cardCount,
          'cards',
        ),
        contentLink(gameId, setup.contentLevels),
      ]}
      more={{
        icon: 'sliders',
        title: 'More options',
        value: setup.skipPenalty ? 'Skip costs a point' : 'Free skips',
        detail: 'Max 3 skips per turn · violation −1',
        href: `/game/${gameId}/setup/options`,
      }}
      controls={
        <QuickControls>
          <QuickControlBlock
            icon="clock"
            title="Turn length"
            hint="Sudden-death turns always use 30 seconds."
            accent={accent}
          >
            <Segmented<number>
              accent={accent}
              value={setup.roundSeconds}
              onChange={(roundSeconds) => patchOptions({ roundSeconds })}
              options={[
                { value: 45, label: '45s' },
                { value: 60, label: '60s' },
                { value: 90, label: '90s' },
              ]}
            />
          </QuickControlBlock>
          <QuickDivider />
          <QuickControlBlock
            icon="trophy"
            title="Play to"
            hint="Both teams get the same number of turns."
            accent={accent}
          >
            <Segmented<number>
              accent={accent}
              value={setup.pointsToWin}
              onChange={(pointsToWin) => patchOptions({ pointsToWin })}
              options={[
                { value: 10, label: '10 pts' },
                { value: 15, label: '15 pts' },
                { value: 25, label: '25 pts' },
              ]}
            />
          </QuickControlBlock>
        </QuickControls>
      }
    />
  );
}

/* ------------------------------------------------------------------ *
 * Who's Most Likely To
 * ------------------------------------------------------------------ */

function MostLikelyQuickSetup({ gameId }: { gameId: string }) {
  const accent = getGame(gameId)?.accent ?? color.gameMostLikely;
  const { setup, validation, persistPlayers, patchOptions } = useMostLikelySetup();
  const { startSession, clearError } = useMostLikelySession();
  const { settings } = useSettings();
  const clearOthers = useStartGame();
  const [startError, setStartError] = useState<string | null>(null);

  const totalCategories = getMostLikelyCategories().length;
  const cardCount = countMostLikelyPrompts({
    categoryIds: setup.categoryIds,
    contentLevels: setup.contentLevels,
    contentLanguage: settings.contentLanguage,
  });
  const canStart =
    validation.playersOk &&
    validation.categoriesOk &&
    validation.contentOk &&
    validation.spicyOk &&
    cardCount > 0;

  const onStart = async () => {
    clearError();
    clearOthers('mostLikely');
    await persistPlayers();
    const result = startSession(setup);
    if ('error' in result) {
      setStartError(result.error);
      return;
    }
    router.replace(`/session/${result.session.sessionId}`);
  };

  return (
    <QuickSetup
      accent={accent}
      title="Who's Most Likely To"
      subtitle="Everyone points at once. Names are optional."
      canStart={canStart}
      footerNote={startNote(canStart, cardCount)}
      startError={startError}
      onClearError={() => setStartError(null)}
      onStart={() => {
        void onStart();
      }}
      links={[
        playersLink(gameId, setup.players, { optional: true }),
        categoriesLink(
          gameId,
          setup.categoryIds.length,
          totalCategories,
          cardCount,
          'prompts',
        ),
        contentLink(gameId, setup.contentLevels),
      ]}
      controls={
        <QuickControls>
          <QuickControlBlock
            icon="layers"
            title="Session length"
            hint="How many prompts before the wrap-up."
            accent={accent}
          >
            <Segmented<number>
              accent={accent}
              value={setup.cardCount}
              onChange={(cardCount) => patchOptions({ cardCount })}
              options={[
                { value: 10, label: '10' },
                { value: 20, label: '20' },
                { value: 30, label: '30' },
              ]}
            />
          </QuickControlBlock>
        </QuickControls>
      }
    />
  );
}

/* ------------------------------------------------------------------ *
 * Would You Rather
 * ------------------------------------------------------------------ */

function WouldRatherQuickSetup({ gameId }: { gameId: string }) {
  const accent = getGame(gameId)?.accent ?? color.gameWouldRather;
  const { setup, validation, patchOptions } = useWouldRatherSetup();
  const { startSession, clearError } = useWouldRatherSession();
  const { settings } = useSettings();
  const clearOthers = useStartGame();
  const [startError, setStartError] = useState<string | null>(null);

  const totalCategories = getWouldRatherCategories().length;
  const cardCount = countWouldRatherDilemmas({
    categoryIds: setup.categoryIds,
    contentLevels: setup.contentLevels,
    contentLanguage: settings.contentLanguage,
  });
  const canStart =
    validation.categoriesOk && validation.contentOk && validation.spicyOk && cardCount > 0;

  const onStart = () => {
    clearError();
    clearOthers('wouldRather');
    const result = startSession(setup);
    if ('error' in result) {
      setStartError(result.error);
      return;
    }
    router.replace(`/session/${result.session.sessionId}`);
  };

  return (
    <QuickSetup
      accent={accent}
      title="Would You Rather"
      subtitle="No names needed. Argue, then tap the winner."
      canStart={canStart}
      footerNote={startNote(canStart, cardCount)}
      startError={startError}
      onClearError={() => setStartError(null)}
      onStart={onStart}
      links={[
        categoriesLink(
          gameId,
          setup.categoryIds.length,
          totalCategories,
          cardCount,
          'dilemmas',
        ),
        contentLink(gameId, setup.contentLevels),
      ]}
      controls={
        <QuickControls>
          <QuickControlBlock
            icon="layers"
            title="Session length"
            hint="How many dilemmas before the wrap-up."
            accent={accent}
          >
            <Segmented<number>
              accent={accent}
              value={setup.cardCount}
              onChange={(cardCount) => patchOptions({ cardCount })}
              options={[
                { value: 10, label: '10' },
                { value: 20, label: '20' },
                { value: 30, label: '30' },
              ]}
            />
          </QuickControlBlock>
        </QuickControls>
      }
    />
  );
}
