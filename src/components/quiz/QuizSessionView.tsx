import { router } from 'expo-router';
import { Animated, ScrollView, StyleSheet, Text, View } from 'react-native';
import { getCategoryName } from '../../content/categories';
import { localizeText } from '../../content/localize';
import {
  currentQuizPlayer,
  currentQuizQuestion,
  selectedQuizAnswer,
} from '../../domain/quiz/machine';
import { useQuizSession } from '../../domain/quiz/SessionContext';
import type { QuizAnswer, QuizSession } from '../../domain/quiz/types';
import { hapticImpact, hapticSuccess } from '../../theme/haptics';
import { useEnterAnimation } from '../../theme/motion';
import { alpha, color, radius, space } from '../../theme/tokens';
import { family, type } from '../../theme/typography';
import { useSoundEffect } from '../../theme/useSoundEffect';
import { MoonFace } from '../brand/MoonFace';
import { ReportCardButton } from '../session/ReportCardButton';
import { SessionShell } from '../session/SessionShell';
import { Icon } from '../ui/Icon';
import { PressableScale } from '../ui/PressableScale';
import { PrimaryButton } from '../ui/PrimaryButton';
import { SecondaryButton } from '../ui/SecondaryButton';

const ACCENT = color.gameQuiz;
const STAGES = ['ready', 'question', 'reveal', 'result'] as const;
const LETTERS = ['A', 'B', 'C', 'D'] as const;

function leaveQuiz(clear: () => void) {
  router.replace('/home');
  clear();
}

function Ready({ session }: { session: QuizSession }) {
  const { dispatch, clearSession } = useQuizSession();
  const enter = useEnterAnimation(0, 18);
  const compete = session.setup.playMode === 'compete';

  return (
    <SessionShell
      eyebrow={compete ? 'Compete' : 'Pass & Play'}
      stage="ready"
      stages={STAGES}
      accent={ACCENT}
      onEndGame={() => leaveQuiz(clearSession)}
      footer={<PrimaryButton label="Begin Quiz" icon="checkCircle" onPress={dispatch.begin} />}
    >
      <Animated.View style={[styles.center, enter]}>
        <MoonFace expression="quiz" size={108} />
        <Text style={[type.displayLg, styles.centerTitle]}>Ready for Quiz?</Text>
        <Text style={[type.body, styles.centerBody]}>
          {compete
            ? `${session.setup.players.length} players · ${session.questions.length} total questions · +1 for each correct answer`
            : `${session.questions.length} questions · answer, reveal, then pass the phone`}
        </Text>
      </Animated.View>
    </SessionShell>
  );
}

function Question({ session }: { session: QuizSession }) {
  const { dispatch, clearSession } = useQuizSession();
  const question = currentQuizQuestion(session);
  const player = currentQuizPlayer(session);
  const selected = selectedQuizAnswer(session);
  const revealed = session.phase === 'answer_reveal';
  const last = session.questionIndex + 1 >= session.questions.length;
  const enter = useEnterAnimation(session.questionIndex, 12);
  const playCorrect = useSoundEffect(require('../../../assets/sounds/taboo-correct.wav'), 0.6);
  const playIncorrect = useSoundEffect(require('../../../assets/sounds/result-loss.wav'), 0.5);

  if (!question) return null;

  const select = (answer: QuizAnswer) => {
    if (revealed) return;
    if (answer.correct) {
      hapticSuccess();
      playCorrect();
    } else {
      hapticImpact('medium');
      playIncorrect();
    }
    dispatch.selectAnswer(answer.id);
  };

  const explanation = localizeText(session.contentLanguage, {
    en: question.explanation_en ?? undefined,
    am: question.explanation_am ?? undefined,
  });

  return (
    <SessionShell
      eyebrow={`Question ${session.questionIndex + 1} of ${session.questions.length}`}
      stage={revealed ? 'reveal' : 'question'}
      stages={STAGES}
      accent={ACCENT}
      onEndGame={() => leaveQuiz(clearSession)}
      footer={revealed ? (
        <View style={styles.footer}>
          <PrimaryButton
            label={last ? 'See results' : 'Next question'}
            icon={last ? 'trophy' : 'chevronRight'}
            onPress={dispatch.continueAfterReveal}
          />
          <ReportCardButton
            game="quiz"
            cardId={question.id}
            onReported={dispatch.continueAfterReveal}
          />
        </View>
      ) : undefined}
    >
      <Animated.View style={[styles.questionWrap, enter]}>
        {player ? (
          <Text style={[type.titleLg, styles.turn]}>{player.displayName}’s turn</Text>
        ) : null}
        <Text style={[type.mono, styles.meta]}>
          {getCategoryName(question.category_id, session.contentLanguage)} · {question.difficulty}
        </Text>
        <Text
          style={[
            type.titleLg,
            styles.questionText,
            session.contentLanguage !== 'en' ? { fontFamily: family.ethiopic.bold } : null,
          ]}
        >
          {localizeText(session.contentLanguage, {
            en: question.question_en,
            am: question.question_am,
          })}
        </Text>

        <ScrollView
          style={styles.answersScroll}
          contentContainerStyle={styles.answers}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {session.currentAnswers.map((answer, index) => (
            <AnswerCard
              key={answer.id}
              answer={answer}
              letter={LETTERS[index]!}
              language={session.contentLanguage}
              revealed={revealed}
              selected={selected?.id === answer.id}
              onPress={() => select(answer)}
            />
          ))}

          {revealed ? (
            <View style={styles.feedback}>
              <View style={styles.feedbackTitle}>
                <Icon
                  name={selected?.correct ? 'checkCircle' : 'close'}
                  size={22}
                  color={selected?.correct ? color.success : color.dangerUrgency}
                  strokeWidth={2.5}
                />
                <Text
                  style={[
                    type.titleMd,
                    { color: selected?.correct ? color.success : color.textPrimary },
                  ]}
                >
                  {selected?.correct
                    ? session.setup.playMode === 'compete'
                      ? 'Nice! +1'
                      : 'Nice!'
                    : 'Not this time'}
                </Text>
              </View>
              {explanation ? (
                <Text
                  style={[
                    type.bodySm,
                    styles.explanation,
                    session.contentLanguage !== 'en'
                      ? { fontFamily: family.ethiopic.regular }
                      : null,
                  ]}
                >
                  {explanation}
                </Text>
              ) : null}
            </View>
          ) : null}
        </ScrollView>
      </Animated.View>
    </SessionShell>
  );
}

