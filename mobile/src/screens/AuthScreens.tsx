import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, Field, Screen, colors } from '../components/ui';
import { useAuth } from '../services/auth';
import type { RootStackParams } from '../types';

export function LoginScreen({ navigation }: NativeStackScreenProps<RootStackParams, 'Auth'>) {
  const { t } = useTranslation();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    try { setBusy(true); await login(email, password); }
    catch (error: any) { Alert.alert(t('login'), error.response?.data?.message ?? error.message); }
    finally { setBusy(false); }
  };
  return <Screen><View style={s.hero}><Text style={s.symbol}>E</Text><Text style={s.brand}>{t('brand')}</Text><Text style={s.subtitle}>{t('welcome')}</Text></View><Field label={t('email')} value={email} onChangeText={setEmail} editable={!busy} autoCapitalize="none" keyboardType="email-address" /><Field label={t('password')} value={password} onChangeText={setPassword} editable={!busy} secureTextEntry /><Button title={busy ? t('signingIn') : t('login')} onPress={submit} loading={busy} /><Button title={t('register')} kind="outline" disabled={busy} onPress={() => navigation.navigate('Register')} /></Screen>;
}

export function RegisterScreen({ navigation }: NativeStackScreenProps<RootStackParams, 'Register'>) {
  const { t } = useTranslation();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    try { setBusy(true); await register(name, email, password); }
    catch (error: any) { Alert.alert(t('register'), error.response?.data?.message ?? error.message); }
    finally { setBusy(false); }
  };
  return <Screen><Text style={s.title}>{t('register')}</Text><Field label={t('name')} value={name} onChangeText={setName} editable={!busy} /><Field label={t('email')} value={email} onChangeText={setEmail} editable={!busy} autoCapitalize="none" /><Field label={t('password')} value={password} onChangeText={setPassword} editable={!busy} secureTextEntry /><Button title={busy ? t('creatingAccount') : t('register')} onPress={submit} loading={busy} /><Button title={t('login')} kind="outline" disabled={busy} onPress={() => navigation.goBack()} /></Screen>;
}
const s=StyleSheet.create({hero:{alignItems:'center',paddingVertical:55},symbol:{width:58,height:58,borderWidth:1,borderColor:colors.gold,borderRadius:29,textAlign:'center',textAlignVertical:'center',fontFamily:'serif',fontSize:24,color:colors.gold},brand:{fontFamily:'serif',fontSize:32,fontWeight:'600',color:colors.ink,marginTop:14},subtitle:{color:colors.muted,marginTop:5},title:{fontFamily:'serif',fontSize:30,color:colors.ink,marginVertical:35}});
