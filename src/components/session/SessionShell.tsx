import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { Animated, BackHandler, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useT } from '../../i18n';
import { useEnterAnimation } from '../../theme/motion';
import { color, overlay, radius, space } from '../../theme/tokens';
import { type } from '../../theme/typography';
import { Dialog } from '../ui/Dialog';
import { Icon } from '../ui/Icon';
import { PressableScale } from '../ui/PressableScale';
import { ProgressRail } from '../ui/ProgressRail';
import { Screen } from '../ui/Screen';
import { useSessionControls } from './SessionControlsContext';
import { SessionMenu } from './SessionMenu';

/** Default rail for Impostor / Who’s the Liar. */
export const DEDUCTION_STAGES = ['reveal', 'clues', 'discuss', 'vote', 'result'] as const;
export const TABOO_STAGES = ['ready', 'play', 'summary', 'result'] as const;

type Props = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  /** Keep turn details quiet when the card, dial or player list is the focus. */
  headingStyle?: 'display' | 'context';
  /** Short action guidance stays beside the fixed controls. */
  instruction?: string;
  /** Use for public content; private reveal containers manage their own scroll. */
  scrollable?: boolean;
  centerContent?: boolean;
  /** Active stage id — must appear in `stages`. */
  stage?: string;
  /** Ordered stage ids for the progress rail. */
  stages?: readonly string[];
  accent?: string;
  endTitle?: string;
  endMessage?: string;
  endConfirmLabel?: string;
  endCancelLabel?: string;
  /** Called once the player confirms in the in-app dialog — not on tap. */
  onEndGame?: () => void;
  children: ReactNode;
  footer?: ReactNode;
};

/**
 * Frame shared by every session phase. Stages are configurable so deduction
 * games and Taboo can share chrome without sharing a fake phase map.
 */
