import { preload } from 'expo-audio';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Animated, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useWinkKillerSession } from '../../domain/winkKiller/context';
import {
  accuse,
  accuseTargets,
  alivePlayers,
  cancelAction,
  chooseAccuser,
  currentRevealPlayerId,
  detectiveId,
  getWinkPlayerName,
  hideRevealAndContinue,
  killerIds,
  markWinked,
  openAccusation,
  openMarkOut,
  readyToReveal,
  roleOf,
  startPlay,
  restoreWinked,
  winkablePlayers,
} from '../../domain/winkKiller/machine';
import type { WinkKillerSession } from '../../domain/winkKiller/types';
import { useEnterAnimation } from '../../theme/motion';
import { color, overlay, radius, space } from '../../theme/tokens';
import { type } from '../../theme/typography';
import { SOUND_VOLUME } from '../../theme/soundLevels';
import { useSoundEffect } from '../../theme/useSoundEffect';
import { ResultHero } from '../session/ResultHero';
import { HoldHint, HoldToReveal, useHoldReveal } from '../session/HoldToReveal';
import { PassPhoneHandoff } from '../session/PassPhoneHandoff';
import { PlayerPicker } from '../session/PlayerPicker';
import { SessionShell } from '../session/SessionShell';
import { Icon } from '../ui/Icon';
import { PressableScale } from '../ui/PressableScale';
import { PrimaryButton } from '../ui/PrimaryButton';
import { SecondaryButton } from '../ui/SecondaryButton';
import { Surface } from '../ui/Surface';
import { GlyphDisk } from '../ui/GlyphDisk';

const ACCENT = color.gameWinkKiller;
const STAGES = ['roles', 'play', 'result'] as const;
const VERDICT_SOUND = require('../../../assets/sounds/verdict-sting.wav');
const WIN_SOUND = require('../../../assets/sounds/result-win.wav');
const LOSS_SOUND = require('../../../assets/sounds/result-loss.wav');

void preload(VERDICT_SOUND);
void preload(WIN_SOUND);
void preload(LOSS_SOUND);

function endGame(clearSession: () => void) {
  router.replace('/home');
  clearSession();
}

function HandoffPhase({ session }: { session: WinkKillerSession }) {
  const { apply, clearSession } = useWinkKillerSession();
  const playerId = currentRevealPlayerId(session);
  return (
    <PassPhoneHandoff
      name={playerId ? getWinkPlayerName(session, playerId) : 'Player'}
      index={session.revealIndex + 1}
      total={session.revealOrder.length}
      accent={ACCENT}
      eyebrow="Secret role"
      stage="roles"
      stages={STAGES}
      onReady={() => apply(readyToReveal)}
      onEndGame={() => endGame(clearSession)}
    />
  );
}

function RevealPhase({ session }: { session: WinkKillerSession }) {
  const { apply, clearSession } = useWinkKillerSession();
  const { unlocked, unlock } = useHoldReveal(session.revealIndex);
  const playerId = currentRevealPlayerId(session) ?? '';
  const role = roleOf(session, playerId);
  const partners = killerIds(session)
    .filter((id) => id !== playerId)
    .map((id) => getWinkPlayerName(session, id));

  const copy =
    role === 'killer'
      ? {
          icon: 'eyeOff' as const,
          label: partners.length ? 'You are a Killer' : 'You are the Killer',
          body: partners.length
            ? `Your partner is ${partners.join(', ')}. Wink at victims when nobody else is looking. Never wink at your partner.`
            : 'Wink at a victim when nobody else is looking. Do not get caught.',
        }
      : role === 'detective'
        ? {
            icon: 'search' as const,
            label: 'You are the Detective',
            body: 'Everyone will know. Watch the eyes and catch the killer within 3 guesses.',
          }
        : {
            icon: 'users' as const,
            label: 'You are a Citizen',
            body: 'If someone winks at you, count to five silently, then fall dramatically. Spot the killer before it is too late.',
          };

  return (
    <SessionShell
      eyebrow={`Private reveal · ${session.revealIndex + 1}/${session.revealOrder.length}`}
      stage="roles"
      stages={STAGES}
      title={getWinkPlayerName(session, playerId)}
      accent={ACCENT}
      onEndGame={() => endGame(clearSession)}
      footer={
        unlocked ? (
          <PrimaryButton
            label="Hide and continue"
            icon="checkCircle"
            onPress={() => apply(hideRevealAndContinue)}
          />
        ) : (
          <HoldHint text="Hold until the ring fills, then read your role." />
        )
      }
    >
      <HoldToReveal
        accent={ACCENT}
        unlocked={unlocked}
        onUnlock={unlock}
        resetKey={session.revealIndex}
      >
        <Icon
          name={copy.icon}
          size={34}
          color={role === 'killer' ? color.dangerUrgency : color.brandPrimary}
          strokeWidth={1.8}
        />
        <Text style={[type.displayMd, styles.secretTitle]}>{copy.label}</Text>
        <Text style={[type.body, styles.secretBody]}>{copy.body}</Text>
      </HoldToReveal>
    </SessionShell>
  );
}

