import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useEwnetSession } from '../../domain/ewnetWeysSaks/context';
import {
  castVote,
  currentBlufferId,
  currentQuestion,
  currentVoterId,
  ewnetPlayerName,
  ewnetStandings,
  fooledCount,
  nextRound,
  readyForPrivateStep,
  startBluffs,
  submitBluff,
  validateBluff,
  voteOptions,
} from '../../domain/ewnetWeysSaks/machine';
import type { EwnetSession } from '../../domain/ewnetWeysSaks/types';
import { alpha, color, overlay, radius, space } from '../../theme/tokens';
import { family, type } from '../../theme/typography';
import { PassPhoneHandoff } from '../session/PassPhoneHandoff';
import { ResultHero } from '../session/ResultHero';
import { Standings } from '../session/Scoreboards';
import { SessionShell } from '../session/SessionShell';
import { MetaChip } from '../ui/Chip';
import { Icon } from '../ui/Icon';
import { PressableScale } from '../ui/PressableScale';
import { PrimaryButton } from '../ui/PrimaryButton';
import { SecondaryButton } from '../ui/SecondaryButton';
import { Surface } from '../ui/Surface';

const ACCENT = color.gameEwnetWeysSaks;
const STAGES = ['bluff', 'vote', 'truth', 'result'] as const;

function endGame(clearSession: () => void) {
  router.replace('/home');
  clearSession();
}

function Intro({ session }: { session: EwnetSession }) {
  const { apply, clearSession } = useEwnetSession();
  const question = currentQuestion(session);
  return (
    <SessionShell
      eyebrow={`Round ${session.roundIndex + 1} of ${session.deck.length}`}
      stage="bluff"
      stages={STAGES}
      title="Make the lie believable"
      subtitle="Everyone writes one fake answer. The truth will be mixed in after the phone goes around."
      accent={ACCENT}
      onEndGame={() => endGame(clearSession)}
      footer={<PrimaryButton label="Start writing bluffs" icon="pencil" onPress={() => apply(startBluffs)} />}
    >
      <Surface accent={ACCENT} active contentStyle={styles.questionCard}>
        <MetaChip icon="question" label="Question" tint={ACCENT} />
        <Text style={[type.displayMd, styles.question]}>{question.question_en}</Text>
        <Text style={[type.bodySm, styles.muted]}>Do not say possible answers aloud.</Text>
      </Surface>
    </SessionShell>
  );
}

function Handoff({ session, kind }: { session: EwnetSession; kind: 'bluff' | 'vote' }) {
  const { apply, clearSession } = useEwnetSession();
  const playerId = kind === 'bluff' ? currentBlufferId(session) : currentVoterId(session);
  return (
    <PassPhoneHandoff
      name={ewnetPlayerName(session, playerId)}
      index={(kind === 'bluff' ? session.bluffIndex : session.voteIndex) + 1}
      total={kind === 'bluff' ? session.bluffOrder.length : session.voteOrder.length}
      accent={ACCENT}
      eyebrow={kind === 'bluff' ? 'Private bluff' : 'Private vote'}
      stage={kind === 'bluff' ? 'bluff' : 'vote'}
      stages={STAGES}
      note={kind === 'bluff' ? 'Others should not see your fake answer.' : 'Others should not see your choice.'}
      onReady={() => apply(readyForPrivateStep)}
      onEndGame={() => endGame(clearSession)}
    />
  );
}

