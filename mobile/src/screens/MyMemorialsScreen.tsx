import React, { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { api } from '../api/client';
import { MemorialCard } from '../components/MemorialCard';
import { Button, Loading, Screen, colors } from '../components/ui';
import type { Memorial, RootStackParams, TabParams } from '../types';

type Props = CompositeScreenProps<BottomTabScreenProps<TabParams, 'Memorials'>, NativeStackScreenProps<RootStackParams>>;

export function MyMemorialsScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const [items, setItems] = useState<Memorial[]>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);

  const load = useCallback(async (showFullLoader: boolean) => {
    if (showFullLoader) setLoading(true);
    else setRefreshing(true);
    setError(false);
    try {
      const response = await api.get('/memorials/my');
      setItems(response.data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { void load(true); }, [load]));

  if (loading) return <Loading message={t('loadingMyMemorials')} />;
  if (error && !items) return <Screen><View style={s.errorState}><Text style={s.error}>{t('loadError')}</Text><Button title={t('retry')} kind="outline" onPress={() => void load(true)} /></View></Screen>;

  return <Screen><Text style={s.title}>{t('myMemorials')}</Text>{refreshing && <Loading compact message={t('refreshingMemorials')} />}{error && <Text accessibilityRole="alert" style={s.error}>{t('loadError')}</Text>}<FlatList data={items} refreshing={refreshing} onRefresh={() => void load(false)} keyExtractor={(item) => item._id} ListEmptyComponent={<Text style={s.empty}>{t('noMemorials')}</Text>} renderItem={({ item }) => <MemorialCard item={item} onPress={() => navigation.navigate('MemorialDetail', { memorial: item })} />} /></Screen>;
}

const s = StyleSheet.create({ title: { fontFamily: 'serif', fontSize: 29, color: colors.ink, marginVertical: 20 }, empty: { color: colors.muted }, error: { color: colors.danger, textAlign: 'center', paddingVertical: 12 }, errorState: { flex: 1, justifyContent: 'center' } });
