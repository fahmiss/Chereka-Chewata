import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { BombSessionView } from '../../src/components/bomb/BombSessionView';
import { ImpostorSessionView } from '../../src/components/impostor/ImpostorSessionView';
import { LiarSessionView } from '../../src/components/liar/LiarSessionView';
import { MostLikelySessionView } from '../../src/components/mostLikely/MostLikelySessionView';
import { TabooSessionView } from '../../src/components/taboo/TabooSessionView';
import { WouldRatherSessionView } from '../../src/components/wouldRather/WouldRatherSessionView';
import { QuizSessionView } from '../../src/components/quiz/QuizSessionView';
import { Icon } from '../../src/components/ui/Icon';
import { PrimaryButton } from '../../src/components/ui/PrimaryButton';
import { Screen } from '../../src/components/ui/Screen';
import { useBombSession } from '../../src/domain/bomb/SessionContext';
import { useSession } from '../../src/domain/impostor/SessionContext';
import { useLiarSession } from '../../src/domain/liar/SessionContext';
import { useMostLikelySession } from '../../src/domain/mostLikely/SessionContext';
import { useTabooSession } from '../../src/domain/taboo/SessionContext';
import { useWouldRatherSession } from '../../src/domain/wouldRather/SessionContext';
import { useQuizSession } from '../../src/domain/quiz/SessionContext';
import { useT } from '../../src/i18n';
import { alpha, color, radius, space } from '../../src/theme/tokens';
import { type } from '../../src/theme/typography';

export default function SessionScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const impostor = useSession();
  const liar = useLiarSession();
  const taboo = useTabooSession();
  const mostLikely = useMostLikelySession();
  const wouldRather = useWouldRatherSession();
  const bomb = useBombSession();
  const quiz = useQuizSession();
  const { t, uiFont } = useT();
  const font = uiFont ? { fontFamily: uiFont } : null;

  if (impostor.session && impostor.session.sessionId === sessionId) {
    return <ImpostorSessionView session={impostor.session} />;
  }

  if (liar.session && liar.session.sessionId === sessionId) {
    return <LiarSessionView session={liar.session} />;
  }

  if (taboo.session && taboo.session.sessionId === sessionId) {
    return <TabooSessionView session={taboo.session} />;
  }

  if (mostLikely.session && mostLikely.session.sessionId === sessionId) {
    return <MostLikelySessionView session={mostLikely.session} />;
  }
  if (wouldRather.session && wouldRather.session.sessionId === sessionId) return <WouldRatherSessionView session={wouldRather.session} />;
  if (bomb.session && bomb.session.sessionId === sessionId) {
    return <BombSessionView session={bomb.session} />;
  }
  if (quiz.session && quiz.session.sessionId === sessionId) {
    return <QuizSessionView session={quiz.session} />;
  }

  return (
    <Screen accent={color.brandPrimary} style={styles.fallback}>
      <View style={styles.badge}>
        <Icon name="lock" size={26} color={color.brandPrimary} strokeWidth={1.8} />
      </View>
      <Text style={[type.displayMd, styles.title, font]}>{t('session.unavailableTitle')}</Text>
      <Text style={[type.body, styles.body, font]}>{t('session.unavailableBody')}</Text>
      <PrimaryButton
        label={t('game.backHome')}
        icon="home"
        onPress={() => {
          impostor.clearSession();
          liar.clearSession();
          taboo.clearSession();
          mostLikely.clearSession();
          wouldRather.clearSession();
          bomb.clearSession();
          quiz.clearSession();
          router.replace('/home');
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  fallback: {
    paddingHorizontal: space[6],
    justifyContent: 'center',
    gap: space[4],
  },
  badge: {
    width: 64,
    height: 64,
    borderRadius: radius.medium,
    borderWidth: 1,
    borderColor: alpha(color.brandPrimary, 0.35),
    backgroundColor: alpha(color.brandPrimary, 0.14),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space[2],
  },
  title: {
    color: color.textPrimary,
  },
  body: {
    color: color.textSecondary,
    marginBottom: space[2],
  },
});