function AnswerCard({
  answer,
  letter,
  language,
  revealed,
  selected,
  onPress,
}: {
  answer: QuizAnswer;
  letter: string;
  language: QuizSession['contentLanguage'];
  revealed: boolean;
  selected: boolean;
  onPress: () => void;
}) {
  const correct = revealed && answer.correct;
  const incorrectSelection = revealed && selected && !answer.correct;
  const tint = correct ? color.success : incorrectSelection ? color.dangerUrgency : ACCENT;

  return (
    <PressableScale
      accessibilityRole="radio"
      accessibilityState={{ selected, disabled: revealed }}
      disabled={revealed}
      haptic="none"
      onPress={onPress}
      scaleTo={0.985}
      style={[
        styles.answer,
        { borderColor: alpha(tint, correct || incorrectSelection || selected ? 0.75 : 0.24) },
        (correct || incorrectSelection || selected) && { backgroundColor: alpha(tint, 0.13) },
        revealed && !correct && !selected ? styles.dimmed : null,
      ]}
    >
      <View style={[styles.letter, { borderColor: alpha(tint, 0.55) }]}>
        <Text style={[type.numeric, { color: tint }]}>{letter}</Text>
      </View>
      <Text
        style={[
          type.bodyStrong,
          styles.answerText,
          language !== 'en' ? { fontFamily: family.ethiopic.medium } : null,
        ]}
      >
        {localizeText(language, { en: answer.text_en, am: answer.text_am })}
      </Text>
      {correct || incorrectSelection ? (
        <Icon
          name={correct ? 'check' : 'close'}
          size={19}
          color={tint}
          strokeWidth={2.8}
        />
      ) : null}
    </PressableScale>
  );
}

