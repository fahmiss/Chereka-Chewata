import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useManNegnSession } from '../../domain/manNegn/context';
import {
  answerNo,
  answerYes,
  cancelGuess,
  continueAfterGuess,
  currentRevealPlayer,
  finishReview,
  hideAndContinue,
  playerName,
  resolveGuess,
  revealOthers,
  revealReview,
  startGuess,
  startReview,
} from '../../domain/manNegn/machine';
import type { ManNegnSession } from '../../domain/manNegn/types';
import { color, space } from '../../theme/tokens';
import { type } from '../../theme/typography';
import { HoldHint, HoldToReveal, useHoldReveal } from '../session/HoldToReveal';
import { PassPhoneHandoff } from '../session/PassPhoneHandoff';
import { ResultHero } from '../session/ResultHero';
import { ResultActions } from '../session/ResultActions';
import { SessionShell } from '../session/SessionShell';
import { Icon } from '../ui/Icon';
import { PrimaryButton } from '../ui/PrimaryButton';
import { SecondaryButton } from '../ui/SecondaryButton';
import { Surface } from '../ui/Surface';
import { ReportCardButton } from '../session/ReportCardButton';

const ACCENT = color.gameManNegn;
const STAGES = ['see', 'ask', 'guess', 'result'] as const;

function endGame(clearSession: () => void) { router.replace('/home'); clearSession(); }

function Handoff({ session }: { session: ManNegnSession }) {
  const { apply, clearSession } = useManNegnSession();
  const player = currentRevealPlayer(session);
  return <PassPhoneHandoff name={player?.displayName ?? 'Player'} index={session.revealIndex + 1} total={session.setup.players.length} eyebrow="See the others" stage="see" stages={STAGES} accent={ACCENT} onReady={() => apply(revealOthers)} onEndGame={() => endGame(clearSession)} />;
}

function OthersList({ session, viewerId }: { session: ManNegnSession; viewerId: string }) {
  const others = session.setup.players.filter((player) => player.id !== viewerId);
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.identityList}>
      <Text style={[type.eyebrow, { color: ACCENT }]}>Everyone except you</Text>
      {others.map((other) => {
        const identity = session.assignments[other.id]!;
        return (
          <Surface key={other.id} active accent={ACCENT} contentStyle={styles.identityCard}>
            <View style={styles.identityHeading}>
              <Text style={[type.label, styles.muted]}>{other.displayName}</Text>
              {session.statuses[other.id] !== 'playing' ? (
                <Text style={[type.eyebrow, styles.identityStatus]}>
                  {session.statuses[other.id] === 'solved' ? 'SOLVED' : 'OUT'}
                </Text>
              ) : null}
            </View>
            <Text style={[type.titleMd, styles.primary]}>{identity.name_en}</Text>
            <Text style={[type.bodySm, styles.fact]}>{identity.facts_en.join(' · ')}</Text>
          </Surface>
        );
      })}
    </ScrollView>
  );
}

function Reveal({ session }: { session: ManNegnSession }) {
  const { apply, clearSession } = useManNegnSession();
  const { unlocked, unlock } = useHoldReveal(session.revealIndex);
  const player = currentRevealPlayer(session);
  return (
    <SessionShell eyebrow={`Private look · ${session.revealIndex + 1}/${session.setup.players.length}`} title={player?.displayName ?? 'Player'} subtitle="Memorize everyone else. Your own identity stays hidden." stage="see" stages={STAGES} accent={ACCENT} onEndGame={() => endGame(clearSession)} footer={unlocked ? <PrimaryButton label="Hide and pass" icon="checkCircle" onPress={() => apply(hideAndContinue)} /> : <HoldHint text="Hold until the ring fills. Keep the screen private." />}>
      <HoldToReveal accent={ACCENT} unlocked={unlocked} onUnlock={unlock} resetKey={session.revealIndex}>
        <OthersList session={session} viewerId={player?.id ?? ''} />
      </HoldToReveal>
    </SessionShell>
  );
}

