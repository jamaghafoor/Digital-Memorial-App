import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { api } from '../api/client';
import { MemorialCard } from '../components/MemorialCard';
import { Button, Loading, colors } from '../components/ui';
import { useAuth } from '../services/auth';
import type { Memorial, RootStackParams, TabParams } from '../types';

type Props = CompositeScreenProps<BottomTabScreenProps<TabParams, 'Home'>, NativeStackScreenProps<RootStackParams>>;

export function HomeScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Memorial[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setSearching(false);
      setSearchError(false);
      return;
    }
    const controller = new AbortController();
    setSearching(true);
    setSearchError(false);
    const timer = setTimeout(() => {
      void api.get('/memorials/search', { params: { q: query }, signal: controller.signal }).then((response) => setResults(response.data)).catch((error) => {
        if (error.code !== 'ERR_CANCELED') setSearchError(true);
      }).finally(() => {
        if (!controller.signal.aborted) setSearching(false);
      });
    }, 300);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [query]);

  return <View style={s.page}><Text style={s.hello}>{t('homeGreeting', { name: user?.name })}</Text><Text style={s.lead}>A quiet place to honour a life and keep their memory close.</Text><Button title={t('createMemorial')} onPress={() => navigation.navigate('Create')} /><Text style={s.heading}>{t('searchMemorials')}</Text><TextInput value={query} onChangeText={setQuery} placeholder={t('searchPlaceholder')} placeholderTextColor="#999" style={s.search} />{searching && <Loading compact message={t('searchingMemorials')} />}{searchError && <Text accessibilityRole="alert" style={s.error}>{t('loadError')}</Text>}<FlatList data={results} keyExtractor={(item) => item._id} renderItem={({ item }) => <MemorialCard item={item} onPress={() => navigation.navigate('MemorialDetail', { memorial: item })} />} ListEmptyComponent={!searching && !searchError && query.trim() ? <Text style={s.empty}>{t('noSearchResults')}</Text> : null} contentContainerStyle={{ paddingTop: 12 }} /></View>;
}

const s = StyleSheet.create({ page: { flex: 1, backgroundColor: colors.paper, padding: 20 }, hello: { fontFamily: 'serif', fontSize: 31, fontWeight: '600', color: colors.ink, marginTop: 15 }, lead: { color: colors.muted, lineHeight: 21, marginVertical: 10, marginBottom: 22 }, heading: { fontFamily: 'serif', fontSize: 21, color: colors.ink, marginTop: 30, marginBottom: 10 }, search: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.line, borderRadius: 6, paddingHorizontal: 14, paddingVertical: 12, color: colors.ink }, error: { color: colors.danger, paddingVertical: 14 }, empty: { color: colors.muted, textAlign: 'center', paddingVertical: 24 } });