function DetectiveAnnouncePhase({ session }: { session: WinkKillerSession }) {
  const { apply, clearSession } = useWinkKillerSession();
  const id = detectiveId(session);
  const enter = useEnterAnimation(1, 16);
  return (
    <SessionShell
      eyebrow="In the open"
      stage="play"
      stages={STAGES}
      title={`${id ? getWinkPlayerName(session, id) : 'Player'} is the Detective`}
      subtitle="Only the Detective may accuse, with 3 guesses. The Detective cannot be winked."
      accent={ACCENT}
      onEndGame={() => endGame(clearSession)}
      footer={<PrimaryButton label="Start playing" icon="eye" onPress={() => apply(startPlay)} />}
    >
      <Animated.View style={[styles.center, enter]}>
        <GlyphDisk icon="search" accent={ACCENT} />
      </Animated.View>
    </SessionShell>
  );
}

function PlayPhase({ session }: { session: WinkKillerSession }) {
  const { apply, clearSession } = useWinkKillerSession();
  const alive = alivePlayers(session);
  const detective = session.setup.detective;

  return (
    <SessionShell
      eyebrow={`${alive.length} still in`}
      stage="play"
      stages={STAGES}
      title="Keep your eyes open"
      subtitle={
        detective
          ? `Winked? Count to five, then fall. Detective has ${session.detectiveGuessesLeft} ${session.detectiveGuessesLeft === 1 ? 'guess' : 'guesses'} left.`
          : 'Winked? Count to five, then fall. Sure who did it? Accuse. Wrong accusers are out.'
      }
      accent={ACCENT}
      onEndGame={() => endGame(clearSession)}
      footer={
        <>
          <PrimaryButton label="Someone was winked out" icon="eyeOff" onPress={() => apply(openMarkOut)} />
          <SecondaryButton
            label={detective ? 'Detective accuses' : 'Make an accusation'}
            icon="target"
            onPress={() => apply(openAccusation)}
          />
        </>
      }
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.stack}>
        <Surface accent={ACCENT} active contentStyle={styles.card}>
          <Text style={[type.eyebrow, { color: ACCENT }]}>Still in</Text>
          <Text style={[type.body, styles.primary]}>
            {alive.map((player) => player.displayName).join(' · ')}
          </Text>
        </Surface>
        {session.outIds.length ? (
          <Surface contentStyle={styles.card}>
            <Text style={[type.eyebrow, styles.muted]}>Out</Text>
            {session.outIds.map((id) =>
              session.outReasons[id] === 'winked' ? (
                <View key={id} style={styles.outRow}>
                  <Text style={[type.bodySm, styles.secondary, styles.outName]}>
                    {getWinkPlayerName(session, id)} · winked
                  </Text>
                  <PressableScale
                    accessibilityRole="button"
                    accessibilityLabel={`Mistake: bring ${getWinkPlayerName(session, id)} back in`}
                    onPress={() => apply((current) => restoreWinked(current, id))}
                    haptic="selection"
                    scaleTo={0.95}
                    style={styles.backIn}
                  >
                    <Icon name="refresh" size={14} color={color.textSecondary} />
                    <Text style={[type.label, styles.secondary]}>Back in</Text>
                  </PressableScale>
                </View>
              ) : (
                <Text key={id} style={[type.bodySm, styles.secondary]}>
                  {getWinkPlayerName(session, id)} · wrong accusation
                </Text>
              ),
            )}
            <Text style={[type.bodySm, styles.muted]}>Marked someone by mistake? Tap Back in.</Text>
          </Surface>
        ) : null}
        <Text style={[type.bodySm, styles.muted]}>
          Put the phone face down in the middle. Pick it up only to mark someone out or accuse.
        </Text>
      </ScrollView>
    </SessionShell>
  );
}