function Result({ session }: { session: QuizSession }) {
  const { dispatch, clearSession } = useQuizSession();
  const compete = session.setup.playMode === 'compete';
  const enter = useEnterAnimation(0, 18);
  const played = session.correctCount + session.incorrectCount;
  const accuracy = played ? Math.round((session.correctCount / played) * 100) : 0;
  const leaderboard = session.setup.players
    .map((player) => ({ ...player, score: session.scores[player.id] ?? 0 }))
    .sort((a, b) => b.score - a.score);
  const topScore = leaderboard[0]?.score ?? 0;
  const winners = leaderboard.filter((player) => player.score === topScore);

  return (
    <SessionShell
      eyebrow="Session complete"
      stage="result"
      stages={STAGES}
      accent={ACCENT}
      footer={
        <View style={styles.footer}>
          <PrimaryButton label="Play again" icon="refresh" onPress={dispatch.rematch} />
          <SecondaryButton
            label="Change setup"
            onPress={() => {
              clearSession();
              router.replace('/game/quiz/setup/review');
            }}
          />
          <SecondaryButton label="Home" icon="home" onPress={() => leaveQuiz(clearSession)} />
        </View>
      }
    >
      <Animated.ScrollView
        style={enter}
        contentContainerStyle={styles.result}
        showsVerticalScrollIndicator={false}
      >
        <MoonFace expression="quiz" size={96} />
        <Text style={[type.displayLg, styles.centerTitle]}>
          {compete
            ? winners.length > 1
              ? 'It’s a tie!'
              : `${winners[0]?.displayName ?? 'Winner'} wins!`
            : 'That’s the round!'}
        </Text>

        {compete ? (
          <View style={styles.leaderboard}>
            {leaderboard.map((player, index) => {
              const rank =
                leaderboard.findIndex((other) => other.score === player.score) + 1;
              const isWinner = player.score === topScore;
              return (
                <View
                  key={player.id}
                  style={[styles.scoreRow, isWinner && styles.winnerRow]}
                >
                  <View style={[styles.rank, isWinner && { backgroundColor: alpha(ACCENT, 0.18) }]}>
                    {rank === 1 ? (
                      <Icon name="trophy" size={19} color={ACCENT} />
                    ) : (
                      <Text style={[type.numeric, styles.rankText]}>{rank}</Text>
                    )}
                  </View>
                  <Text style={[type.bodyStrong, styles.playerName]}>{player.displayName}</Text>
                  <Text style={[type.numeric, { color: isWinner ? ACCENT : color.textPrimary }]}>
                    {player.score}
                  </Text>
                </View>
              );
            })}
          </View>
        ) : (
          <View style={styles.summaryRow}>
            <SummaryStat value={String(played)} label="questions" />
            <SummaryStat value={`${accuracy}%`} label="group accuracy" />
          </View>
        )}
      </Animated.ScrollView>
    </SessionShell>
  );
}

function SummaryStat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.summaryStat}>
      <Text style={[type.displayMd, { color: ACCENT }]}>{value}</Text>
      <Text style={[type.bodySm, styles.summaryLabel]}>{label}</Text>
    </View>
  );
}

export function QuizSessionView({ session }: { session: QuizSession }) {
  if (session.phase === 'ready') return <Ready session={session} />;
  if (session.phase === 'result') return <Result session={session} />;
  return <Question session={session} />;
}

const styles = StyleSheet.create({
  footer: {
    gap: space[2],
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space[4],
  },
  centerTitle: {
    color: color.textPrimary,
    textAlign: 'center',
  },
  centerBody: {
    color: color.textSecondary,
    textAlign: 'center',
    maxWidth: 340,
  },
  questionWrap: {
    flex: 1,
    minHeight: 0,
  },
  turn: {
    color: ACCENT,
    marginBottom: space[1],
  },
  meta: {
    color: color.textMuted,
    textTransform: 'capitalize',
    marginBottom: space[3],
  },
  questionText: {
    color: color.textPrimary,
    lineHeight: 30,
    marginBottom: space[4],
  },
  answers: {
    gap: space[3],
    paddingBottom: space[3],
  },
  answersScroll: {
    flex: 1,
    minHeight: 0,
  },
  answer: {
    minHeight: 64,
    borderRadius: radius.medium,
    borderWidth: 1,
    backgroundColor: alpha(color.surfaceRaised, 0.72),
    paddingHorizontal: space[4],
    paddingVertical: space[3],
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
  },
  letter: {
    width: 34,
    height: 34,
    borderRadius: radius.small,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  answerText: {
    color: color.textPrimary,
    flex: 1,
  },
  dimmed: {
    opacity: 0.48,
  },
  feedback: {
    borderRadius: radius.medium,
    backgroundColor: alpha(color.surfaceRaised, 0.65),
    padding: space[4],
    gap: space[2],
  },
  feedbackTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
  },
  explanation: {
    color: color.textSecondary,
    lineHeight: 21,
  },
  result: {
    alignItems: 'center',
    gap: space[4],
    paddingBottom: space[5],
  },
  leaderboard: {
    width: '100%',
    gap: space[2],
  },
  scoreRow: {
    minHeight: 58,
    borderRadius: radius.medium,
    borderWidth: 1,
    borderColor: color.borderSubtle,
    backgroundColor: alpha(color.surfaceRaised, 0.62),
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    paddingHorizontal: space[3],
  },
  winnerRow: {
    borderColor: alpha(ACCENT, 0.55),
    backgroundColor: alpha(ACCENT, 0.11),
  },
  rank: {
    width: 36,
    height: 36,
    borderRadius: radius.small,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    color: color.textMuted,
  },
  playerName: {
    color: color.textPrimary,
    flex: 1,
  },
  summaryRow: {
    width: '100%',
    flexDirection: 'row',
    gap: space[3],
  },
  summaryStat: {
    flex: 1,
    minHeight: 108,
    borderRadius: radius.medium,
    borderWidth: 1,
    borderColor: alpha(ACCENT, 0.28),
    backgroundColor: alpha(ACCENT, 0.09),
    alignItems: 'center',
    justifyContent: 'center',
    gap: space[1],
  },
  summaryLabel: {
    color: color.textMuted,
    textAlign: 'center',
  },
});
