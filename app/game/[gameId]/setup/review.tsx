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
import { featureFlags, isContentLevelAvailable } from '../../../../src/config/features';
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
import { saveLastPlayedGame } from '../../../../src/storage/lastPlayedGame';
import { color } from '../../../../src/theme/tokens';
import { countGimbarCards, getGimbarCategories } from '../../../../src/content/gimbar';
import { countInsiderWords } from '../../../../src/content/insider';
import { countMizanSpectra } from '../../../../src/content/mizan';
import {
  GIMBAR_TILT_SUPPORTED,
  useGimbarSession,
  useGimbarSetup,
} from '../../../../src/domain/gimbar/context';
import { useInsiderSession, useInsiderSetup } from '../../../../src/domain/insider/context';
import { useMesobSession, useMesobSetup } from '../../../../src/domain/mesob/context';
import { useMizanSession, useMizanSetup } from '../../../../src/domain/mizan/context';
import { MIZAN_TEAMS_MIN_PLAYERS, type MizanMode } from '../../../../src/domain/mizan/types';
import {
  useWinkKillerSession,
  useWinkKillerSetup,
} from '../../../../src/domain/winkKiller/context';
import {
  WINK_DETECTIVE_MIN_PLAYERS,
  WINK_TWO_KILLERS_MIN_PLAYERS,
} from '../../../../src/domain/winkKiller/types';
import { countEwnetQuestions, getEwnetCategories } from '../../../../src/content/ewnetWeysSaks';
import { useEwnetSession, useEwnetSetup } from '../../../../src/domain/ewnetWeysSaks/context';
import { countManNegnIdentities, getManNegnCategories } from '../../../../src/content/manNegn';
import { useManNegnSession, useManNegnSetup } from '../../../../src/domain/manNegn/context';

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
  if (id === 'gimbar') return <GimbarQuickSetup gameId={id} />;
  if (id === 'mesob') return <MesobQuickSetup gameId={id} />;
  if (id === 'mizan') return <MizanQuickSetup gameId={id} />;
  if (id === 'wink_killer') return <WinkKillerQuickSetup gameId={id} />;
  if (id === 'insider') return <InsiderQuickSetup gameId={id} />;
  if (id === 'ewnet_weys_saks') return <EwnetQuickSetup gameId={id} />;
  if (id === 'man_negn') return <ManNegnQuickSetup gameId={id} />;
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
  const gimbar = useGimbarSession();
  const mesob = useMesobSession();
  const mizan = useMizanSession();
  const winkKiller = useWinkKillerSession();
  const insider = useInsiderSession();
  const ewnet = useEwnetSession();
  const manNegn = useManNegnSession();

  return (
    keep:
      | 'impostor'
      | 'liar'
      | 'taboo'
      | 'mostLikely'
      | 'wouldRather'
      | 'bomb'
      | 'quiz'
      | 'gimbar'
      | 'mesob'
      | 'mizan'
      | 'winkKiller'
      | 'insider'
      | 'ewnet'
      | 'manNegn',
  ) => {
    if (keep !== 'impostor') impostor.clearSession();
    if (keep !== 'liar') liar.clearSession();
    if (keep !== 'taboo') taboo.clearSession();
    if (keep !== 'mostLikely') mostLikely.clearSession();
    if (keep !== 'wouldRather') wouldRather.clearSession();
    if (keep !== 'bomb') bomb.clearSession();
    if (keep !== 'quiz') quiz.clearSession();
    if (keep !== 'gimbar') gimbar.clearSession();
    if (keep !== 'mesob') mesob.clearSession();
    if (keep !== 'mizan') mizan.clearSession();
    if (keep !== 'winkKiller') winkKiller.clearSession();
    if (keep !== 'insider') insider.clearSession();
    if (keep !== 'ewnet') ewnet.clearSession();
    if (keep !== 'manNegn') manNegn.clearSession();
  };
}

/* ------------------------------------------------------------------ *
 * Man Negn?
 * ------------------------------------------------------------------ */

