import { BricolageGrotesque_500Medium } from '@expo-google-fonts/bricolage-grotesque/500Medium';
import { BricolageGrotesque_600SemiBold } from '@expo-google-fonts/bricolage-grotesque/600SemiBold';
import { BricolageGrotesque_700Bold } from '@expo-google-fonts/bricolage-grotesque/700Bold';
import { Knewave_400Regular } from '@expo-google-fonts/knewave/400Regular';
import { NotoSansEthiopic_400Regular } from '@expo-google-fonts/noto-sans-ethiopic/400Regular';
import { NotoSansEthiopic_500Medium } from '@expo-google-fonts/noto-sans-ethiopic/500Medium';
import { NotoSansEthiopic_700Bold } from '@expo-google-fonts/noto-sans-ethiopic/700Bold';
import { Outfit_600SemiBold } from '@expo-google-fonts/outfit/600SemiBold';
import { Outfit_700Bold } from '@expo-google-fonts/outfit/700Bold';
import { Outfit_800ExtraBold } from '@expo-google-fonts/outfit/800ExtraBold';
import { Outfit_900Black } from '@expo-google-fonts/outfit/900Black';
import { PlusJakartaSans_400Regular } from '@expo-google-fonts/plus-jakarta-sans/400Regular';
import { PlusJakartaSans_600SemiBold } from '@expo-google-fonts/plus-jakarta-sans/600SemiBold';
import { SpaceMono_400Regular } from '@expo-google-fonts/space-mono/400Regular';
import { SpaceMono_700Bold } from '@expo-google-fonts/space-mono/700Bold';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BombSessionProvider } from '../src/domain/bomb/SessionContext';
import { featureFlags } from '../src/config/features';
import { BombSetupProvider } from '../src/domain/bomb/SetupContext';
import { AnimatedSplash } from '../src/components/brand/AnimatedSplash';
import { SessionProvider } from '../src/domain/impostor/SessionContext';
import { SetupProvider } from '../src/domain/impostor/SetupContext';
import { LiarSessionProvider } from '../src/domain/liar/SessionContext';
import { LiarSetupProvider } from '../src/domain/liar/SetupContext';
import { SettingsProvider } from '../src/domain/settings/SettingsContext';
import { MostLikelySessionProvider } from '../src/domain/mostLikely/SessionContext';
import { MostLikelySetupProvider } from '../src/domain/mostLikely/SetupContext';
import { TabooSessionProvider } from '../src/domain/taboo/SessionContext';
import { TabooSetupProvider } from '../src/domain/taboo/SetupContext';
import { WouldRatherSessionProvider } from '../src/domain/wouldRather/SessionContext';
import { WouldRatherSetupProvider } from '../src/domain/wouldRather/SetupContext';
import { QuizSessionProvider } from '../src/domain/quiz/SessionContext';
import { QuizSetupProvider } from '../src/domain/quiz/SetupContext';
import { ExtraGameProviders } from '../src/domain/extraGameProviders';
import { color } from '../src/theme/tokens';
import { hydrateContentHistory } from '../src/storage/contentHistory';

const APP_FONTS = {
  Outfit_600SemiBold,
  Outfit_700Bold,
  Outfit_800ExtraBold,
  Outfit_900Black,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_600SemiBold,
  SpaceMono_400Regular,
  SpaceMono_700Bold,
  Knewave_400Regular,
  BricolageGrotesque_500Medium,
  BricolageGrotesque_600SemiBold,
  BricolageGrotesque_700Bold,
  // The Ethiopic wordmark remains part of the brand even in English-only mode.
  NotoSansEthiopic_500Medium,
  ...(featureFlags.amharicInterface || featureFlags.amharicContent
    ? {
        NotoSansEthiopic_400Regular,
        NotoSansEthiopic_700Bold,
      }
    : {}),
};

SystemUI.setBackgroundColorAsync(color.background);
void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // Brand type roles (tokens.font) — held behind the splash so no screen ever
  // renders in the system fallback face first.
  const [fontsLoaded, fontError] = useFonts(APP_FONTS);
  const [contentReady, setContentReady] = useState(false);

  const ready = (fontsLoaded || !!fontError) && contentReady;

  useEffect(() => {
    let active = true;
    void hydrateContentHistory().finally(() => {
      if (active) setContentReady(true);
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    // Hide the native launch screen the instant JS takes over — it can only
    // ever be a static frame, so AnimatedSplash below owns the real reveal
    // and bridges the remaining load time with motion instead of a blank gap.
    void SplashScreen.hideAsync();
  }, []);

  return (
    <GestureHandlerRootView style={styles.root}>
      {ready ? (
      <SettingsProvider>
        <SetupProvider>
          <LiarSetupProvider>
            <TabooSetupProvider>
              <MostLikelySetupProvider>
                <WouldRatherSetupProvider>
                  <BombSetupProvider>
                    <QuizSetupProvider>
                    <SessionProvider>
                      <LiarSessionProvider>
                        <TabooSessionProvider>
                          <MostLikelySessionProvider>
                            <WouldRatherSessionProvider>
                              <BombSessionProvider>
                              <QuizSessionProvider>
                              <ExtraGameProviders>
                                <StatusBar style="light" />
                                <Stack
                                  screenOptions={{
                                    headerShown: false,
                                    contentStyle: { backgroundColor: color.background },
                                    animation: 'slide_from_right',
                                  }}
                                >
                                  <Stack.Screen name="index" options={{ animation: 'fade' }} />
                                  <Stack.Screen name="language" options={{ animation: 'fade' }} />
                                  <Stack.Screen
                                    name="session/[sessionId]"
                                    options={{ animation: 'fade', gestureEnabled: false }}
                                  />
                                </Stack>
                              </ExtraGameProviders>
                              </QuizSessionProvider>
                              </BombSessionProvider>
                            </WouldRatherSessionProvider>
                          </MostLikelySessionProvider>
                        </TabooSessionProvider>
                      </LiarSessionProvider>
                    </SessionProvider>
                    </QuizSetupProvider>
                  </BombSetupProvider>
                </WouldRatherSetupProvider>
              </MostLikelySetupProvider>
            </TabooSetupProvider>
          </LiarSetupProvider>
        </SetupProvider>
      </SettingsProvider>
      ) : null}
      <AnimatedSplash ready={ready} />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.background },
});
