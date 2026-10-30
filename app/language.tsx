import { LinearGradient } from 'expo-linear-gradient';
import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { featureFlags } from '../src/config/features';
import { OptionRow } from '../src/components/ui/Selectable';
import { PrimaryButton } from '../src/components/ui/PrimaryButton';
import { Screen } from '../src/components/ui/Screen';
import { useSettings } from '../src/domain/settings/SettingsContext';
import type { ContentLanguage, InterfaceLanguage } from '../src/domain/settings/types';
import { translate } from '../src/i18n';
import { markLanguageGateComplete } from '../src/storage/onboarding';
import { alpha, color, space } from '../src/theme/tokens';
import { family, type } from '../src/theme/typography';
import { HERO_HOME, WORDMARK } from '../src/components/brand/gameArt';

/** The room, cropped to a band: the first thing a new player sees. */
const HERO_HEIGHT = 300;

const AMHARIC = '\u1328\u1228\u1243 \u1328\u12CB\u1273';

/**
 * First-launch language gate. Content language applies to all five game decks.
 */
export default function LanguageGateScreen() {
  const { settings, setLanguages } = useSettings();
  const [interfaceLanguage, setInterfaceLanguage] = useState<InterfaceLanguage>(
    settings.interfaceLanguage,
  );
  const [contentLanguage, setContentLanguage] = useState<ContentLanguage>(
    settings.contentLanguage,
  );
  // Preview copy in the language being chosen before persist.
  const t = (key: Parameters<typeof translate>[1]) => translate(interfaceLanguage, key);
  const uiFont = interfaceLanguage === 'am' ? family.ethiopic.medium : undefined;
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const onContinue = async () => {
    setLanguages(interfaceLanguage, contentLanguage);
    await markLanguageGateComplete();
    router.replace('/home');
  };

  if (!featureFlags.languageSelection) {
    return <Redirect href="/home" />;
  }

  return (
    // Top edge by hand so the room runs under the status bar.
    <Screen accent={color.brandPrimary} edges={['bottom']}>
      <View style={styles.root}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.hero, { height: HERO_HEIGHT + insets.top }]}>
            <Image
              source={HERO_HOME.source}
              style={{ width, height: width / HERO_HOME.aspect }}
              resizeMode="cover"
              accessibilityElementsHidden
            />
            <LinearGradient
              colors={[alpha(color.void, 0.65), alpha(color.void, 0)]}
              style={styles.heroTopScrim}
            />
            <LinearGradient
              colors={[alpha(color.background, 0), color.background]}
              style={styles.heroBottomFade}
            />
          </View>

          <View style={styles.brand}>
            <Image
              source={WORDMARK.source}
              style={{ width: 230, height: 230 / WORDMARK.aspect }}
              resizeMode="contain"
              accessibilityLabel="Chereka Chewata"
            />
            <Text style={styles.amharic}>{AMHARIC}</Text>
            <Text style={[type.body, styles.subtitle, uiFont ? { fontFamily: uiFont } : null]}>
              {t('language.title')}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[type.eyebrow, styles.label, uiFont ? { fontFamily: uiFont } : null]}>
              {t('language.interface')}
            </Text>
            <OptionRow
              title={t('language.english')}
              description={t('language.interfaceEn')}
              selected={interfaceLanguage === 'en'}
              onPress={() => setInterfaceLanguage('en')}
              accent={color.brandPrimary}
            />
            <OptionRow
              title={t('language.amharic')}
              description={`${AMHARIC} — ${t('language.interfaceAm')}`}
              selected={interfaceLanguage === 'am'}
              onPress={() => setInterfaceLanguage('am')}
              accent={color.brandPrimary}
            />
          </View>

          <View style={styles.section}>
            <Text style={[type.eyebrow, styles.label, uiFont ? { fontFamily: uiFont } : null]}>
              {t('language.content')}
            </Text>
            <OptionRow
              title={t('language.english')}
              description={t('language.contentEn')}
              selected={contentLanguage === 'en'}
              onPress={() => setContentLanguage('en')}
              accent={color.brandPrimary}
            />
            <OptionRow
              title={t('language.amharic')}
              description={t('language.contentAm')}
              selected={contentLanguage === 'am'}
              onPress={() => setContentLanguage('am')}
              accent={color.brandPrimary}
            />
            <OptionRow
              title={t('language.mixed')}
              description={t('language.contentMixed')}
              selected={contentLanguage === 'mixed'}
              onPress={() => setContentLanguage('mixed')}
              accent={color.brandPrimary}
            />
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <LinearGradient
            colors={['transparent', color.void]}
            style={styles.footerScrim}
            pointerEvents="none"
          />
          <PrimaryButton
            label={t('common.continue')}
            icon="chevronRight"
            onPress={() => void onContinue()}
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: space[4],
    paddingBottom: space[6],
    gap: space[6],
  },
  hero: {
    marginHorizontal: -space[4],
    overflow: 'hidden',
  },
  heroTopScrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  heroBottomFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 140,
  },
  brand: {
    alignItems: 'center',
    gap: space[2],
    // The logo sits on the faded foot of the room.
    marginTop: -110,
  },
  amharic: {
    color: color.brandPrimary,
    fontFamily: family.ethiopic.medium,
    fontSize: 18,
  },
  subtitle: {
    color: color.textPrimary,
    textAlign: 'center',
    marginTop: space[2],
  },
  section: {
    gap: space[3],
  },
  label: {
    color: color.textMuted,
  },
  footer: {
    paddingHorizontal: space[4],
    paddingTop: space[3],
    paddingBottom: space[3],
  },
  footerScrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: '100%',
    height: space[8],
  },
});
