import { router, type Href } from 'expo-router';
import { useEffect, useState, type ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GameExample, type ExampleGame } from './GameExample';
import { SecondaryButton } from '../ui/SecondaryButton';
import { StyleSheet, Text, View } from 'react-native';
import { alpha, color, radius, space } from '../../theme/tokens';
import { type } from '../../theme/typography';
import { Dialog } from '../ui/Dialog';
import { Icon, type IconName } from '../ui/Icon';
import { PressableScale } from '../ui/PressableScale';
import { SetupScreen } from '../ui/SetupScreen';
import { Surface } from '../ui/Surface';

export type QuickLink = {
  icon: IconName;
  title: string;
  /** The current answer, in the group's words. */
  value: string;
  detail: string;
  href: Href;
};

type Props = {
  accent: string;
  /** Game name — this screen is the game's front door, not a step in a journey. */
  title: string;
  subtitle?: string;
  links: QuickLink[];
  /** Inline controls a table actually changes between rounds. */
  controls?: ReactNode;
  /** Advanced settings that stay one tap away. */
  more?: QuickLink;
  canStart: boolean;
  footerNote?: string;
  onStart: () => void;
  startError: string | null;
  onClearError: () => void;
  example?: ExampleGame;
};

/**
 * One ready-to-play overview per game, replacing the mandatory
 * players → categories → content → options → review journey.
 *
 * Defaults are already playable, so the only required action is Start game.
 * Everything else is a drill-down that returns here.
 */
export function QuickSetup({
  accent,
  title,
  subtitle = 'Ready to play. Change only what your group needs.',
  links,
  controls,
  more,
  canStart,
  footerNote,
  onStart,
  startError,
  onClearError,
  example,
}: Props) {
  const [seenExample, setSeenExample] = useState(false);
  const [exampleOpen, setExampleOpen] = useState(false);
  const [startAfterExample, setStartAfterExample] = useState(false);
  useEffect(() => {
    let active = true;
    if (example) void AsyncStorage.getItem(`chereka.example.${example}.v1`).then((value) => { if (active) setSeenExample(value === 'seen'); }).catch(() => undefined);
    return () => { active = false; };
  }, [example]);
  const start = () => {
    if (example && !seenExample) { setStartAfterExample(true); setExampleOpen(true); }
    else onStart();
  };
  return (
    <SetupScreen
      stepLabel="Quick setup"
      title={title}
      brushTitle
      subtitle={subtitle}
      accent={accent}
      primaryLabel="Start game"
      primaryDisabled={!canStart}
      footerNote={footerNote}
      onPrimary={start}
    >
      <Surface contentStyle={styles.links}>
        {links.map((link, index) => (
          <View key={link.title}>
            {index > 0 ? <QuickDivider /> : null}
            <QuickLinkRow link={link} accent={accent} />
          </View>
        ))}
      </Surface>

      {controls}
      {example ? <SecondaryButton label="See a practice example" icon="book" onPress={() => { setStartAfterExample(false); setExampleOpen(true); }} /> : null}
      {example && exampleOpen ? <GameExample game={example} accent={accent} startAfter={startAfterExample} onDismiss={() => setExampleOpen(false)} onComplete={() => {
        setExampleOpen(false);
        setSeenExample(true);
        void AsyncStorage.setItem(`chereka.example.${example}.v1`, 'seen').catch(() => undefined);
        if (startAfterExample) onStart();
      }} /> : null}

      {more ? (
        <Surface contentStyle={styles.links}>
          <QuickLinkRow link={more} accent={accent} />
        </Surface>
      ) : null}

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

function QuickLinkRow({ link, accent }: { link: QuickLink; accent: string }) {
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={`${link.title}. ${link.value}. ${link.detail}`}
      onPress={() => router.push(link.href)}
      haptic="selection"
      scaleTo={0.985}
      style={styles.link}
    >
      <View style={[styles.linkIcon, { backgroundColor: alpha(accent, 0.12) }]}>
        <Icon name={link.icon} size={20} color={accent} />
      </View>
      <View style={styles.linkCopy}>
        <Text style={[type.bodyStrong, styles.linkTitle]}>{link.title}</Text>
        <Text style={[type.body, styles.linkValue]} numberOfLines={1}>
          {link.value}
        </Text>
        <Text style={[type.bodySm, styles.linkDetail]} numberOfLines={1}>
          {link.detail}
        </Text>
      </View>
      <Icon name="chevronRight" size={20} color={color.textMuted} />
    </PressableScale>
  );
}

/** Card wrapping the inline controls for a game. */
export function QuickControls({ children }: { children: ReactNode }) {
  return <Surface contentStyle={styles.controls}>{children}</Surface>;
}

/** A labelled control (heading + hint) sitting above its input. */
export function QuickControlBlock({
  icon,
  title,
  hint,
  accent,
  children,
}: {
  icon: IconName;
  title: string;
  hint?: string;
  accent: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.block}>
      <View style={styles.blockHeading}>
        <Icon name={icon} size={20} color={accent} />
        <View style={styles.blockCopy}>
          <Text style={[type.bodyStrong, styles.linkTitle]}>{title}</Text>
          {hint ? <Text style={[type.bodySm, styles.linkDetail]}>{hint}</Text> : null}
        </View>
      </View>
      {children}
    </View>
  );
}

export function QuickDivider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  links: {
    paddingVertical: space[1],
  },
  link: {
    minHeight: 76,
    paddingHorizontal: space[4],
    paddingVertical: space[3],
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
  },
  linkIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.small,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkCopy: {
    flex: 1,
    gap: 1,
  },
  linkTitle: {
    color: color.textPrimary,
  },
  linkValue: {
    color: color.textPrimary,
  },
  linkDetail: {
    color: color.textMuted,
  },
  divider: {
    height: 1,
    marginHorizontal: space[4],
    backgroundColor: color.borderSubtle,
  },
  controls: {
    padding: space[4],
    gap: space[4],
  },
  block: {
    gap: space[3],
  },
  blockHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
  },
  blockCopy: {
    flex: 1,
    gap: 2,
  },
});