function PickPhase({
  session,
  eyebrow,
  title,
  subtitle,
  options,
  confirmLabel,
  onConfirm,
}: {
  session: WinkKillerSession;
  eyebrow: string;
  title: string;
  subtitle: string;
  options: { id: string; displayName: string }[];
  confirmLabel: string;
  onConfirm: (playerId: string) => void;
}) {
  const { apply, clearSession } = useWinkKillerSession();
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <SessionShell
      eyebrow={eyebrow}
      stage="play"
      stages={STAGES}
      title={title}
      subtitle={subtitle}
      accent={ACCENT}
      onEndGame={() => endGame(clearSession)}
      footer={
        <>
          <PrimaryButton
            label={confirmLabel}
            icon="target"
            disabled={!selected}
            onPress={() => {
              if (selected) onConfirm(selected);
            }}
          />
          <SecondaryButton label="Cancel" quiet onPress={() => apply(cancelAction)} />
        </>
      }
    >
      <PlayerPicker
        players={options}
        selectedId={selected}
        onSelect={setSelected}
        accent={ACCENT}
      />
    </SessionShell>
  );
}

function AccuseResultPhase({ session }: { session: WinkKillerSession }) {
  const { apply, clearSession } = useWinkKillerSession();
  const playVerdict = useSoundEffect(VERDICT_SOUND, SOUND_VOLUME.result);
  const enter = useEnterAnimation(1, 16);
  const accusation = session.lastAccusation;

  useEffect(() => playVerdict(), [playVerdict]);

  if (!accusation) return null;
  const accused = getWinkPlayerName(session, accusation.accusedId);
  const accuser = accusation.accuserId ? getWinkPlayerName(session, accusation.accuserId) : null;
  const detective = session.setup.detective;

  const title = accusation.correct ? `${accused} is a Killer!` : `${accused} is innocent`;
  const body = accusation.correct
    ? 'Caught. They are out of the game.'
    : detective
      ? `Wrong guess. The Detective has ${session.detectiveGuessesLeft} left.`
      : `Wrong accusation, so ${accuser ?? 'the accuser'} is out.`;

  return (
    <SessionShell
      eyebrow="Accusation"
      stage="play"
      stages={STAGES}
      accent={accusation.correct ? color.success : color.dangerUrgency}
      onEndGame={() => endGame(clearSession)}
      footer={
        <PrimaryButton
          label={session.winner ? 'See result' : 'Keep playing'}
          icon="chevronRight"
          onPress={() => apply(startPlay)}
        />
      }
    >
      <Animated.View style={[styles.center, enter]}>
        <GlyphDisk
          icon={accusation.correct ? 'target' : 'close'}
          accent={accusation.correct ? ACCENT : color.dangerUrgency}
        />
        <Text style={[type.displayLg, styles.titleCenter]}>{title}</Text>
        <Text style={[type.body, styles.secondaryCenter]}>{body}</Text>
      </Animated.View>
    </SessionShell>
  );
}

