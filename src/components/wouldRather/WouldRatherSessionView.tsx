import { router } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { currentDilemma } from '../../domain/wouldRather/machine';
import { useWouldRatherSession } from '../../domain/wouldRather/SessionContext';
import type { WouldRatherSession } from '../../domain/wouldRather/types';
import { alpha, color, radius, space } from '../../theme/tokens';
import { type } from '../../theme/typography';
import { PrimaryButton } from '../ui/PrimaryButton';
import { SecondaryButton } from '../ui/SecondaryButton';
import { SessionShell } from '../session/SessionShell';

const ACCENT = color.gameWouldRather;
const STAGES = ['choose', 'reveal', 'discuss', 'result'] as const;

function endGame(clear: () => void) { clear(); router.replace('/home'); }

function Choice({ session }: { session: WouldRatherSession }) {
  const { dispatch, clearSession } = useWouldRatherSession();
  const dilemma = currentDilemma(session);
  return <SessionShell eyebrow={`Dilemma ${session.index + 1}/${session.deck.length}`} title="Choose one" subtitle="Hear both choices before deciding." stage="choose" stages={STAGES} accent={ACCENT} onEndGame={() => endGame(clearSession)} footer={<View style={styles.footer}><PrimaryButton label="3 · 2 · 1 · Choose" onPress={dispatch.beginCountdown} /><SecondaryButton label="Skip dilemma" onPress={dispatch.skipDilemma} /></View>}>
    <View style={styles.choices}>
      <View style={[styles.choice, { borderColor: alpha(ACCENT, .45) }]}><Text style={[type.eyebrow, styles.optionLabel]}>LEFT · OPTION A</Text><Text style={[type.titleLg, styles.option]}>{dilemma?.option_a_en}</Text></View>
      <Text style={[type.numeric, styles.or]}>OR</Text>
      <View style={[styles.choice, { borderColor: alpha(color.brandPrimary, .45) }]}><Text style={[type.eyebrow, { color: color.brandPrimary }]}>RIGHT · OPTION B</Text><Text style={[type.titleLg, styles.option]}>{dilemma?.option_b_en}</Text></View>
    </View>
  </SessionShell>;
}

function Countdown({ session }: { session: WouldRatherSession }) {
  const { dispatch, clearSession } = useWouldRatherSession();
  useEffect(() => { const timer = setTimeout(dispatch.tickCountdown, 700); return () => clearTimeout(timer); }, [session.countdownValue, dispatch]);
  const label = session.countdownValue === 0 ? 'CHOOSE!' : session.countdownValue;
  return <SessionShell eyebrow="Reveal together" title="No neutral answers" stage="reveal" stages={STAGES} accent={ACCENT} onEndGame={() => endGame(clearSession)}><View style={styles.countdown}><Text style={[type.displayXl, styles.countdownText]}>{label}</Text><Text style={[type.body, styles.hint]}>Left for A · Right for B</Text></View></SessionShell>;
}

function Discuss({ session }: { session: WouldRatherSession }) {
  const { dispatch, clearSession } = useWouldRatherSession();
  const dilemma = currentDilemma(session);
  return <SessionShell eyebrow="Choices locked" title="Why?" subtitle="Make your case." stage="discuss" stages={STAGES} accent={ACCENT} onEndGame={() => endGame(clearSession)} footer={<PrimaryButton label={session.index + 1 >= session.deck.length ? 'Finish session' : 'Next dilemma'} icon="arrowRight" onPress={dispatch.nextDilemma} />}>
    <View style={styles.compactChoices}><Text style={[type.titleMd, styles.option]}>A · {dilemma?.option_a_en}</Text><View style={styles.divider}/><Text style={[type.titleMd, styles.option]}>B · {dilemma?.option_b_en}</Text></View>
  </SessionShell>;
}

function Result({ session }: { session: WouldRatherSession }) {
  const { dispatch, clearSession } = useWouldRatherSession();
  return <SessionShell eyebrow="Session complete" title={`${session.playedCount} dilemmas debated`} stage="result" stages={STAGES} accent={ACCENT} footer={<View style={styles.footer}><PrimaryButton label="Play again" icon="refresh" onPress={dispatch.rematch} /><SecondaryButton label="Change categories" onPress={() => { clearSession(); router.replace('/game/would_you_rather/setup/categories'); }} /><SecondaryButton label="Choose another game" onPress={() => endGame(clearSession)} /></View>}><View style={styles.result}><Text style={[type.displayXl, { color: ACCENT }]}>A / B</Text></View></SessionShell>;
}

export function WouldRatherSessionView({ session }: { session: WouldRatherSession }) {
  switch (session.phase) { case 'choice': return <Choice session={session}/>; case 'countdown': return <Countdown session={session}/>; case 'discuss': return <Discuss session={session}/>; case 'ended': return <Result session={session}/>; }
}

const styles = StyleSheet.create({ footer:{gap:space[3]}, choices:{flex:1,justifyContent:'center',gap:space[3]}, choice:{padding:space[6],borderWidth:1,borderRadius:radius.large,backgroundColor:alpha(color.surfaceRaised,.72),gap:space[3],minHeight:150,justifyContent:'center'}, optionLabel:{color:ACCENT}, option:{color:color.textPrimary}, or:{color:color.textMuted,textAlign:'center'}, countdown:{flex:1,alignItems:'center',justifyContent:'center',gap:space[4]}, countdownText:{color:ACCENT,fontSize:72}, hint:{color:color.textSecondary,textAlign:'center'}, compactChoices:{padding:space[6],borderRadius:radius.large,backgroundColor:alpha(color.surfaceRaised,.7),gap:space[5]}, divider:{height:1,backgroundColor:color.borderSubtle}, result:{flex:1,alignItems:'center',justifyContent:'center',gap:space[3]} });