function BluffEntry({ session }: { session: EwnetSession }) {
  const { apply, clearSession } = useEwnetSession();
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const playerId = currentBlufferId(session);
  const submit = () => {
    const issue = validateBluff(session, value);
    if (issue) {
      setError(issue);
      return;
    }
    apply((current) => submitBluff(current, value));
  };
  return (
    <SessionShell
      eyebrow="Your fake answer"
      stage="bluff"
      stages={STAGES}
      title={ewnetPlayerName(session, playerId)}
      subtitle="Write something plausible enough to fool your friends. Keep it short."
      accent={ACCENT}
      onEndGame={() => endGame(clearSession)}
      footer={<PrimaryButton label="Lock my bluff" icon="lock" disabled={!value.trim()} onPress={submit} />}
    >
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <Surface contentStyle={styles.entryCard}>
          <Text style={[type.titleMd, styles.entryQuestion]}>{currentQuestion(session).question_en}</Text>
          <TextInput
            autoFocus
            value={value}
            onChangeText={(text) => {
              setValue(text);
              setError(null);
            }}
            onSubmitEditing={submit}
            placeholder="Type a convincing fake answer…"
            placeholderTextColor={color.textMuted}
            maxLength={60}
            returnKeyType="done"
            style={styles.input}
            accessibilityLabel="Your fake answer"
          />
          <View style={styles.inputMeta}>
            <Text style={[type.bodySm, { color: error ? color.dangerUrgency : color.textMuted }]}>
              {error ?? 'The real answer is hidden.'}
            </Text>
            <Text style={[type.mono, styles.count]}>{value.length}/60</Text>
          </View>
        </Surface>
      </KeyboardAvoidingView>
    </SessionShell>
  );
}

function Vote({ session }: { session: EwnetSession }) {
  const { apply, clearSession } = useEwnetSession();
  const [selected, setSelected] = useState<string | null>(null);
  useEffect(() => setSelected(null), [session.voteIndex]);
  return (
    <SessionShell
      eyebrow="Find the truth"
      stage="vote"
      stages={STAGES}
      title={ewnetPlayerName(session, currentVoterId(session))}
      subtitle="One answer is true. The others were written by your friends. You cannot pick your own."
      accent={ACCENT}
      onEndGame={() => endGame(clearSession)}
      footer={
        <PrimaryButton
          label="Lock my answer"
          icon="lock"
          disabled={!selected}
          onPress={() => selected && apply((current) => castVote(current, selected))}
        />
      }
    >
      <ScrollView contentContainerStyle={styles.answerList} showsVerticalScrollIndicator={false}>
        <Text style={[type.titleMd, styles.voteQuestion]}>{currentQuestion(session).question_en}</Text>
        {voteOptions(session).map((answer, index) => (
          <PressableScale
            key={answer.id}
            accessibilityRole="radio"
            accessibilityState={{ selected: selected === answer.id }}
            onPress={() => setSelected(answer.id)}
            haptic="selection"
            style={[
              styles.answerOption,
              selected === answer.id && {
                borderColor: alpha(ACCENT, 0.7),
                backgroundColor: alpha(ACCENT, 0.14),
              },
            ]}
          >
            <Text style={[type.numeric, { color: selected === answer.id ? ACCENT : color.textMuted }]}>
              {String.fromCharCode(65 + index)}
            </Text>
            <Text style={[type.titleMd, styles.answerText]}>{answer.text}</Text>
            {selected === answer.id ? <Icon name="checkCircle" color={ACCENT} /> : null}
          </PressableScale>
        ))}
      </ScrollView>
    </SessionShell>
  );
}

function RoundResult({ session }: { session: EwnetSession }) {
  const { apply, clearSession } = useEwnetSession();
  const question = currentQuestion(session);
  return (
    <SessionShell
      eyebrow={`Round ${session.roundIndex + 1} reveal`}
      stage="truth"
      stages={STAGES}
      title="The truth is out"
      subtitle={question.explanation_en}
      accent={ACCENT}
      onEndGame={() => endGame(clearSession)}
      footer={
        <PrimaryButton
          label={session.roundIndex + 1 >= session.deck.length ? 'See final scores' : 'Next round'}
          icon={session.roundIndex + 1 >= session.deck.length ? 'trophy' : 'chevronRight'}
          onPress={() => apply(nextRound)}
        />
      }
    >
      <ScrollView contentContainerStyle={styles.resultList} showsVerticalScrollIndicator={false}>
        <Text style={[type.body, styles.resultQuestion]}>{question.question_en}</Text>
        {session.answers.map((answer) => {
          const fooled = fooledCount(session, answer.id);
          return (
            <Surface
              key={answer.id}
              accent={answer.isTruth ? color.success : ACCENT}
              active={answer.isTruth}
              contentStyle={styles.resultAnswer}
            >
              <View style={styles.resultTop}>
                <Text style={[type.titleMd, styles.answerText]}>{answer.text}</Text>
                <MetaChip
                  icon={answer.isTruth ? 'checkCircle' : 'users'}
                  label={answer.isTruth ? 'TRUE' : `${fooled} fooled`}
                  tint={answer.isTruth ? color.success : ACCENT}
                />
              </View>
              <Text style={[type.bodySm, styles.muted]}>
                {answer.isTruth ? 'The real answer · truth voters earn 2' : `Written by ${ewnetPlayerName(session, answer.authorId)} · +${fooled}`}
              </Text>
            </Surface>
          );
        })}
      </ScrollView>
    </SessionShell>
  );
}