export function SessionShell({
  eyebrow,
  title,
  subtitle,
  headingStyle = 'display',
  instruction,
  scrollable = false,
  centerContent = false,
  stage,
  stages = DEDUCTION_STAGES,
  accent = color.gameImpostor,
  endTitle,
  endMessage,
  endConfirmLabel,
  endCancelLabel,
  onEndGame,
  children,
  footer,
}: Props) {
  const { t, uiFont, uiFontBold } = useT();
  const enter = useEnterAnimation(0, 12);
  const font = uiFont ? { fontFamily: uiFont } : null;
  const fontBold = uiFontBold ? { fontFamily: uiFontBold } : null;
  const stageIndex = stage ? stages.indexOf(stage) : -1;
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [rulesVisible, setRulesVisible] = useState(false);
  const [restartVisible, setRestartVisible] = useState(false);
  const sessionControls = useSessionControls();
  const resolvedEndTitle = endTitle ?? t('session.endTitle');
  const resolvedEndMessage = endMessage ?? t('session.endMessage');
  const resolvedEndConfirm = endConfirmLabel ?? t('session.endConfirm');
  const resolvedEndCancel = endCancelLabel ?? t('session.keepPlaying');
  const guardsBack = !!onEndGame;

  useEffect(() => {
    if (!guardsBack) return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      setConfirmVisible(true);
      return true;
    });
    return () => subscription.remove();
  }, [guardsBack]);

  return (
    <Screen accent={accent}>
      <View style={styles.inner}>
        <View style={styles.header}>
          {eyebrow ? (
            <View
              style={styles.eyebrowPill}
            >
              <Text style={[type.eyebrow, { color: accent }, font]}>{eyebrow}</Text>
            </View>
          ) : (
            <View />
          )}
          {onEndGame ? (
            <PressableScale
              accessibilityRole="button"
              accessibilityLabel="Open game menu"
              onPress={() => setMenuVisible(true)}
              haptic="selection"
              scaleTo={0.94}
              style={styles.menuButton}
            >
              <Icon name="sliders" size={16} color={color.textSecondary} strokeWidth={2.2} />
              <Text style={[type.label, styles.menuLabel]}>Menu</Text>
            </PressableScale>
          ) : null}
        </View>

        {stageIndex >= 0 ? (
          <View style={styles.rail}>
            <ProgressRail activeIndex={stageIndex} count={stages.length} accent={accent} />
          </View>
        ) : null}

        {title ? (
          <Animated.View style={[styles.heading, headingStyle === 'context' && styles.contextHeading, enter]}>
            <Text
              style={[
                headingStyle === 'context' ? type.titleLg : type.displayLg,
                styles.title,
                fontBold,
              ]}
            >
              {title}
            </Text>
            {subtitle ? (
              <Text
                style={[
                  headingStyle === 'context' ? type.bodySm : type.body,
                  styles.subtitle,
                  font,
                ]}
              >
                {subtitle}
              </Text>
            ) : null}
          </Animated.View>
        ) : null}

        <View style={styles.body}>
          {scrollable ? (
            <ScrollView
              style={styles.scroll}
              contentContainerStyle={[styles.scrollContent, centerContent && styles.centeredContent]}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {children}
            </ScrollView>
          ) : children}
        </View>

        {footer || instruction ? <View style={styles.footer}>
          {instruction ? (
            <View style={styles.instruction}>
              <Text style={[type.bodySm, styles.instructionText, font]}>{instruction}</Text>
            </View>
          ) : null}
          {footer}
        </View> : null}
      </View>

      {onEndGame ? (
        <>
          {menuVisible ? (
            <SessionMenu
              visible
              accent={accent}
              canRestart={!!sessionControls}
              onClose={() => setMenuVisible(false)}
              onShowRules={() => {
                setMenuVisible(false);
                setRulesVisible(true);
              }}
              onRestart={() => {
                setMenuVisible(false);
                setRestartVisible(true);
              }}
              onEnd={() => {
                setMenuVisible(false);
                setConfirmVisible(true);
              }}
            />
          ) : null}
          <Dialog
            visible={rulesVisible}
            icon="book"
            accent={accent}
            title="How to play"
            message={sessionControls?.rules.map((rule, index) => `${index + 1}. ${rule}`).join('\n\n')}
            confirmLabel="Back to game"
            confirmTone="honey"
            onConfirm={() => setRulesVisible(false)}
          />
          <Dialog
            visible={restartVisible}
            icon="refresh"
            accent={color.dangerUrgency}
            title="Restart entire game?"
            message="All scores and round progress will reset. Players and setup choices stay the same. New cards, roles, or teams may be drawn."
            confirmLabel="Restart entire game"
            confirmTone="danger"
            onConfirm={() => {
              setRestartVisible(false);
              sessionControls?.onRestartRound();
            }}
            cancelLabel="Keep playing"
            onCancel={() => setRestartVisible(false)}
          />
          <Dialog
            visible={confirmVisible}
            icon="alert"
            accent={color.dangerUrgency}
            title={resolvedEndTitle}
            message={resolvedEndMessage}
            confirmLabel={resolvedEndConfirm}
            confirmTone="danger"
            onConfirm={() => {
              setConfirmVisible(false);
              onEndGame();
            }}
            cancelLabel={resolvedEndCancel}
            onCancel={() => setConfirmVisible(false)}
          />
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  inner: {
    flex: 1,
    paddingHorizontal: space[6],
  },
  header: {
    marginTop: space[2],
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  eyebrowPill: {
    paddingVertical: 6,
    flex: 1,
    paddingRight: space[3],
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: radius.pill,
    backgroundColor: overlay.glass,
    borderWidth: 1,
    borderColor: color.borderSubtle,
  },
  menuLabel: {
    color: color.textSecondary,
  },
  rail: {
    marginTop: space[4],
  },
  heading: {
    marginTop: space[5],
    gap: space[2],
  },
  contextHeading: {
    marginTop: space[4],
    gap: space[1],
  },
  title: {
    color: color.textPrimary,
  },
  subtitle: {
    color: color.textSecondary,
  },
  body: {
    flex: 1,
    minHeight: 0,
    paddingTop: space[5],
  },
  scroll: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: space[2] },
  centeredContent: { justifyContent: 'center' },
  instruction: { minHeight: 40, justifyContent: 'center' },
  instructionText: { color: color.textSecondary, textAlign: 'center' },
  footer: {
    gap: space[3],
    paddingBottom: space[3],
    paddingTop: space[3],
  },
});
