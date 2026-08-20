import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { MoonFace } from '../src/components/brand/MoonFace';
import { OptionRow } from '../src/components/ui/Selectable';
import { PrimaryButton } from '../src/components/ui/PrimaryButton';
import { Screen } from '../src/components/ui/Screen';
import { useSettings } from '../src/domain/settings/SettingsContext';
import type { ContentLanguage, InterfaceLanguage } from '../src/domain/settings/types';
import { translate } from '../src/i18n';
import { markLanguageGateComplete } from '../src/storage/onboarding';
import { color, space } from '../src/theme/tokens';
import { family, type } from '../src/theme/typography';

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

  const onContinue = async () => {
    setLanguages(interfaceLanguage, contentLanguage);
    await markLanguageGateComplete();
    router.replace('/home');
  };

  return (
    <Screen accent={color.brandPrimary}>
      <View style={styles.root}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.brand}>
            <MoonFace expression="ready" size={88} />
            <Text style={styles.wordmark}>CHEREKA</Text>
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
              accent={color.gameImpostor}
            />
            <OptionRow
              title={t('language.amharic')}
              description={t('language.contentAm')}
              selected={contentLanguage === 'am'}
              onPress={() => setContentLanguage('am')}
              accent={color.gameImpostor}
            />
            <OptionRow
              title={t('language.mixed')}
              description={t('language.contentMixed')}
              selected={contentLanguage === 'mixed'}
              onPress={() => setContentLanguage('mixed')}
              accent={color.gameImpostor}
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
    paddingHorizontal: space[6],
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: space[8],
    paddingBottom: space[6],
    gap: space[6],
  },
  brand: {
    alignItems: 'center',
    gap: space[2],
  },
  wordmark: {
    color: color.textPrimary,
    fontFamily: family.display.black,
    fontSize: 34,
    letterSpacing: 4,
  },
  amharic: {
    color: color.brandPrimary,
    fontFamily: family.ethiopic.medium,
    fontSize: 18,
  },
  subtitle: {
    color: color.textSecondary,
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
    paddingTop: space[3],
    paddingBottom: space[3],
  },
  footerScrim: {
    position: 'absolute',
    left: -space[6],
    right: -space[6],
    bottom: '100%',
    height: space[8],
  },
});