function Final({ session }: { session: EwnetSession }) {
  const { rematch, clearSession } = useEwnetSession();
  const rows = ewnetStandings(session).map((row) => ({ id: row.id, name: row.displayName, score: row.score }));
  const top = rows[0]?.score ?? 0;
  const winners = rows.filter((row) => row.score === top).map((row) => row.name);
  return (
    <SessionShell
      eyebrow="Final scores"
      stage="result"
      stages={STAGES}
      title="Best bluffer, best detective"
      accent={ACCENT}
      onEndGame={() => endGame(clearSession)}
      footer={
        <>
          <PrimaryButton label="Play again" icon="refresh" onPress={() => rematch()} />
          <SecondaryButton label="Back home" icon="home" quiet onPress={() => endGame(clearSession)} />
        </>
      }
    >
      <ScrollView contentContainerStyle={styles.finalContent} showsVerticalScrollIndicator={false}>
        <ResultHero
          scene="celebrate"
          accent={ACCENT}
          title={winners.length > 1 ? `${winners.join(' & ')} tie!` : `${winners[0] ?? 'Nobody'} wins!`}
        />
        <Text style={[type.body, styles.finalSubtitle]}>{top} points after {session.deck.length} rounds</Text>
        <Standings rows={rows} accent={ACCENT} />
      </ScrollView>
    </SessionShell>
  );
}

export function EwnetWeysSaksSessionView({ session }: { session: EwnetSession }) {
  switch (session.phase) {
    case 'round_intro': return <Intro session={session} />;
    case 'bluff_handoff': return <Handoff session={session} kind="bluff" />;
    case 'bluff_entry': return <BluffEntry session={session} />;
    case 'vote_handoff': return <Handoff session={session} kind="vote" />;
    case 'vote_select': return <Vote session={session} />;
    case 'round_result': return <RoundResult session={session} />;
    case 'final': return <Final session={session} />;
  }
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  questionCard: { padding: space[6], gap: space[5] },
  question: { color: color.textPrimary, lineHeight: 38 },
  muted: { color: color.textMuted },
  entryCard: { padding: space[5], gap: space[4] },
  entryQuestion: { color: color.textSecondary },
  input: {
    minHeight: 72,
    borderRadius: radius.medium,
    borderWidth: 1,
    borderColor: alpha(ACCENT, 0.45),
    backgroundColor: overlay.glass,
    paddingHorizontal: space[4],
    paddingVertical: space[4],
    color: color.textPrimary,
    fontFamily: family.body.regular,
    fontSize: 19,
  },
  inputMeta: { flexDirection: 'row', justifyContent: 'space-between', gap: space[3] },
  count: { color: color.textMuted },
  answerList: { gap: space[3], paddingBottom: space[6] },
  voteQuestion: { color: color.textPrimary, marginBottom: space[2] },
  answerOption: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    padding: space[4],
    borderRadius: radius.medium,
    borderWidth: 1,
    borderColor: color.borderSubtle,
    backgroundColor: overlay.glass,
  },
  answerText: { color: color.textPrimary, flex: 1 },
  resultList: { gap: space[3], paddingBottom: space[6] },
  resultQuestion: { color: color.textSecondary, marginBottom: space[2] },
  resultAnswer: { padding: space[4], gap: space[2] },
  resultTop: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
  finalContent: { gap: space[5], paddingBottom: space[6] },
  finalSubtitle: { color: color.textSecondary, textAlign: 'center' },
});
