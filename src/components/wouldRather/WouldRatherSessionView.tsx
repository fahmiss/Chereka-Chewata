import { router } from 'expo-router';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { localizeText } from '../../content/localize';
import { currentDilemma } from '../../domain/wouldRather/machine';
import { useWouldRatherSession } from '../../domain/wouldRather/SessionContext';
import type { WouldRatherSession, WouldRatherSide } from '../../domain/wouldRather/types';
import { useEnterAnimation } from '../../theme/motion';
import { alpha, color, glow, radius, space } from '../../theme/tokens';
import { family, type } from '../../theme/typography';
import { ReportCardButton } from '../session/ReportCardButton';
import { SessionShell } from '../session/SessionShell';
import { MoonFace } from '../brand/MoonFace';
import { Icon } from '../ui/Icon';
import { PressableScale } from '../ui/PressableScale';
import { PrimaryButton } from '../ui/PrimaryButton';
import { SecondaryButton } from '../ui/SecondaryButton';

const ACCENT = color.gameWouldRather;
const OPTION_B = color.brandPrimary;
const STAGES = ['choose', 'discuss', 'result'] as const;

function endGame(clear: () => void) {
  router.replace('/home');
  clear();
}

/**
 * One card, two states: read → agreed.
 *
 * The room argues out loud and someone taps the option they landed on — there
 * is no per-player input, so no pass-the-phone and no countdown ceremony. The
 * card never moves between states; only the verdict styling changes.
 */
function DilemmaCard({ session }: { session: WouldRatherSession }) {
  const { dispatch, clearSession } = useWouldRatherSession();
  const dilemma = currentDilemma(session);
  const chosen = session.chosen;
  const last = session.index + 1 >= session.deck.length;
  const enter = useEnterAnimation(1, 16);

  return (
    <SessionShell
      eyebrow={`Dilemma ${session.index + 1}/${session.deck.length}`}
      stage={chosen ? 'discuss' : 'choose'}
      stages={STAGES}
      accent={ACCENT}
      onEndGame={() => endGame(clearSession)}
      // Same slots in both states so the card above never shifts once tapped.
      footer={
        <View style={styles.footer}>
          <PrimaryButton
            label={chosen ? (last ? 'Finish session' : 'Next dilemma') : 'Tap a choice above'}
            icon={chosen ? 'chevronRight' : undefined}
            disabled={!chosen}
            onPress={dispatch.nextDilemma}
          />
          <SecondaryButton label="Skip dilemma" onPress={dispatch.skipDilemma} />
          {dilemma ? (
            <ReportCardButton
              game="would_you_rather"
              cardId={dilemma.id}
              onReported={dispatch.skipDilemma}
            />
          ) : null}
        </View>
      }
    >
      <Animated.View style={[styles.body, enter]}>
        <Option
          side="a"
          label="OPTION A"
          text={
            dilemma
              ? localizeText(session.contentLanguage, {
                  en: dilemma.option_a_en,
                  am: dilemma.option_a_am,
                })
              : undefined
          }
          ethiopic={session.contentLanguage !== 'en'}
          tint={ACCENT}
          chosen={chosen}
          onPress={() => dispatch.chooseSide('a')}
        />
        <Text style={[type.numeric, styles.or]}>OR</Text>
        <Option
          side="b"
          label="OPTION B"
          text={
            dilemma
              ? localizeText(session.contentLanguage, {
                  en: dilemma.option_b_en,
                  am: dilemma.option_b_am,
                })
              : undefined
          }
          ethiopic={session.contentLanguage !== 'en'}
          tint={OPTION_B}
          chosen={chosen}
          onPress={() => dispatch.chooseSide('b')}
        />
        <Text style={[type.bodySm, styles.hint]}>
          {chosen
            ? 'Tap the other one if the room changes its mind.'
            : 'Argue it out, then tap the one you agreed on.'}
        </Text>
      </Animated.View>
    </SessionShell>
  );
}

