import { router, useLocalSearchParams } from 'expo-router';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MetaChip } from '../../../../src/components/ui/Chip';
import { Dialog } from '../../../../src/components/ui/Dialog';
import { Icon, type IconName } from '../../../../src/components/ui/Icon';
import { PressableScale } from '../../../../src/components/ui/PressableScale';
import { SetupScreen } from '../../../../src/components/ui/SetupScreen';
import { Surface } from '../../../../src/components/ui/Surface';
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
import { countWouldRatherDilemmas, getWouldRatherCategories } from '../../../../src/content/wouldRather';
import { getGame } from '../../../../src/domain/games';
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
import { alpha, color, radius, space } from '../../../../src/theme/tokens';
import { type } from '../../../../src/theme/typography';

export default function ReviewScreen() {
  const { gameId } = useLocalSearchParams<{ gameId: string }>();
  if (gameId === 'whos_the_liar') {
    return <LiarReview gameId={String(gameId)} />;
  }
  if (gameId === 'taboo') {
    return <TabooReview gameId={String(gameId)} />;
  }
  if (gameId === 'most_likely') {
    return <MostLikelyReview gameId={String(gameId)} />;
  }
  if (gameId === 'would_you_rather') return <WouldRatherReview gameId={String(gameId)} />;
  return <ImpostorReview gameId={String(gameId)} />;
}

function WouldRatherReview({ gameId }: { gameId: string }) {
  const { setup, validation } = useWouldRatherSetup();
  const { startSession, clearError } = useWouldRatherSession();
  const { clearSession: clearImpostor } = useSession();
  const { clearSession: clearLiar } = useLiarSession();
  const { clearSession: clearTaboo } = useTabooSession();
  const { clearSession: clearLikely } = useMostLikelySession();
  const [startError, setStartError] = useState<string | null>(null);
  const categories = getWouldRatherCategories().filter((item) => setup.categoryIds.includes(item.id));
  const cardCount = countWouldRatherDilemmas({ categoryIds: setup.categoryIds, contentLevels: setup.contentLevels });
  const canStart = validation.categoriesOk && validation.contentOk && validation.spicyOk && cardCount > 0;
  const onStart = () => { clearError(); clearImpostor(); clearLiar(); clearTaboo(); clearLikely(); const result = startSession(setup); if ('error' in result) { setStartError(result.error); return; } router.replace(`/session/${result.session.sessionId}`); };
  return <ReviewChrome gameId={gameId} accent={color.gameWouldRather} icon="shuffle" title="Would You Rather" canStart={canStart} cardCount={cardCount} players={[]} hidePlayers categoryNames={categories.map((item) => item.name_en)} contentLevels={setup.contentLevels} startError={startError} onClearError={() => setStartError(null)} onStart={onStart} stats={[{value:String(Math.min(setup.cardCount,cardCount)),label:'dilemmas'},{value:String(categories.length),label:'categories'},{value:String(cardCount),label:'in deck'}]} optionChips={<><MetaChip icon="shuffle" label="Physical left / right"/><MetaChip icon="layers" label={`${setup.cardCount} per session`}/></>} />;
}

function ImpostorReview({ gameId }: { gameId: string }) {
  const game = getGame(gameId);
  const accent = game?.accent ?? color.gameImpostor;
  const { setup, validation, persistPlayers } = useSetup();
  const { startSession, clearError } = useSession();
  const { clearSession: clearLiarSession } = useLiarSession();
  const { clearSession: clearTabooSession } = useTabooSession();
  const { clearSession: clearMostLikelySession } = useMostLikelySession();
  const [startError, setStartError] = useState<string | null>(null);

  const categoryNames = getImpostorCategories()
    .filter((category) => setup.categoryIds.includes(category.id))
    .map((category) => category.name_en);
  const cardCount = countImpostorWords({
    categoryIds: setup.categoryIds,
    contentLevels: setup.contentLevels,
  });

  const canStart =
    validation.playersOk &&
    validation.categoriesOk &&
    validation.contentOk &&
    validation.spicyOk &&
    cardCount > 0;

  const onStart = async () => {
    clearError();
    clearLiarSession();
    clearTabooSession();
    clearMostLikelySession();
    await persistPlayers();
    const result = startSession(setup);
    if ('error' in result) {
      setStartError(result.error);
      return;
    }
    router.replace(`/session/${result.session.sessionId}`);
  };

  return (
    <ReviewChrome
      gameId={gameId}
      accent={accent}
      icon="mask"
      title="Impostor"
      canStart={canStart}
      cardCount={cardCount}
      players={setup.players}
      categoryNames={categoryNames}
      contentLevels={setup.contentLevels}
      startError={startError}
      onClearError={() => setStartError(null)}
      onStart={() => {
        void onStart();
      }}
      stats={[
        { value: String(setup.players.length), label: 'players' },
        { value: String(setup.impostorCount), label: 'impostor' },
        { value: String(cardCount), label: 'cards' },
      ]}
      optionChips={
        <>
          <MetaChip
            icon="target"
            label={setup.votingMode === 'private' ? 'Private votes' : 'Group decides'}
          />
          <MetaChip
            icon="eye"
            label={`Category hint ${setup.showCategoryToImpostor ? 'on' : 'off'}`}
          />
          <MetaChip
            icon="shuffle"
            label={`Random start ${setup.randomStartPlayer ? 'on' : 'off'}`}
          />
          {setup.discussionTimerSeconds ? (
            <MetaChip icon="clock" label={`${setup.discussionTimerSeconds / 60} min timer`} />
          ) : null}
        </>
      }
    />
  );
}

