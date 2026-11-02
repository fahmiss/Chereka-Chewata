import { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, View } from 'react-native';
import { scoreGuess } from '../../domain/mizan/machine';
import { MIZAN_BANDS } from '../../domain/mizan/types';
import { useReducedMotion } from '../../theme/motion';
import { color, space } from '../../theme/tokens';
import { type } from '../../theme/typography';
import { MizanDial } from '../mizan/MizanDial';
import { PrimaryButton } from '../ui/PrimaryButton';
import { SecondaryButton } from '../ui/SecondaryButton';
import { Screen } from '../ui/Screen';
import { Surface } from '../ui/Surface';

export type ExampleGame = 'mizan' | 'mesob' | 'insider';

const MIZAN_TARGET = 75;

function mizanResultCopy(guess: number): string {
  const points = scoreGuess(MIZAN_TARGET, guess);
  if (points >= MIZAN_BANDS[0].points) {
    return `Your guess scores ${points} points — that’s the top score for a near-perfect hit.`;
  }
  if (points > 0) {
    return `Your guess scores ${points} points. Land closer to the secret spot for more.`;
  }
  return 'Your guess scores 0 points. Land closer to the secret spot to earn points.';
}

const MESOB = [
  ['Describe', 'A traditional pot used to brew coffee during buna.', 'Explain freely without saying the name. The team guesses “Jebena”.'],
  ['One word', 'Coffee', 'The SAME slips return. Give just one word, then let your team remember the name.'],
  ['Act', 'Mime pouring coffee from a pot.', 'The SAME slips return again. No talking or sounds — let the gesture do the work.'],
];
const INSIDER = [
  ['Deal roles', 'The Master and the secret Insider both know “Jebena”.', 'Everyone else tries to discover the word. Only the Master is publicly known.'],
  ['Find the word', '“Is it an object?” Yes. “Used for coffee?” Yes.', 'Ask the Master yes/no questions against the clock. The Insider can help steer the questions without revealing that they know.'],
  ['Find the Insider', 'The group says “Jebena”! Now discuss who already knew.', 'Who guided the questions suspiciously well? Vote after the word is found. The Master cannot be the Insider.'],
];

export function GameExample({ game, accent, onComplete, onDismiss, startAfter }: { game: ExampleGame; accent: string; onComplete: () => void; onDismiss: () => void; startAfter: boolean }) {
  const [step, setStep] = useState(0);
  const [guess, setGuess] = useState(50);
  const reduced = useReducedMotion();
  const content = game === 'mesob' ? MESOB[step]! : INSIDER[step]!;
  const next = () => step < 2 ? setStep(step + 1) : onComplete();
  return (
    <Modal visible animationType={reduced ? 'none' : 'fade'} onRequestClose={onDismiss}>
      <Screen accent={accent}>
        <ScrollView contentContainerStyle={styles.body}>
          <Text style={[type.eyebrow, { color: accent }]}>Practice only · {step + 1}/3</Text>
          <Text style={[type.displayMd, styles.primary]}>{game === 'mizan' ? ['One clue, one target', 'Now you guess', 'See how close you got'][step] : content[0]}</Text>
          {game === 'mizan' ? <>
            <Text style={[type.body, styles.secondary]}>{step === 0 ? 'Only the psychic sees the target near Spicy. They give the clue “Mitmita”.' : step === 1 ? 'The target is hidden. Drag the needle to where “Mitmita” belongs on this scale.' : mizanResultCopy(guess)}</Text>
            <MizanDial accent={accent} target={step === 1 ? undefined : MIZAN_TARGET} needle={step === 0 ? undefined : guess} onChange={step === 1 ? (value) => setGuess(Math.round(value)) : undefined} />
            <View style={styles.ends}><Text style={[type.bodyStrong, styles.primary]}>Mild</Text><Text style={[type.bodyStrong, styles.primary]}>Spicy</Text></View>
            {step === 1 ? <View style={styles.ends}><SecondaryButton label="−5" onPress={() => setGuess(Math.max(0, guess - 5))} /><SecondaryButton label="+5" onPress={() => setGuess(Math.min(100, guess + 5))} /></View> : null}
            {step === 2 ? <Text style={[type.body, styles.secondary]}>The colored bands are the score. Land in the center band for 4 points, the next band for 3, then 2. Outside the bands scores 0. In Teams, opponents also call left or right for a possible bonus point.</Text> : null}
          </> : <Surface active accent={accent} contentStyle={styles.card}>
            <Text style={[type.eyebrow, { color: accent }]}>{game === 'mesob' ? 'Same slip: Jebena' : 'Example round'}</Text>
            <Text style={[type.titleMd, styles.primary]}>{content[1]}</Text>
            <Text style={[type.body, styles.secondary]}>{content[2]}</Text>
          </Surface>}
          <Text style={[type.bodySm, styles.secondary]}>This example does not use cards, assign roles, or change anyone’s score.</Text>
        </ScrollView>
        <View style={styles.footer}>
          <PrimaryButton label={step === 2 ? startAfter ? 'Got it — start game' : 'Back to setup' : game === 'mizan' && step === 1 ? 'Lock my guess' : 'Next'} onPress={next} />
          <SecondaryButton label={startAfter ? 'Skip example and start' : 'Close example'} quiet onPress={onComplete} />
        </View>
      </Screen>
    </Modal>
  );
}

const styles = StyleSheet.create({ body: { flexGrow: 1, padding: space[5], gap: space[5], justifyContent: 'center' }, primary: { color: color.textPrimary }, secondary: { color: color.textSecondary }, card: { padding: space[5], gap: space[4] }, ends: { flexDirection: 'row', justifyContent: 'space-between', gap: space[4] }, footer: { padding: space[4], gap: space[2] } });
