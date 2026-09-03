import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { useTranslation } from 'react-i18next';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { api } from '../api/client';
import { Button, Field, Screen, colors } from '../components/ui';
import type { MemorialDraft, RootStackParams, TabParams, Template } from '../types';

type Props = CompositeScreenProps<BottomTabScreenProps<TabParams, 'Create'>, NativeStackScreenProps<RootStackParams>>;
const options: Template[] = ['christian', 'islamic', 'buddhist', 'floral', 'modern'];

export function CreateMemorialScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState<MemorialDraft>({ fullName: '', photo: '', birthDate: '', deathDate: '', relationship: '', religion: '', message: '', template: 'modern', reminderEnabled: true });
  const [uploading, setUploading] = useState(false);
  const set = (key: keyof MemorialDraft, value: string | boolean) => setDraft((current) => ({ ...current, [key]: value }));

  const pick = async () => {
    const result = await launchImageLibrary({ mediaType: 'photo', quality: .8 });
    const asset = result.assets?.[0];
    if (!asset?.uri) return;
    try {
      setUploading(true);
      const data = new FormData();
      data.append('photo', { uri: asset.uri, type: asset.type ?? 'image/jpeg', name: asset.fileName ?? 'photo.jpg' } as any);
      const response = await api.post('/upload', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      set('photo', response.data.url);
    } catch (error: any) {
      Alert.alert(t('photo'), error.response?.data?.message ?? error.message);
    } finally {
      setUploading(false);
    }
  };

  const preview = () => {
    if (Object.entries(draft).some(([key, value]) => key !== 'reminderEnabled' && !value)) {
      Alert.alert(t('required'));
      return;
    }
    navigation.navigate('Preview', { draft });
  };

  return <Screen scroll><Text style={s.title}>{t('createMemorial')}</Text><Text style={s.label}>{t('photo')}</Text><Pressable accessibilityRole="button" accessibilityState={{ busy: uploading, disabled: uploading }} disabled={uploading} onPress={pick} style={s.photo}>{draft.photo ? <Image source={{ uri: draft.photo }} style={s.photoImage} /> : <Text style={s.photoText}>＋{`\n`}{t('choosePhoto')}</Text>}{uploading && <View style={s.uploadOverlay}><ActivityIndicator color={colors.gold} /><Text style={s.uploadText}>{t('uploadingPhoto')}</Text></View>}</Pressable><Field label={t('fullName')} value={draft.fullName} onChangeText={(value) => set('fullName', value)} /><Field label={t('birthDate')} value={draft.birthDate} onChangeText={(value) => set('birthDate', value)} placeholder="1950-05-10" /><Field label={t('deathDate')} value={draft.deathDate} onChangeText={(value) => set('deathDate', value)} placeholder="2026-08-02" /><Field label={t('relationship')} value={draft.relationship} onChangeText={(value) => set('relationship', value)} /><Field label={t('religion')} value={draft.religion} onChangeText={(value) => set('religion', value)} /><Field label={t('message')} value={draft.message} onChangeText={(value) => set('message', value)} multiline /><Text style={s.label}>{t('template')}</Text><View style={s.templates}>{options.map((option) => <Pressable key={option} onPress={() => set('template', option)} style={[s.template, draft.template === option && s.selected]}><View style={[s.swatch, { backgroundColor: { christian: '#393a36', islamic: '#14332d', buddhist: '#594232', floral: '#413740', modern: '#232523' }[option] }]} /><Text style={s.templateText}>{t(option)}</Text></Pressable>)}</View><View style={s.switchRow}><Text style={s.switchText}>{t('reminder')}</Text><Switch value={draft.reminderEnabled} onValueChange={(value) => set('reminderEnabled', value)} trackColor={{ true: colors.gold }} /></View><Button title={uploading ? t('uploadingPhoto') : t('preview')} disabled={uploading} onPress={preview} /></Screen>;
}

const s = StyleSheet.create({ title: { fontFamily: 'serif', fontSize: 29, fontWeight: '600', color: colors.ink, marginVertical: 22 }, label: { fontSize: 13, color: colors.muted, fontWeight: '600', marginBottom: 8 }, photo: { height: 180, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.line, borderRadius: 6, alignItems: 'center', justifyContent: 'center', marginBottom: 18, overflow: 'hidden' }, photoImage: { width: '100%', height: '100%', borderRadius: 6 }, photoText: { textAlign: 'center', color: colors.gold, lineHeight: 27 }, uploadOverlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: '#fffffff0' }, uploadText: { color: colors.muted, fontWeight: '600' }, templates: { gap: 8, marginBottom: 18 }, template: { flexDirection: 'row', alignItems: 'center', padding: 8, borderWidth: 1, borderColor: colors.line, borderRadius: 5, backgroundColor: '#fff' }, selected: { borderColor: colors.gold, borderWidth: 2 }, swatch: { width: 42, height: 38, borderRadius: 3 }, templateText: { marginLeft: 12, color: colors.ink }, switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 12 }, switchText: { flex: 1, color: colors.ink, paddingRight: 15 } });