function LiarReview({ gameId }: { gameId: string }) {
  const game = getGame(gameId);
  const accent = game?.accent ?? color.gameLiar;
  const { setup, validation, persistPlayers } = useLiarSetup();
  const { startSession, clearError } = useLiarSession();
  const { clearSession: clearImpostorSession } = useSession();
  const { clearSession: clearTabooSession } = useTabooSession();
  const { clearSession: clearMostLikelySession } = useMostLikelySession();
  const [startError, setStartError] = useState<string | null>(null);

  const categoryNames = getLiarCategories()
    .filter((category) => setup.categoryIds.includes(category.id))
    .map((category) => category.name_en);
  const cardCount = countLiarPairs({
    categoryIds: setup.categoryIds,
    contentLevels: setup.contentLevels,
  });

  const canStart =
    validation.playersOk &&
    validation.categoriesOk &&
    validation.contentOk &&
    validation.spicyOk &&
    cardCount > 0;

  const onStart = async () => {
    clearError();
    clearImpostorSession();
    clearTabooSession();
    clearMostLikelySession();
    await persistPlayers();
    const result = startSession(setup);
    if ('error' in result) {
      setStartError(result.error);
      return;
    }
    router.replace(`/session/${result.session.sessionId}`);
  };

  return (
    <ReviewChrome
      gameId={gameId}
      accent={accent}
      icon="eye"
      title="Who's the Liar?"
      canStart={canStart}
      cardCount={cardCount}
      players={setup.players}
      categoryNames={categoryNames}
      contentLevels={setup.contentLevels}
      startError={startError}
      onClearError={() => setStartError(null)}
      onStart={() => {
        void onStart();
      }}
      stats={[
        { value: String(setup.players.length), label: 'players' },
        { value: '1', label: 'liar' },
        { value: String(cardCount), label: 'pairs' },
      ]}
      optionChips={
        <>
          <MetaChip icon="target" label="Private votes" />
          <MetaChip
            icon="shuffle"
            label={`Random order ${setup.randomAnswerOrder ? 'on' : 'off'}`}
          />
          {setup.answerTimerSeconds ? (
            <MetaChip icon="clock" label={`${setup.answerTimerSeconds}s answers`} />
          ) : null}
          {setup.discussionTimerSeconds ? (
            <MetaChip icon="clock" label={`${setup.discussionTimerSeconds / 60} min discuss`} />
          ) : null}
        </>
      }
    />
  );
}