function Option({
  side,
  label,
  text,
  ethiopic,
  tint,
  chosen,
  onPress,
}: {
  side: WouldRatherSide;
  label: string;
  text?: string;
  ethiopic?: boolean;
  tint: string;
  chosen: WouldRatherSide | null;
  onPress: () => void;
}) {
  const isChosen = chosen === side;
  const isRejected = chosen !== null && !isChosen;

  return (
    <PressableScale
      accessibilityRole="radio"
      accessibilityState={{ selected: isChosen }}
      accessibilityLabel={`${label}. ${text ?? ''}`}
      onPress={onPress}
      haptic="medium"
      scaleTo={0.98}
      style={[
        styles.option,
        { borderColor: alpha(tint, isChosen ? 0.85 : 0.45) },
        isChosen && { backgroundColor: alpha(tint, 0.14) },
        isChosen ? glow(tint, 0.35, 20) : null,
        isRejected && styles.rejected,
      ]}
    >
      <View style={styles.optionHead}>
        <Text style={[type.eyebrow, { color: tint }]}>{label}</Text>
        {isChosen ? (
          <View style={[styles.tick, { backgroundColor: tint }]}>
            <Icon name="check" size={14} color={color.void} strokeWidth={3.2} />
          </View>
        ) : null}
      </View>
      <Text
        style={[
          type.titleLg,
          styles.optionText,
          ethiopic ? { fontFamily: family.ethiopic.bold } : null,
        ]}
      >
        {text}
      </Text>
    </PressableScale>
  );
}

function Result({ session }: { session: WouldRatherSession }) {
  const { dispatch, clearSession } = useWouldRatherSession();
  const enter = useEnterAnimation(1, 16);

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
              router.replace('/game/would_you_rather/setup/review');
            }}
          />
          <SecondaryButton
            label="Choose another game"
            onPress={() => endGame(clearSession)}
          />
        </View>
      }
    >
      <Animated.View style={[styles.ended, enter]}>
        <MoonFace expression="delighted" size={96} />
        <Text style={[type.displayLg, styles.endedTitle]}>That’s a wrap</Text>
        <Text style={[type.body, styles.hint]}>
          You settled {session.playedCount} dilemma
          {session.playedCount === 1 ? '' : 's'}. Nobody got to stay neutral.
        </Text>
      </Animated.View>
    </SessionShell>
  );
}

export function WouldRatherSessionView({ session }: { session: WouldRatherSession }) {
  if (session.phase === 'ended') return <Result session={session} />;
  return <DilemmaCard session={session} />;
}

const styles = StyleSheet.create({
  footer: {
    gap: space[3],
  },
  body: {
    flex: 1,
    justifyContent: 'center',
    gap: space[3],
  },
  option: {
    padding: space[6],
    borderWidth: 1,
    borderRadius: radius.large,
    backgroundColor: alpha(color.surfaceRaised, 0.72),
    gap: space[3],
    minHeight: 150,
    justifyContent: 'center',
  },
  optionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space[2],
    // Reserve the tick's height so the body text below doesn't shift the
    // moment a choice is tapped — the row is 24pt tall with or without it.
    minHeight: 24,
  },
  optionText: {
    color: color.textPrimary,
  },
  tick: {
    width: 24,
    height: 24,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejected: {
    opacity: 0.45,
  },
  or: {
    color: color.textMuted,
    textAlign: 'center',
  },
  hint: {
    color: color.textSecondary,
    textAlign: 'center',
  },
  ended: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space[4],
  },
  endedBadge: {
    width: 72,
    height: 72,
    borderRadius: radius.large,
    borderWidth: 1,
    borderColor: alpha(ACCENT, 0.4),
    backgroundColor: alpha(ACCENT, 0.14),
    alignItems: 'center',
    justifyContent: 'center',
  },
  endedTitle: {
    color: color.textPrimary,
  },
});