function ResultPhase({ session }: { session: WinkKillerSession }) {
  const { rematch, clearSession } = useWinkKillerSession();
  const citizensWon = session.winner === 'citizens';
  const playWin = useSoundEffect(WIN_SOUND, SOUND_VOLUME.result);
  const playLoss = useSoundEffect(LOSS_SOUND, SOUND_VOLUME.result);
  const enter = useEnterAnimation(1, 16);
  const killers = killerIds(session).map((id) => getWinkPlayerName(session, id));

  useEffect(() => (citizensWon ? playWin() : playLoss()), [citizensWon, playLoss, playWin]);

  return (
    <SessionShell
      eyebrow="Result"
      stage="result"
      stages={STAGES}
      accent={citizensWon ? color.success : ACCENT}
      footer={
        <>
          <PrimaryButton label="Play again" icon="refresh" onPress={() => rematch()} />
          <View style={styles.row}>
            <View style={styles.half}>
              <SecondaryButton
                label="Change setup"
                onPress={() => {
                  clearSession();
                  router.replace('/game/wink_killer/setup/review');
                }}
              />
            </View>
            <View style={styles.half}>
              <SecondaryButton label="Home" onPress={() => endGame(clearSession)} />
            </View>
          </View>
        </>
      }
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.stack}>
        <Animated.View style={[styles.center, enter]}>
          <ResultHero
            scene={citizensWon ? 'caught' : 'celebrate'}
            accent={ACCENT}
            title={citizensWon ? 'Citizens win' : killers.length > 1 ? 'Killers win' : 'Killer wins'}
          />
          <Text style={[type.body, styles.secondaryCenter]}>
            {killers.length > 1 ? 'Killers' : 'Killer'}:{' '}
            <Text style={{ color: color.dangerUrgency }}>{killers.join(' & ')}</Text>
          </Text>
        </Animated.View>
        {session.outIds.length ? (
          <Surface contentStyle={styles.card}>
            <Text style={[type.eyebrow, styles.muted]}>Out, in order</Text>
            {session.outIds.map((id) => (
              <Text key={id} style={[type.bodySm, styles.secondary]}>
                {getWinkPlayerName(session, id)} ·{' '}
                {session.outReasons[id] === 'caught'
                  ? 'caught'
                  : session.outReasons[id] === 'wrong_accusation'
                    ? 'wrong accusation'
                    : 'winked'}
              </Text>
            ))}
          </Surface>
        ) : null}
      </ScrollView>
    </SessionShell>
  );
}

export function WinkKillerSessionView({ session }: { session: WinkKillerSession }) {
  const { apply } = useWinkKillerSession();

  switch (session.phase) {
    case 'handoff':
      return <HandoffPhase session={session} />;
    case 'reveal':
      return <RevealPhase session={session} />;
    case 'detective_announce':
      return <DetectiveAnnouncePhase session={session} />;
    case 'play':
      return <PlayPhase session={session} />;
    case 'mark_out':
      return (
        <PickPhase
          key="mark_out"
          session={session}
          eyebrow="Winked out"
          title="Who fell?"
          subtitle="Pick the player who was winked out."
          options={winkablePlayers(session)}
          confirmLabel="Mark out"
          onConfirm={(playerId) => apply((current) => markWinked(current, playerId))}
        />
      );
    case 'accuse_accuser':
      return (
        <PickPhase
          key="accuse_accuser"
          session={session}
          eyebrow="Accusation"
          title="Who is accusing?"
          subtitle="If they are wrong, they are out."
          options={alivePlayers(session)}
          confirmLabel="Next"
          onConfirm={(playerId) => apply((current) => chooseAccuser(current, playerId))}
        />
      );
    case 'accuse_target':
      return (
        <PickPhase
          key="accuse_target"
          session={session}
          eyebrow="Accusation"
          title={
            session.accuserId
              ? `${getWinkPlayerName(session, session.accuserId)} accuses…`
              : 'Who is accused?'
          }
          subtitle="Pick the player they think is the killer."
          options={accuseTargets(session)}
          confirmLabel="Accuse"
          onConfirm={(playerId) => apply((current) => accuse(current, playerId))}
        />
      );
    case 'accuse_result':
      return <AccuseResultPhase session={session} />;
    case 'result':
      return <ResultPhase session={session} />;
    default:
      return null;
  }
}

const styles = StyleSheet.create({
  stack: {
    gap: space[4],
    paddingBottom: space[4],
  },
  card: {
    padding: space[4],
    gap: space[2],
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space[3],
  },
  primary: {
    color: color.textPrimary,
  },
  secondary: {
    color: color.textSecondary,
  },
  secondaryCenter: {
    color: color.textSecondary,
    textAlign: 'center',
  },
  muted: {
    color: color.textMuted,
  },
  titleCenter: {
    color: color.textPrimary,
    textAlign: 'center',
  },
  secretTitle: {
    color: color.textPrimary,
    textAlign: 'center',
  },
  secretBody: {
    color: color.textSecondary,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    gap: space[3],
  },
  half: {
    flex: 1,
  },
  outRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
  },
  outName: {
    flex: 1,
  },
  backIn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[1],
    minHeight: 36,
    paddingHorizontal: space[3],
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: color.borderSubtle,
    backgroundColor: overlay.glass,
  },
});
