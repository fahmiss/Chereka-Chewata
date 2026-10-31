import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useManNegnSession } from '../../domain/manNegn/context';
import { answerNo, cancelGuess, currentRevealPlayer, hideAndContinue, playerName, resolveGuess, revealOthers, startGuess } from '../../domain/manNegn/machine';
import type { ManNegnSession } from '../../domain/manNegn/types';
import { alpha, color, radius, space } from '../../theme/tokens';
import { type } from '../../theme/typography';
import { HoldHint, HoldToReveal, useHoldReveal } from '../session/HoldToReveal';
import { PassPhoneHandoff } from '../session/PassPhoneHandoff';
import { ResultHero } from '../session/ResultHero';
import { SessionShell } from '../session/SessionShell';
import { Icon } from '../ui/Icon';
import { PrimaryButton } from '../ui/PrimaryButton';
import { SecondaryButton } from '../ui/SecondaryButton';
import { Surface } from '../ui/Surface';

const ACCENT = color.gameManNegn;
const STAGES = ['see', 'ask', 'guess', 'result'] as const;

function endGame(clearSession: () => void) { router.replace('/home'); clearSession(); }

function Handoff({ session }: { session: ManNegnSession }) {
  const { apply, clearSession } = useManNegnSession();
  const player = currentRevealPlayer(session);
  return <PassPhoneHandoff name={player?.displayName ?? 'Player'} index={session.revealIndex + 1} total={session.setup.players.length} eyebrow="See the others" stage="see" stages={STAGES} accent={ACCENT} onReady={() => apply(revealOthers)} onEndGame={() => endGame(clearSession)} />;
}

function Reveal({ session }: { session: ManNegnSession }) {
  const { apply, clearSession } = useManNegnSession();
  const { unlocked, unlock } = useHoldReveal(session.revealIndex);
  const player = currentRevealPlayer(session);
  const others = session.setup.players.filter((p) => p.id !== player?.id);
  return (
    <SessionShell eyebrow={`Private look · ${session.revealIndex + 1}/${session.setup.players.length}`} title={player?.displayName ?? 'Player'} subtitle="Memorize everyone else. Your own identity stays hidden." stage="see" stages={STAGES} accent={ACCENT} onEndGame={() => endGame(clearSession)} footer={unlocked ? <PrimaryButton label="Hide and pass" icon="checkCircle" onPress={() => apply(hideAndContinue)} /> : <HoldHint text="Hold until the ring fills. Keep the screen private." />}>
      <HoldToReveal accent={ACCENT} unlocked={unlocked} onUnlock={unlock} resetKey={session.revealIndex}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.identityList}>
          <Text style={[type.eyebrow, { color: ACCENT }]}>Everyone except you</Text>
          {others.map((other) => {
            const identity = session.assignments[other.id]!;
            return <Surface key={other.id} active accent={ACCENT} contentStyle={styles.identityCard}>
              <Text style={[type.label, styles.muted]}>{other.displayName}</Text>
              <Text style={[type.titleMd, styles.primary]}>{identity.name_en}</Text>
              <Text style={[type.bodySm, styles.fact]}>{identity.facts_en.join(' · ')}</Text>
            </Surface>;
          })}
        </ScrollView>
      </HoldToReveal>
    </SessionShell>
  );
}

function Play({ session }: { session: ManNegnSession }) {
  const { apply, clearSession } = useManNegnSession();
  const name = playerName(session, session.activePlayerId);
  const lives = session.lives[session.activePlayerId] ?? 0;
  return (
    <SessionShell eyebrow="Ask a yes/no question" title={`${name}'s turn`} subtitle="Ask the group about your hidden identity. Do not ask for the name directly." stage="ask" stages={STAGES} accent={ACCENT} onEndGame={() => endGame(clearSession)} footer={<>
      <View style={styles.buttonRow}><View style={styles.half}><PrimaryButton label="Yes — ask again" icon="checkCircle" onPress={() => {}} /></View><View style={styles.half}><SecondaryButton label="No — next player" onPress={() => apply(answerNo)} /></View></View>
      <SecondaryButton label="Buzz to guess" icon="target" onPress={() => apply(startGuess)} />
    </>}>
      <View style={styles.center}>
        <View style={[styles.questionDisk, { backgroundColor: alpha(ACCENT, 0.15), borderColor: alpha(ACCENT, 0.45) }]}><Icon name="question" size={54} color={ACCENT} strokeWidth={1.8} /></View>
        <Text style={[type.bodyStrong, styles.primary]}>Your identity is hidden</Text>
        <Text style={[type.body, styles.mutedCenter]}>The group answers only Yes or No. A Yes keeps your turn; a No passes it.</Text>
        <View style={styles.lives}><Icon name="target" size={18} color={color.dangerUrgency} /><Text style={[type.label, styles.primary]}>{lives} guess{lives === 1 ? '' : 'es'} left</Text></View>
      </View>
    </SessionShell>
  );
}

