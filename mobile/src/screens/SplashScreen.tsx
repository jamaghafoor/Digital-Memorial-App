import React from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors } from '../components/ui';

export function SplashScreen() {
  const { t } = useTranslation();
  return <SafeAreaView style={styles.page}><View style={styles.content}><Text style={styles.symbol}>E</Text><Text style={styles.brand}>{t('brand')}</Text><ActivityIndicator style={styles.loader} color={colors.gold} /></View></SafeAreaView>;
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.paper },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  symbol: { width: 62, height: 62, borderWidth: 1, borderColor: colors.gold, borderRadius: 31, textAlign: 'center', textAlignVertical: 'center', fontFamily: 'serif', fontSize: 26, color: colors.gold },
  brand: { marginTop: 15, color: colors.ink, fontFamily: 'serif', fontSize: 29, fontWeight: '600' },
  loader: { marginTop: 30 },
});
