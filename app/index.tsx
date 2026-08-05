import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useSettings } from '../src/domain/settings/SettingsContext';
import { hasCompletedLanguageGate } from '../src/storage/onboarding';
import { color } from '../src/theme/tokens';

/**
 * Splash lands here. First launch → language gate. Returning users → Home.
 */
export default function Index() {
  const { ready } = useSettings();
  const [gateDone, setGateDone] = useState<boolean | null>(null);

  useEffect(() => {
    let alive = true;
    void hasCompletedLanguageGate().then((done) => {
      if (alive) setGateDone(done);
    });
    return () => {
      alive = false;
    };
  }, []);

  if (!ready || gateDone === null) {
    return <View style={{ flex: 1, backgroundColor: color.background }} />;
  }

  if (!gateDone) {
    return <Redirect href="/language" />;
  }

  return <Redirect href="/home" />;
}