function Guess({ session }: { session: ManNegnSession }) {
  const { apply, clearSession } = useManNegnSession();
  const [revealed, setRevealed] = useState(false);
  const identity = session.assignments[session.activePlayerId]!;
  const name = playerName(session, session.activePlayerId);
  return (
    <SessionShell eyebrow="Buzzed in" title={`${name}, say your guess`} subtitle="Say one final answer out loud. Then reveal the card and let the group confirm it." stage="guess" stages={STAGES} accent={ACCENT} onEndGame={() => endGame(clearSession)} footer={revealed ? <><View style={styles.buttonRow}><View style={styles.half}><PrimaryButton label="Correct" icon="checkCircle" onPress={() => apply((s) => resolveGuess(s, true))} /></View><View style={styles.half}><SecondaryButton label="Wrong" onPress={() => apply((s) => resolveGuess(s, false))} /></View></View></> : <><PrimaryButton label="Reveal my identity" icon="eye" onPress={() => setRevealed(true)} /><SecondaryButton label="Cancel guess" quiet onPress={() => apply(cancelGuess)} /></>}>
      <Surface active accent={ACCENT} contentStyle={styles.revealCard}>
        <Text style={[type.eyebrow, { color: ACCENT }]}>{revealed ? 'Your identity' : 'Say your answer first'}</Text>
        {revealed ? <><Text style={[type.displayLg, styles.primary]} numberOfLines={2} adjustsFontSizeToFit>{identity.name_en}</Text><Text style={[type.body, styles.mutedCenter]}>{identity.facts_en.join(' · ')}</Text></> : <Icon name="lock" size={56} color={ACCENT} strokeWidth={1.6} />}
      </Surface>
    </SessionShell>
  );
}

function Result({ session }: { session: ManNegnSession }) {
  const { rematch, clearSession } = useManNegnSession();
  const solved = session.finishOrder;
  const out = session.setup.players.filter((p) => session.statuses[p.id] === 'out');
  return <SessionShell eyebrow="Finished" stage="result" stages={STAGES} accent={ACCENT} onEndGame={() => endGame(clearSession)} footer={<><PrimaryButton label="Play again" icon="refresh" onPress={() => rematch()} /><View style={styles.buttonRow}><View style={styles.half}><SecondaryButton label="Change setup" onPress={() => { clearSession(); router.replace('/game/man_negn/setup/review'); }} /></View><View style={styles.half}><SecondaryButton label="Home" onPress={() => endGame(clearSession)} /></View></View></>}>
    <ScrollView contentContainerStyle={styles.resultStack} showsVerticalScrollIndicator={false}>
      <ResultHero scene="celebrate" accent={ACCENT} title="Identity revealed!" />
      {solved.map((id, index) => <Surface key={id} active={index === 0} accent={ACCENT} contentStyle={styles.resultRow}><Text style={[type.numeric, { color: ACCENT }]}>#{index + 1}</Text><View style={styles.resultCopy}><Text style={[type.bodyStrong, styles.primary]}>{playerName(session, id)}</Text><Text style={[type.bodySm, styles.muted]}>{session.assignments[id]!.name_en}</Text></View></Surface>)}
      {out.map((player) => <Surface key={player.id} contentStyle={styles.resultRow}><Text style={[type.label, styles.muted]}>OUT</Text><View style={styles.resultCopy}><Text style={[type.bodyStrong, styles.primary]}>{player.displayName}</Text><Text style={[type.bodySm, styles.muted]}>{session.assignments[player.id]!.name_en}</Text></View></Surface>)}
    </ScrollView>
  </SessionShell>;
}

export function ManNegnSessionView({ session }: { session: ManNegnSession }) {
  if (session.phase === 'handoff') return <Handoff session={session} />;
  if (session.phase === 'reveal') return <Reveal session={session} />;
  if (session.phase === 'play') return <Play session={session} />;
  if (session.phase === 'guess') return <Guess session={session} />;
  return <Result session={session} />;
}

const styles = StyleSheet.create({
  identityList: { gap: space[3], paddingVertical: space[2] }, identityCard: { padding: space[4], gap: space[1] }, primary: { color: color.textPrimary }, muted: { color: color.textMuted }, fact: { color: color.textSecondary, lineHeight: 20 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space[4], paddingHorizontal: space[4] }, questionDisk: { width: 112, height: 112, borderRadius: radius.pill, borderWidth: 1, alignItems: 'center', justifyContent: 'center' }, mutedCenter: { color: color.textSecondary, textAlign: 'center' }, lives: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
  buttonRow: { flexDirection: 'row', gap: space[3] }, half: { flex: 1 }, revealCard: { minHeight: 260, padding: space[6], alignItems: 'center', justifyContent: 'center', gap: space[4] }, resultStack: { gap: space[3], paddingBottom: space[4] }, resultRow: { padding: space[4], flexDirection: 'row', alignItems: 'center', gap: space[4] }, resultCopy: { flex: 1, gap: 2 },
});