function TabooReview({ gameId }: { gameId: string }) {
  const game = getGame(gameId);
  const accent = game?.accent ?? color.gameTaboo;
  const { setup, validation, persistPlayers } = useTabooSetup();
  const { startSession, clearError } = useTabooSession();
  const { clearSession: clearImpostorSession } = useSession();
  const { clearSession: clearLiarSession } = useLiarSession();
  const { clearSession: clearMostLikelySession } = useMostLikelySession();
  const [startError, setStartError] = useState<string | null>(null);

  const categoryNames = getTabooCategories()
    .filter((category) => setup.categoryIds.includes(category.id))
    .map((category) => category.name_en);
  const cardCount = countTabooCards({
    categoryIds: setup.categoryIds,
    contentLevels: setup.contentLevels,
  });

  const canStart =
    validation.playersOk &&
    validation.categoriesOk &&
    validation.contentOk &&
    validation.spicyOk &&
    cardCount > 0;

  const onStart = async () => {
    clearError();
    clearImpostorSession();
    clearLiarSession();
    clearMostLikelySession();
    await persistPlayers();
    const result = startSession(setup);
    if ('error' in result) {
      setStartError(result.error);
      return;
    }
    router.replace(`/session/${result.session.sessionId}`);
  };

  return (
    <ReviewChrome
      gameId={gameId}
      accent={accent}
      icon="megaphone"
      title="Taboo"
      canStart={canStart}
      cardCount={cardCount}
      players={setup.players}
      categoryNames={categoryNames}
      contentLevels={setup.contentLevels}
      startError={startError}
      onClearError={() => setStartError(null)}
      onStart={() => {
        void onStart();
      }}
      stats={[
        { value: String(setup.players.length), label: 'players' },
        { value: '2', label: 'teams' },
        { value: String(cardCount), label: 'cards' },
      ]}
      optionChips={
        <>
          <MetaChip icon="clock" label={`${setup.roundSeconds}s rounds`} />
          <MetaChip icon="trophy" label={`First to ${setup.pointsToWin}`} />
          <MetaChip
            icon="shuffle"
            label={setup.skipPenalty ? 'Skip −1' : 'Free skips'}
          />
        </>
      }
    />
  );
}

function MostLikelyReview({ gameId }: { gameId: string }) {
  const game = getGame(gameId);
  const accent = game?.accent ?? color.gameMostLikely;
  const { setup, validation, persistPlayers } = useMostLikelySetup();
  const { startSession, clearError } = useMostLikelySession();
  const { clearSession: clearImpostorSession } = useSession();
  const { clearSession: clearLiarSession } = useLiarSession();
  const { clearSession: clearTabooSession } = useTabooSession();
  const [startError, setStartError] = useState<string | null>(null);

  const categoryNames = getMostLikelyCategories()
    .filter((category) => setup.categoryIds.includes(category.id))
    .map((category) => category.name_en);
  const cardCount = countMostLikelyPrompts({
    categoryIds: setup.categoryIds,
    contentLevels: setup.contentLevels,
  });
  const sessionCards = Math.min(setup.cardCount, cardCount);

  const canStart =
    validation.playersOk &&
    validation.categoriesOk &&
    validation.contentOk &&
    validation.spicyOk &&
    cardCount > 0;

  const onStart = async () => {
    clearError();
    clearImpostorSession();
    clearLiarSession();
    clearTabooSession();
    await persistPlayers();
    const result = startSession(setup);
    if ('error' in result) {
      setStartError(result.error);
      return;
    }
    router.replace(`/session/${result.session.sessionId}`);
  };

  return (
    <ReviewChrome
      gameId={gameId}
      accent={accent}
      icon="users"
      title="Who's Most Likely To"
      canStart={canStart}
      cardCount={cardCount}
      players={setup.players}
      categoryNames={categoryNames}
      contentLevels={setup.contentLevels}
      startError={startError}
      onClearError={() => setStartError(null)}
      onStart={() => {
        void onStart();
      }}
      stats={[
        {
          value: setup.players.length ? String(setup.players.length) : '—',
          label: 'names',
        },
        { value: String(sessionCards), label: 'prompts' },
        { value: String(cardCount), label: 'in deck' },
      ]}
      optionChips={
        <>
          <MetaChip icon="users" label="Physical pointing" />
          <MetaChip icon="layers" label={`${setup.cardCount} per session`} />
        </>
      }
    />
  );
}