function ManNegnQuickSetup({ gameId }: { gameId: string }) {
  const accent = getGame(gameId)?.accent ?? color.gameManNegn;
  const { setup, validation, persistPlayers } = useManNegnSetup();
  const { startSession, clearError } = useManNegnSession();
  const { settings } = useSettings();
  const clearOthers = useStartGame();
  const [startError, setStartError] = useState<string | null>(null);
  const totalCategories = getManNegnCategories().length;
  const cardCount = countManNegnIdentities({ categoryIds: setup.categoryIds, contentLevels: setup.contentLevels, contentLanguage: settings.contentLanguage });
  const canStart = validation.playersOk && validation.categoriesOk && cardCount >= setup.players.length;

  const onStart = async () => {
    clearError();
    clearOthers('manNegn');
    await persistPlayers();
    const result = startSession(setup);
    if ('error' in result) { setStartError(result.error); return; }
    void saveLastPlayedGame('man_negn');
    router.replace(`/session/${result.session.sessionId}`);
  };

  return (
    <QuickSetup
      accent={accent}
      title="Man Negn?"
      subtitle="See everyone else's secret identity, then discover your own with yes/no questions."
      canStart={canStart}
      footerNote={canStart ? 'Each player gets two chances to guess.' : 'Add 2–5 named players and choose categories with enough identities.'}
      startError={startError}
      onClearError={() => setStartError(null)}
      onStart={() => { void onStart(); }}
      links={[playersLink(gameId, setup.players), categoriesLink(gameId, setup.categoryIds.length, totalCategories, cardCount, 'identities')]}
    />
  );
}

/* ------------------------------------------------------------------ *
 * Ewnet weys Saks
 * ------------------------------------------------------------------ */