function Play({ session }: { session: ManNegnSession }) {
  const { apply, clearSession } = useManNegnSession();
  const name = playerName(session, session.activePlayerId);
  const lives = session.lives[session.activePlayerId] ?? 0;
  return (
    <SessionShell
      eyebrow="Man Negn?"
      stage="ask"
      stages={STAGES}
      accent={ACCENT}
      onEndGame={() => endGame(clearSession)}
      footer={
        <>
          <View style={styles.buttonRow}>
            <View style={styles.half}><PrimaryButton label="Yes" icon="checkCircle" onPress={() => apply(answerYes)} /></View>
            <View style={styles.half}><SecondaryButton label="No" onPress={() => apply(answerNo)} /></View>
          </View>
          <Text style={[type.bodySm, styles.answerHint]}>Yes: keep asking · No: next player</Text>
          <SecondaryButton label="Buzz to guess" icon="target" onPress={() => apply(startGuess)} />
          <SecondaryButton label="Review the others" icon="eye" quiet onPress={() => apply(startReview)} />
        </>
      }
    >
      <View style={styles.playContext}>
        <Text style={[type.titleMd, styles.turnName]} accessibilityRole="header">{name}’s turn</Text>
        <View style={styles.lives}>
          <Icon name="target" size={15} color={ACCENT} />
          <Text style={[type.bodySm, styles.guessesLeft]}>{lives} {lives === 1 ? 'guess' : 'guesses'} left</Text>
        </View>
      </View>
      <ScrollView style={styles.playScroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.playHero}>
        <View style={styles.hiddenLabel}>
          <Icon name="lock" size={14} color={color.textMuted} />
          <Text style={[type.eyebrow, styles.hiddenText]}>Your identity is hidden</Text>
        </View>
        <Text style={[type.brushHero, styles.whoAmI]} accessibilityRole="header">{'WHO\nAM I?'}</Text>
        <Text style={[type.titleLg, styles.askInstruction]}>Ask a yes/no question.</Text>
        <View style={styles.playHint} accessibilityLiveRegion="polite">
          {session.turnQuestions > 0 ? (
            <>
              <View style={styles.yesFeedback}>
                <Icon name="checkCircle" size={18} color={color.success} />
                <Text style={[type.bodyStrong, { color: color.success }]}>Yes — keep asking</Text>
              </View>
              <Text style={[type.bodySm, styles.mutedCenter]}>
                {session.turnQuestions} Yes answer{session.turnQuestions === 1 ? '' : 's'} this turn
              </Text>
            </>
          ) : (
            <Text style={[type.body, styles.playHintText]}>Start broad: person, place, object, or something else?</Text>
          )}
        </View>
      </ScrollView>
    </SessionShell>
  );
}

function ReviewHandoff({ session }: { session: ManNegnSession }) {
  const { apply, clearSession } = useManNegnSession();
  return (
    <PassPhoneHandoff
      name={playerName(session, session.activePlayerId)}
      index={1}
      total={1}
      eyebrow="Private review"
      stage="see"
      stages={STAGES}
      note="Everyone else, look away. Your own identity will stay hidden."
      readyLabel="Review privately"
      accent={ACCENT}
      onReady={() => apply(revealReview)}
      onEndGame={() => endGame(clearSession)}
    />
  );
}

function Review({ session }: { session: ManNegnSession }) {
  const { apply, clearSession } = useManNegnSession();
  const { unlocked, unlock } = useHoldReveal(`review-${session.activePlayerId}`);
  return (
    <SessionShell
      eyebrow="Private review"
      title={playerName(session, session.activePlayerId)}
      subtitle="Refresh your memory. Your own identity is still hidden."
      stage="see"
      stages={STAGES}
      accent={ACCENT}
      onEndGame={() => endGame(clearSession)}
      footer={unlocked ? <PrimaryButton label="Hide and return" icon="checkCircle" onPress={() => apply(finishReview)} /> : <HoldHint text="Hold until the ring fills. Keep the screen private." />}
    >
      <HoldToReveal accent={ACCENT} unlocked={unlocked} onUnlock={unlock} resetKey={`review-${session.activePlayerId}`}>
        <OthersList session={session} viewerId={session.activePlayerId} />
      </HoldToReveal>
    </SessionShell>
  );
}

