import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { featureFlags } from '../src/config/features';
import { useSettings } from '../src/domain/settings/SettingsContext';
import { hasCompletedLanguageGate } from '../src/storage/onboarding';
import { color } from '../src/theme/tokens';
import { BRAND_MARK } from '../src/components/brand/gameArt';

/**
 * Splash lands here. First launch → language gate. Returning users → Home.
 */
export default function Index() {
  const { ready } = useSettings();
  const [gateDone, setGateDone] = useState<boolean | null>(null);

  useEffect(() => {
    if (!featureFlags.languageSelection) {
      setGateDone(true);
      return;
    }

    let alive = true;
    void hasCompletedLanguageGate().then((done) => {
      if (alive) setGateDone(done);
    });
    return () => {
      alive = false;
    };
  }, []);

  if (!ready || (featureFlags.languageSelection && gateDone === null)) {
    return (
      <View style={styles.boot}>
        <Image source={BRAND_MARK.source} style={{ width: 96, height: 96 }} resizeMode="contain" />
      </View>
    );
  }

  if (featureFlags.languageSelection && !gateDone) {
    return <Redirect href="/language" />;
  }

  return <Redirect href="/home" />;
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    backgroundColor: color.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