function EwnetQuickSetup({ gameId }: { gameId: string }) {
  const accent = getGame(gameId)?.accent ?? color.gameEwnetWeysSaks;
  const { setup, validation, persistPlayers, patchOptions } = useEwnetSetup();
  const { startSession, clearError } = useEwnetSession();
  const { settings } = useSettings();
  const clearOthers = useStartGame();
  const [startError, setStartError] = useState<string | null>(null);
  const totalCategories = getEwnetCategories().length;
  const cardCount = countEwnetQuestions({
    categoryIds: setup.categoryIds,
    contentLevels: setup.contentLevels,
    contentLanguage: settings.contentLanguage,
  });
  const canStart = validation.playersOk && validation.categoriesOk && cardCount > 0;

  const onStart = async () => {
    clearError();
    clearOthers('ewnet');
    await persistPlayers();
    const result = startSession(setup);
    if ('error' in result) {
      setStartError(result.error);
      return;
    }
    void saveLastPlayedGame('ewnet_weys_saks');
    router.replace(`/session/${result.session.sessionId}`);
  };

  return (
    <QuickSetup
      accent={accent}
      title="Ewnet weys Saks"
      subtitle="Write convincing lies, vote for the truth, and earn points when friends believe you."
      canStart={canStart}
      footerNote={startNote(canStart, cardCount)}
      startError={startError}
      onClearError={() => setStartError(null)}
      onStart={() => { void onStart(); }}
      links={[
        playersLink(gameId, setup.players),
        categoriesLink(gameId, setup.categoryIds.length, totalCategories, cardCount, 'questions'),
      ]}
      controls={
        <QuickControls>
          <QuickControlBlock
            icon="layers"
            title="Rounds"
            hint="Every round includes one bluff and one vote from every player."
            accent={accent}
          >
            <Segmented<5 | 7 | 10>
              accent={accent}
              value={setup.roundCount}
              onChange={(roundCount) => patchOptions({ roundCount })}
              options={[
                { value: 5, label: '5' },
                { value: 7, label: '7' },
                { value: 10, label: '10' },
              ]}
            />
          </QuickControlBlock>
        </QuickControls>
      }
    />
  );
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
    void saveLastPlayedGame('quiz');
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
    void saveLastPlayedGame('bomb');
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
  const availableLevels = levels.filter(isContentLevelAvailable);
  return {
    icon: 'lock',
    title: 'Content',
    value: availableLevels.length
      ? availableLevels.map((level) => level[0]!.toUpperCase() + level.slice(1)).join(' + ')
      : 'Choose content',
    detail: featureFlags.spicyContent
      ? 'Family · Friends · Spicy'
      : 'Family · Friends · Spicy coming soon',
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
    void saveLastPlayedGame('impostor');
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
    void saveLastPlayedGame('whos_the_liar');
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
    void saveLastPlayedGame('taboo');
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
    void saveLastPlayedGame('most_likely');
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
    void saveLastPlayedGame('would_you_rather');
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

/* ------------------------------------------------------------------ *
 * Gimbar
 * ------------------------------------------------------------------ */

function GimbarQuickSetup({ gameId }: { gameId: string }) {
  const accent = getGame(gameId)?.accent ?? color.gameGimbar;
  const { setup, validation, persistPlayers, patchOptions } = useGimbarSetup();
  const { startSession, clearError } = useGimbarSession();
  const { settings } = useSettings();
  const clearOthers = useStartGame();
  const [startError, setStartError] = useState<string | null>(null);

  const totalCategories = getGimbarCategories().length;
  const cardCount = countGimbarCards({
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
    clearOthers('gimbar');
    await persistPlayers();
    const result = startSession(setup);
    if ('error' in result) {
      setStartError(result.error);
      return;
    }
    void saveLastPlayedGame('gimbar');
    router.replace(`/session/${result.session.sessionId}`);
  };

  return (
    <QuickSetup
      accent={accent}
      title="Gimbar"
      subtitle="Phone on the forehead, friends act it out. Every player takes a turn guessing."
      canStart={canStart}
      footerNote={startNote(canStart, cardCount)}
      startError={startError}
      onClearError={() => setStartError(null)}
      onStart={() => {
        void onStart();
      }}
      links={[
        playersLink(gameId, setup.players),
        categoriesLink(gameId, setup.categoryIds.length, totalCategories, cardCount, 'cards'),
        contentLink(gameId, setup.contentLevels),
      ]}
      controls={
        <QuickControls>
          <QuickControlBlock icon="clock" title="Turn length" accent={accent}>
            <Segmented<number>
              accent={accent}
              value={setup.turnSeconds}
              onChange={(turnSeconds) => patchOptions({ turnSeconds })}
              options={[
                { value: 45, label: '45s' },
                { value: 60, label: '60s' },
                { value: 90, label: '90s' },
              ]}
            />
          </QuickControlBlock>
          <QuickDivider />
          <QuickControlBlock
            icon="refresh"
            title="Turns each"
            hint="How many times every player guesses."
            accent={accent}
          >
            <Segmented<number>
              accent={accent}
              value={setup.roundsPerPlayer}
              onChange={(roundsPerPlayer) => patchOptions({ roundsPerPlayer })}
              options={[
                { value: 1, label: '1' },
                { value: 2, label: '2' },
                { value: 3, label: '3' },
              ]}
            />
          </QuickControlBlock>
          {GIMBAR_TILT_SUPPORTED ? (
            <>
              <QuickDivider />
              <Toggle
                accent={accent}
                label="Tilt to answer"
                hint="Off: tap the left or right half of the screen instead."
                value={setup.control === 'tilt'}
                onPress={() =>
                  patchOptions({ control: setup.control === 'tilt' ? 'tap' : 'tilt' })
                }
              />
            </>
          ) : null}
        </QuickControls>
      }
    />
  );
}

/* ------------------------------------------------------------------ *
 * Mesob
 * ------------------------------------------------------------------ */

function MesobQuickSetup({ gameId }: { gameId: string }) {
  const accent = getGame(gameId)?.accent ?? color.gameMesob;
  const { setup, validation, persistPlayers, patchOptions } = useMesobSetup();
  const { startSession, clearError } = useMesobSession();
  const clearOthers = useStartGame();
  const [startError, setStartError] = useState<string | null>(null);
  const canStart = validation.playersOk && validation.contentOk && validation.spicyOk;

  const onStart = async () => {
    clearError();
    clearOthers('mesob');
    await persistPlayers();
    const result = startSession(setup);
    if ('error' in result) {
      setStartError(result.error);
      return;
    }
    void saveLastPlayedGame('mesob');
    router.replace(`/session/${result.session.sessionId}`);
  };

  return (
    <QuickSetup
      accent={accent}
      title="Mesob"
      subtitle="Two random teams. Everyone writes slips in private, then three rounds with the same slips."
      canStart={canStart}
      footerNote={canStart ? undefined : 'Add 4–20 named players before starting.'}
      startError={startError}
      onClearError={() => setStartError(null)}
      onStart={() => {
        void onStart();
      }}
      links={[playersLink(gameId, setup.players), contentLink(gameId, setup.contentLevels)]}
      controls={
        <QuickControls>
          <QuickControlBlock
            icon="pencil"
            title="Slips each"
            hint="Each player writes this many names or things."
            accent={accent}
          >
            <Segmented<number>
              accent={accent}
              value={setup.wordsPerPlayer}
              onChange={(wordsPerPlayer) => patchOptions({ wordsPerPlayer })}
              options={[
                { value: 2, label: '2' },
                { value: 3, label: '3' },
                { value: 4, label: '4' },
              ]}
            />
          </QuickControlBlock>
          <QuickDivider />
          <QuickControlBlock icon="clock" title="Turn length" accent={accent}>
            <Segmented<number>
              accent={accent}
              value={setup.turnSeconds}
              onChange={(turnSeconds) => patchOptions({ turnSeconds })}
              options={[
                { value: 30, label: '30s' },
                { value: 45, label: '45s' },
                { value: 60, label: '60s' },
              ]}
            />
          </QuickControlBlock>
          <QuickDivider />
          <Toggle
            accent={accent}
            label="Add deck slips"
            hint="Two extra slips per player from the Gimbar deck, for groups short on ideas."
            value={setup.deckTopUp}
            onPress={() => patchOptions({ deckTopUp: !setup.deckTopUp })}
          />
        </QuickControls>
      }
    />
  );
}

/* ------------------------------------------------------------------ *
 * Mizan
 * ------------------------------------------------------------------ */

function MizanQuickSetup({ gameId }: { gameId: string }) {
  const accent = getGame(gameId)?.accent ?? color.gameMizan;
  const { setup, validation, persistPlayers, patchOptions } = useMizanSetup();
  const { startSession, clearError } = useMizanSession();
  const { settings } = useSettings();
  const clearOthers = useStartGame();
  const [startError, setStartError] = useState<string | null>(null);

  const teamsAllowed = setup.players.length >= MIZAN_TEAMS_MIN_PLAYERS;
  const mode: MizanMode = teamsAllowed ? setup.mode : 'together';
  const cardCount = countMizanSpectra({
    contentLevels: setup.contentLevels,
    contentLanguage: settings.contentLanguage,
  });
  const canStart =
    validation.playersOk && validation.contentOk && validation.spicyOk && cardCount > 0;

  const onStart = async () => {
    clearError();
    clearOthers('mizan');
    await persistPlayers();
    const result = startSession({ ...setup, mode });
    if ('error' in result) {
      setStartError(result.error);
      return;
    }
    void saveLastPlayedGame('mizan');
    router.replace(`/session/${result.session.sessionId}`);
  };

  return (
    <QuickSetup
      accent={accent}
      title="Mizan"
      subtitle="One clue, one hidden point between two opposites. Read each other's minds."
      canStart={canStart}
      footerNote={startNote(canStart, cardCount)}
      startError={startError}
      onClearError={() => setStartError(null)}
      onStart={() => {
        void onStart();
      }}
      links={[playersLink(gameId, setup.players), contentLink(gameId, setup.contentLevels)]}
      controls={
        <QuickControls>
          <QuickControlBlock
            icon="users"
            title="Mode"
            hint={
              teamsAllowed
                ? 'Teams race to a score. Together plays a set of rounds as one side.'
                : 'Teams unlock with 4 or more players.'
            }
            accent={accent}
          >
            <Segmented<MizanMode>
              accent={accent}
              value={mode}
              onChange={(next) => patchOptions({ mode: next })}
              options={[
                { value: 'teams', label: 'Teams', disabled: !teamsAllowed },
                { value: 'together', label: 'Together' },
              ]}
            />
          </QuickControlBlock>
          <QuickDivider />
          {mode === 'teams' ? (
            <QuickControlBlock icon="trophy" title="Play to" accent={accent}>
              <Segmented<number>
                accent={accent}
                value={setup.pointsToWin}
                onChange={(pointsToWin) => patchOptions({ pointsToWin })}
                options={[
                  { value: 8, label: '8 pts' },
                  { value: 10, label: '10 pts' },
                  { value: 15, label: '15 pts' },
                ]}
              />
            </QuickControlBlock>
          ) : (
            <QuickControlBlock icon="layers" title="Rounds" accent={accent}>
              <Segmented<number>
                accent={accent}
                value={setup.rounds}
                onChange={(rounds) => patchOptions({ rounds })}
                options={[
                  { value: 5, label: '5' },
                  { value: 8, label: '8' },
                  { value: 12, label: '12' },
                ]}
              />
            </QuickControlBlock>
          )}
        </QuickControls>
      }
    />
  );
}

/* ------------------------------------------------------------------ *
 * Wink Killer
 * ------------------------------------------------------------------ */

function WinkKillerQuickSetup({ gameId }: { gameId: string }) {
  const accent = getGame(gameId)?.accent ?? color.gameWinkKiller;
  const { setup, validation, persistPlayers, patchOptions } = useWinkKillerSetup();
  const { startSession, clearError } = useWinkKillerSession();
  const clearOthers = useStartGame();
  const [startError, setStartError] = useState<string | null>(null);
  const twoAllowed = setup.players.length >= WINK_TWO_KILLERS_MIN_PLAYERS;
  const detectiveAllowed = setup.players.length >= WINK_DETECTIVE_MIN_PLAYERS;
  const canStart = validation.playersOk;

  const onStart = async () => {
    clearError();
    clearOthers('winkKiller');
    await persistPlayers();
    const result = startSession(setup);
    if ('error' in result) {
      setStartError(result.error);
      return;
    }
    void saveLastPlayedGame('wink_killer');
    router.replace(`/session/${result.session.sessionId}`);
  };

  return (
    <QuickSetup
      accent={accent}
      title="Wink Killer"
      subtitle="Sit in a circle where everyone can see each other's eyes. The phone deals secret roles."
      canStart={canStart}
      footerNote={canStart ? undefined : 'Add 4–30 named players before starting.'}
      startError={startError}
      onClearError={() => setStartError(null)}
      onStart={() => {
        void onStart();
      }}
      links={[playersLink(gameId, setup.players)]}
      controls={
        <QuickControls>
          <QuickControlBlock
            icon="eyeOff"
            title="Killers"
            hint={
              twoAllowed ? 'Two killers know each other.' : 'Two killers unlock with 8 or more players.'
            }
            accent={accent}
          >
            <Segmented<1 | 2>
              accent={accent}
              value={twoAllowed ? setup.killerCount : 1}
              onChange={(killerCount) => patchOptions({ killerCount })}
              options={[
                { value: 1, label: '1 Killer' },
                { value: 2, label: '2 Killers', disabled: !twoAllowed },
              ]}
            />
          </QuickControlBlock>
          <QuickDivider />
          <Toggle
            accent={accent}
            label="Public Detective"
            hint={
              detectiveAllowed
                ? 'One known Detective makes every accusation, with 3 guesses.'
                : 'Needs 5 or more players. Off: anyone may accuse.'
            }
            value={detectiveAllowed && setup.detective}
            onPress={() => {
              if (detectiveAllowed) patchOptions({ detective: !setup.detective });
            }}
          />
        </QuickControls>
      }
    />
  );
}

/* ------------------------------------------------------------------ *
 * Insider
 * ------------------------------------------------------------------ */

function InsiderQuickSetup({ gameId }: { gameId: string }) {
  const accent = getGame(gameId)?.accent ?? color.gameInsider;
  const { setup, validation, persistPlayers, patchOptions } = useInsiderSetup();
  const { startSession, clearError } = useInsiderSession();
  const { settings } = useSettings();
  const clearOthers = useStartGame();
  const [startError, setStartError] = useState<string | null>(null);

  const totalCategories = getImpostorCategories().length;
  const cardCount = countInsiderWords({
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
    clearOthers('insider');
    await persistPlayers();
    const result = startSession(setup);
    if ('error' in result) {
      setStartError(result.error);
      return;
    }
    void saveLastPlayedGame('insider');
    router.replace(`/session/${result.session.sessionId}`);
  };

  return (
    <QuickSetup
      accent={accent}
      title="Insider"
      subtitle="Twenty questions against the clock, with a hidden helper among you."
      canStart={canStart}
      footerNote={startNote(canStart, cardCount)}
      startError={startError}
      onClearError={() => setStartError(null)}
      onStart={() => {
        void onStart();
      }}
      links={[
        playersLink(gameId, setup.players),
        categoriesLink(gameId, setup.categoryIds.length, totalCategories, cardCount, 'words'),
        contentLink(gameId, setup.contentLevels),
      ]}
      controls={
        <QuickControls>
          <QuickControlBlock
            icon="clock"
            title="Time to find the word"
            hint="Run out and everyone loses."
            accent={accent}
          >
            <Segmented<number>
              accent={accent}
              value={setup.timerSeconds}
              onChange={(timerSeconds) => patchOptions({ timerSeconds })}
              options={[
                { value: 180, label: '3 min' },
                { value: 300, label: '5 min' },
                { value: 420, label: '7 min' },
              ]}
            />
          </QuickControlBlock>
          <QuickDivider />
          <Toggle
            accent={accent}
            label="Private pass-the-phone voting"
            hint="Off by default. Group decides in the room, then taps one name."
            value={setup.votingMode === 'private'}
            onPress={() =>
              patchOptions({ votingMode: setup.votingMode === 'private' ? 'group' : 'private' })
            }
          />
        </QuickControls>
      }
    />
  );
}