function Guess({ session }: { session: ManNegnSession }) {
  const { apply, clearSession } = useManNegnSession();
  const name = playerName(session, session.activePlayerId);
  return (
    <SessionShell eyebrow="Say one guess aloud" title={`${name}, who are you?`} subtitle="Everyone else already knows your identity. Ask them to confirm your spoken guess using Correct or Wrong. Keep the answer hidden." stage="guess" stages={STAGES} accent={ACCENT} onEndGame={() => endGame(clearSession)} footer={<><View style={styles.buttonRow}><View style={styles.half}><PrimaryButton label="Correct" icon="checkCircle" onPress={() => apply((s) => resolveGuess(s, true))} /></View><View style={styles.half}><SecondaryButton label="Wrong" onPress={() => apply((s) => resolveGuess(s, false))} /></View></View><SecondaryButton label="Keep asking" quiet onPress={() => apply(cancelGuess)} /></>}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.resultStack}>
      <Surface active accent={ACCENT} contentStyle={styles.revealCard}>
        <Icon name="lock" size={56} color={ACCENT} strokeWidth={1.6} />
        <Text style={[type.body, styles.mutedCenter]}>Your identity stays secret until you solve it or use both guesses.</Text>
      </Surface>
      </ScrollView>
    </SessionShell>
  );
}

function GuessResult({ session }: { session: ManNegnSession }) {
  const { apply, clearSession } = useManNegnSession();
  const guess = session.lastGuess!;
  const finished = session.statuses[guess.playerId] !== 'playing';
  const identity = finished ? session.assignments[guess.playerId] : null;
  return (
    <SessionShell eyebrow="Guess result" title={guess.correct ? 'You got it!' : finished ? 'Out of guesses' : 'One more chance'} subtitle={guess.correct ? `${playerName(session, guess.playerId)} solved their identity.` : finished ? 'You can still help answer everyone else’s questions.' : 'Your identity is still hidden. Keep narrowing it down on your next turn.'} stage="guess" stages={STAGES} accent={ACCENT} onEndGame={() => endGame(clearSession)} footer={<PrimaryButton label="Continue" onPress={() => apply(continueAfterGuess)} />}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.resultStack}>
      <Surface active accent={ACCENT} contentStyle={styles.revealCard}>
        <Icon name={finished ? 'eye' : 'lock'} size={40} color={ACCENT} />
        {identity ? <><Text style={[type.displayMd, styles.primary]}>{identity.name_en}</Text><Text style={[type.body, styles.mutedCenter]}>{identity.facts_en.join(' · ')}</Text></> : <Text style={[type.titleMd, styles.primary]}>1 guess left</Text>}
        {identity ? <ReportCardButton game="man_negn" cardId={identity.id} /> : null}
      </Surface>
      </ScrollView>
    </SessionShell>
  );
}

