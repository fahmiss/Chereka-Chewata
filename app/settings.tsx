import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { MoonMark } from '../src/components/brand/MoonMark';
import { Dialog } from '../src/components/ui/Dialog';
import { IconButton, Screen } from '../src/components/ui/Screen';
import { SecondaryButton } from '../src/components/ui/SecondaryButton';
import { Segmented, Toggle } from '../src/components/ui/Selectable';
import { Surface } from '../src/components/ui/Surface';
import { useSettings } from '../src/domain/settings/SettingsContext';
import type { ContentLanguage, InterfaceLanguage } from '../src/domain/settings/types';
import { useT } from '../src/i18n';
import { color, space } from '../src/theme/tokens';
import { family, type } from '../src/theme/typography';

const AMHARIC = '\u1328\u1228\u1243 \u1328\u12CB\u1273';

export default function SettingsScreen() {
  const {
    settings,
    setSoundEnabled,
    setVibrationEnabled,
    setReduceMotion,
    setInterfaceLanguage,
    setContentLanguage,
    resetCardHistory,
  } = useSettings();
  const { t, uiFont } = useT();
  const [resetVisible, setResetVisible] = useState(false);
  const [resetDone, setResetDone] = useState(false);
  const [privacyVisible, setPrivacyVisible] = useState(false);
  const [termsVisible, setTermsVisible] = useState(false);
  const font = uiFont ? { fontFamily: uiFont } : null;

  return (
    <Screen accent={color.brandPrimary} intensity={0.8}>
      <View style={styles.nav}>
        <IconButton name="arrowLeft" label={t('common.back')} onPress={() => router.back()} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[type.displayLg, styles.title, font]}>{t('settings.title')}</Text>

        <Surface contentStyle={styles.card}>
          <Text style={[type.eyebrow, styles.cardLabel, font]}>{t('settings.language')}</Text>
          <Text style={[type.bodySm, styles.cardBody, font]}>
            {t('settings.interfaceLanguage')}
          </Text>
          <Segmented<InterfaceLanguage>
            accent={color.brandPrimary}
            value={settings.interfaceLanguage}
            onChange={setInterfaceLanguage}
            options={[
              { value: 'en', label: t('language.english') },
              { value: 'am', label: t('language.amharic') },
            ]}
          />
          <Text style={[type.bodySm, styles.cardBody, font]}>
            {t('settings.contentLanguage')}
          </Text>
          <Segmented<ContentLanguage>
            accent={color.gameImpostor}
            value={settings.contentLanguage}
            onChange={setContentLanguage}
            options={[
              { value: 'en', label: t('language.english') },
              { value: 'am', label: t('language.amharic') },
              { value: 'mixed', label: t('language.mixed') },
            ]}
          />
          <Text style={[type.bodySm, styles.cardBody, font]}>{t('settings.contentNote')}</Text>
        </Surface>

        <Surface contentStyle={styles.card}>
          <Text style={[type.eyebrow, styles.cardLabel, font]}>{t('settings.feel')}</Text>
          <Toggle
            label={t('settings.sound')}
            hint={t('settings.soundHint')}
            value={settings.soundEnabled}
            onPress={() => setSoundEnabled(!settings.soundEnabled)}
          />
          <View style={styles.divider} />
          <Toggle
            label={t('settings.vibration')}
            hint={t('settings.vibrationHint')}
            value={settings.vibrationEnabled}
            onPress={() => setVibrationEnabled(!settings.vibrationEnabled)}
          />
          <View style={styles.divider} />
          <Toggle
            label={t('settings.reduceMotion')}
            hint={t('settings.reduceMotionHint')}
            value={settings.reduceMotion}
            onPress={() => setReduceMotion(!settings.reduceMotion)}
          />
        </Surface>

        <Surface contentStyle={styles.card}>
          <Text style={[type.eyebrow, styles.cardLabel, font]}>{t('settings.content')}</Text>
          <Text style={[type.bodySm, styles.cardBody, font]}>{t('settings.resetBody')}</Text>
          <SecondaryButton
            label={t('settings.resetLabel')}
            icon="refresh"
            onPress={() => setResetVisible(true)}
          />
        </Surface>

        <Surface contentStyle={styles.card}>
          <Text style={[type.eyebrow, styles.cardLabel, font]}>{t('settings.about')}</Text>
          <SecondaryButton
            label={t('settings.privacy')}
            icon="eye"
            onPress={() => setPrivacyVisible(true)}
          />
          <Text style={[type.bodySm, styles.cardBody, font]}>{t('settings.privacyHint')}</Text>
          <View style={styles.divider} />
          <SecondaryButton
            label={t('settings.terms')}
            icon="layers"
            onPress={() => setTermsVisible(true)}
          />
          <Text style={[type.bodySm, styles.cardBody, font]}>{t('settings.termsHint')}</Text>
        </Surface>

        <View style={styles.brand}>
          <MoonMark size={38} orbit />
          <Text style={styles.wordmark}>CHEREKA CHEWATA</Text>
          <Text style={styles.amharic}>{AMHARIC}</Text>
          <Text style={[type.mono, styles.version]}>{t('settings.version')}</Text>
        </View>
      </ScrollView>

      <Dialog
        visible={resetVisible}
        icon="refresh"
        accent={color.brandPrimary}
        title={t('settings.resetTitle')}
        message={t('settings.resetMessage')}
        confirmLabel={t('settings.resetConfirm')}
        confirmTone="honey"
        onConfirm={() => {
          void resetCardHistory().then(() => {
            setResetVisible(false);
            setResetDone(true);
          });
        }}
        cancelLabel={t('common.back')}
        onCancel={() => setResetVisible(false)}
      />

      <Dialog
        visible={resetDone}
        icon="checkCircle"
        accent={color.success}
        title={t('settings.resetDoneTitle')}
        message={t('settings.resetDoneMessage')}
        confirmLabel={t('common.gotIt')}
        confirmTone="honey"
        onConfirm={() => setResetDone(false)}
      />

      <Dialog
        visible={privacyVisible}
        moon="ready"
        accent={color.brandPrimary}
        title={t('settings.privacyTitle')}
        message={t('settings.privacyMessage')}
        confirmLabel={t('common.gotIt')}
        confirmTone="honey"
        onConfirm={() => setPrivacyVisible(false)}
      />

      <Dialog
        visible={termsVisible}
        moon="ready"
        accent={color.brandPrimary}
        title={t('settings.termsTitle')}
        message={t('settings.termsMessage')}
        confirmLabel={t('common.gotIt')}
        confirmTone="honey"
        onConfirm={() => setTermsVisible(false)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  nav: {
    paddingHorizontal: space[6],
    paddingTop: space[2],
  },
  content: {
    paddingHorizontal: space[6],
    paddingTop: space[6],
    paddingBottom: space[10],
    gap: space[5],
  },
  title: {
    color: color.textPrimary,
  },
  card: {
    padding: space[5],
    gap: space[4],
  },
  cardLabel: {
    color: color.textMuted,
  },
  cardBody: {
    color: color.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(246,239,226,0.08)',
  },
  brand: {
    alignItems: 'center',
    gap: space[2],
    paddingTop: space[4],
  },
  wordmark: {
    color: color.textPrimary,
    fontFamily: family.display.black,
    fontSize: 15,
    letterSpacing: 3,
    marginTop: space[2],
  },
  amharic: {
    color: color.brandPrimary,
    fontFamily: family.ethiopic.medium,
    fontSize: 14,
  },
  version: {
    color: color.textMuted,
    marginTop: space[2],
  },
});