function ReviewChrome({
  gameId,
  accent,
  icon,
  title,
  canStart,
  cardCount,
  players,
  categoryNames,
  contentLevels,
  stats,
  optionChips,
  startError,
  onClearError,
  onStart,
  hidePlayers = false,
}: {
  gameId: string;
  accent: string;
  icon: IconName;
  title: string;
  canStart: boolean;
  cardCount: number;
  players: { id: string; displayName: string }[];
  categoryNames: string[];
  contentLevels: string[];
  stats: { value: string; label: string }[];
  optionChips: ReactNode;
  startError: string | null;
  onClearError: () => void;
  onStart: () => void;
  hidePlayers?: boolean;
}) {
  return (
    <SetupScreen
      stepLabel="Review"
      title="Ready?"
      accent={accent}
      primaryLabel="Start game"
      primaryDisabled={!canStart}
      footerNote={
        !canStart
          ? cardCount === 0
            ? 'No cards match these categories and levels.'
            : 'Finish setup before starting.'
          : undefined
      }
      onPrimary={onStart}
    >
      <Surface accent={accent} active contentStyle={styles.hero}>
        <View style={styles.heroTop}>
          <View
            style={[
              styles.heroMedallion,
              {
                borderColor: alpha(accent, 0.4),
                backgroundColor: alpha(accent, 0.18),
              },
            ]}
          >
            <Icon name={icon} size={22} color={accent} strokeWidth={1.9} />
          </View>
          <Text style={[type.displayMd, styles.heroTitle]}>{title}</Text>
        </View>
        <View style={styles.heroStats}>
          {stats.map((stat, index) => (
            <View key={stat.label} style={styles.statRow}>
              {index > 0 ? <View style={styles.statDivider} /> : null}
              <Stat value={stat.value} label={stat.label} accent={accent} />
            </View>
          ))}
        </View>
      </Surface>

      {!hidePlayers ? <Row label="Players" accent={accent} onEdit={() => router.push(`/game/${gameId}/setup/players`)}>
        <View style={styles.chips}>
          {players.map((player, index) => (
            <View key={player.id} style={styles.nameChip}>
              <Text style={[type.mono, styles.nameChipIndex]}>{index + 1}</Text>
              <Text style={[type.label, styles.nameChipText]}>
                {player.displayName.trim() || `Player ${index + 1}`}
              </Text>
            </View>
          ))}
        </View>
      </Row> : null}

      <Row
        label="Categories"
        accent={accent}
        onEdit={() => router.push(`/game/${gameId}/setup/categories`)}
      >
        <Text style={[type.body, styles.value]}>{categoryNames.join(', ') || 'None'}</Text>
        <MetaChip icon="layers" label={`${cardCount} cards available`} />
      </Row>

      <Row
        label="Content"
        accent={accent}
        onEdit={() => router.push(`/game/${gameId}/setup/content-level`)}
      >
        <Text style={[type.body, styles.value]}>
          {contentLevels.map((level) => level[0]!.toUpperCase() + level.slice(1)).join(' · ')}
        </Text>
      </Row>

      <Row label="Options" accent={accent} onEdit={() => router.push(`/game/${gameId}/setup/options`)}>
        <View style={styles.optionList}>{optionChips}</View>
      </Row>

      <Dialog
        visible={!!startError}
        icon="alert"
        accent={color.dangerUrgency}
        title="Could not start"
        message={startError ?? undefined}
        confirmLabel="Got it"
        confirmTone="danger"
        onConfirm={onClearError}
      />
    </SetupScreen>
  );
}

function Stat({
  value,
  label,
  accent,
}: {
  value: string;
  label: string;
  accent: string;
}) {
  return (
    <View style={styles.stat}>
      <Text style={[type.displayMd, { color: accent }]}>{value}</Text>
      <Text style={[type.mono, styles.statLabel]}>{label}</Text>
    </View>
  );
}

function Row({
  label,
  accent,
  onEdit,
  children,
}: {
  label: string;
  accent: string;
  onEdit: () => void;
  children: ReactNode;
}) {
  return (
    <Surface contentStyle={styles.card}>
      <View style={styles.cardHead}>
        <Text style={[type.eyebrow, styles.cardLabel]}>{label}</Text>
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel={`Edit ${label.toLowerCase()}`}
          onPress={onEdit}
          haptic="selection"
          scaleTo={0.94}
          style={[styles.edit, { backgroundColor: alpha(accent, 0.12) }]}
        >
          <Icon name="pencil" size={13} color={accent} strokeWidth={2.2} />
          <Text style={[type.mono, { color: accent }]}>Edit</Text>
        </PressableScale>
      </View>
      {children}
    </Surface>
  );
}

const styles = StyleSheet.create({
  hero: {
    padding: space[5],
    gap: space[5],
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
  },
  heroMedallion: {
    width: 44,
    height: 44,
    borderRadius: radius.small,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    color: color.textPrimary,
  },
  heroStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  stat: {
    flex: 1,
    gap: 2,
  },
  statLabel: {
    color: color.textMuted,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: alpha(color.textPrimary, 0.1),
    marginRight: space[3],
  },
  card: {
    padding: space[4],
    gap: space[3],
  },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardLabel: {
    color: color.textMuted,
  },
  edit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
  },
  value: {
    color: color.textPrimary,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space[2],
  },
  nameChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: color.borderSubtle,
    backgroundColor: alpha(color.textPrimary, 0.05),
  },
  nameChipIndex: {
    color: color.textMuted,
  },
  nameChipText: {
    color: color.textPrimary,
  },
  optionList: {
    gap: space[2],
  },
});