function Result({ session }: { session: ManNegnSession }) {
  const { rematch, clearSession } = useManNegnSession();
  const solved = session.finishOrder;
  const out = session.setup.players.filter((p) => session.statuses[p.id] === 'out');
  return <SessionShell eyebrow="Finished" stage="result" stages={STAGES} accent={ACCENT} onEndGame={() => endGame(clearSession)} footer={<ResultActions gameId="man_negn" onPlayAgain={() => rematch()} onLeave={clearSession} />}>
    <ScrollView contentContainerStyle={styles.resultStack} showsVerticalScrollIndicator={false}>
      <ResultHero scene="celebrate" accent={ACCENT} title={solved[0] ? `${playerName(session, solved[0])} finished first` : 'Nobody solved it'} detail={solved.length ? `${solved.length} of ${session.setup.players.length} players guessed their identity correctly. The finish order follows who solved first.` : 'Everyone used both guesses. All identities are revealed below.'} />
      {solved.map((id, index) => <Surface key={id} active={index === 0} accent={ACCENT} contentStyle={styles.resultRow}><Text style={[type.numeric, { color: ACCENT }]}>#{index + 1}</Text><View style={styles.resultCopy}><Text style={[type.bodyStrong, styles.primary]}>{playerName(session, id)}</Text><Text style={[type.bodySm, styles.muted]}>{session.assignments[id]!.name_en}</Text></View></Surface>)}
      {out.map((player) => <Surface key={player.id} contentStyle={styles.resultRow}><Text style={[type.label, styles.muted]}>OUT</Text><View style={styles.resultCopy}><Text style={[type.bodyStrong, styles.primary]}>{player.displayName}</Text><Text style={[type.bodySm, styles.muted]}>{session.assignments[player.id]!.name_en}</Text></View></Surface>)}
    </ScrollView>
  </SessionShell>;
}

export function ManNegnSessionView({ session }: { session: ManNegnSession }) {
  if (session.phase === 'handoff') return <Handoff session={session} />;
  if (session.phase === 'reveal') return <Reveal session={session} />;
  if (session.phase === 'play') return <Play session={session} />;
  if (session.phase === 'review_handoff') return <ReviewHandoff session={session} />;
  if (session.phase === 'review') return <Review session={session} />;
  if (session.phase === 'guess') return <Guess session={session} />;
  if (session.phase === 'guess_result') return <GuessResult session={session} />;
  return <Result session={session} />;
}

const styles = StyleSheet.create({
  identityList: { gap: space[3], paddingVertical: space[2] }, identityCard: { padding: space[4], gap: space[1] }, identityHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space[2] }, identityStatus: { color: color.success }, primary: { color: color.textPrimary }, muted: { color: color.textMuted }, fact: { color: color.textSecondary, lineHeight: 20 },
  playContext: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space[3] },
  turnName: { color: color.textPrimary, fontSize: 18, lineHeight: 24, flex: 1 },
  lives: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  guessesLeft: { color: color.textSecondary, fontSize: 13, lineHeight: 18 },
  playScroll: { flex: 1 },
  playHero: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', paddingTop: space[6], paddingBottom: space[8] },
  hiddenLabel: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, marginBottom: space[6] },
  hiddenText: { color: color.textMuted, letterSpacing: 1.6, flexShrink: 1, textAlign: 'center' },
  whoAmI: { color: ACCENT, fontSize: 60, lineHeight: 69, textAlign: 'center', paddingHorizontal: space[2], paddingBottom: space[2] },
  askInstruction: { color: color.textPrimary, textAlign: 'center', marginTop: space[5] },
  playHint: { alignItems: 'center', justifyContent: 'center', gap: space[1], minHeight: 48, marginTop: space[2] },
  playHintText: { color: color.textSecondary, fontSize: 15, lineHeight: 22, textAlign: 'center', maxWidth: 270 },
  answerHint: { color: color.textMuted, textAlign: 'center', fontSize: 13, lineHeight: 18, marginTop: -2, marginBottom: 2 },
  yesFeedback: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
  mutedCenter: { color: color.textSecondary, textAlign: 'center' },
  buttonRow: { flexDirection: 'row', gap: space[3] }, half: { flex: 1 }, revealCard: { minHeight: 260, padding: space[6], alignItems: 'center', justifyContent: 'center', gap: space[4] }, resultStack: { gap: space[3], paddingBottom: space[4] }, resultRow: { padding: space[4], flexDirection: 'row', alignItems: 'center', gap: space[4] }, resultCopy: { flex: 1, gap: 2 },
});
