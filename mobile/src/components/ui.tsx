import React, { type PropsWithChildren } from 'react';
import { ActivityIndicator, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

export const colors = { ink: '#20221f', muted: '#74756f', gold: '#a98b55', paper: '#f7f6f1', white: '#fff', line: '#deddd5', danger: '#913b34' };

export function Screen({ children, scroll = false }: PropsWithChildren<{ scroll?: boolean }>) {
  const Container = scroll ? require('react-native').ScrollView : View;
  return <SafeAreaView style={s.safe}><Container style={s.screen} contentContainerStyle={scroll ? s.scroll : undefined}>{children}</Container></SafeAreaView>;
}

export function Field({ label, ...props }: TextInputProps & { label: string }) {
  return <View style={s.field}><Text style={s.label}>{label}</Text><TextInput placeholderTextColor="#999" style={[s.input, props.multiline && s.multiline]} {...props} /></View>;
}

export function Button({ title, onPress, kind = 'primary', disabled = false, loading = false }: { title: string; onPress: () => void; kind?: 'primary' | 'outline' | 'danger'; disabled?: boolean; loading?: boolean }) {
  const isDisabled = disabled || loading;
  const foreground = kind === 'primary' ? colors.white : kind === 'danger' ? colors.danger : colors.ink;
  return <Pressable accessibilityRole="button" accessibilityState={{ busy: loading, disabled: isDisabled }} disabled={isDisabled} onPress={onPress} style={({ pressed }) => [s.button, s[kind], pressed && { opacity: .8 }, isDisabled && { opacity: .55 }]}><View style={s.buttonContent}>{loading && <ActivityIndicator size="small" color={foreground} />}<Text style={[s.buttonText, { color: foreground }]}>{title}</Text></View></Pressable>;
}

export function Loading({ message, compact = false }: { message?: string; compact?: boolean }) {
  return <View style={[s.loading, compact && s.loadingCompact]} accessibilityRole="progressbar" accessibilityLabel={message}><ActivityIndicator color={colors.gold} />{message && <Text style={[s.loadingText, compact && s.loadingTextCompact]}>{message}</Text>}</View>;
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  screen: { flex: 1, padding: 20 },
  scroll: { paddingBottom: 38 },
  field: { gap: 7, marginBottom: 15 },
  label: { fontSize: 13, color: colors.muted, fontWeight: '600' },
  input: { borderWidth: 1, borderColor: colors.line, borderRadius: 6, paddingHorizontal: 13, paddingVertical: 12, color: colors.ink, backgroundColor: colors.white },
  multiline: { minHeight: 105, textAlignVertical: 'top' },
  button: { padding: 14, borderRadius: 6, alignItems: 'center', borderWidth: 1, marginVertical: 5 },
  buttonContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 },
  primary: { backgroundColor: colors.ink, borderColor: colors.ink },
  outline: { backgroundColor: colors.white, borderColor: colors.line },
  danger: { backgroundColor: colors.white, borderColor: '#d7aaa5' },
  buttonText: { fontWeight: '700' },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: colors.paper },
  loadingCompact: { flex: 0, flexDirection: 'row', paddingVertical: 14, gap: 10 },
  loadingText: { color: colors.muted, marginTop: 12, textAlign: 'center' },
  loadingTextCompact: { marginTop: 0 },
});
