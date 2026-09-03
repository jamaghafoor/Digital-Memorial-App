import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { LanguagePicker } from '../components/LanguagePicker';
export function AdminLoginPage() {
  const { t } = useTranslation(); const navigate = useNavigate(); const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  if (localStorage.getItem('adminToken')) return <Navigate to="/admin" replace />;
  const submit = async (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setBusy(true); setError(''); const data = new FormData(event.currentTarget); try { const response = await api.post('/auth/login', { email: data.get('email'), password: data.get('password') }); if (response.data.user.role !== 'ADMIN') throw new Error('This account is not an administrator'); localStorage.setItem('adminToken', response.data.token); navigate('/admin'); } catch (e: any) { setError(e.response?.data?.message ?? e.message ?? 'Login failed'); } finally { setBusy(false); } };
  return <main className="login-page"><div className="login-language"><LanguagePicker /></div><form className="login-card" onSubmit={submit} aria-busy={busy}><span className="brand-symbol large">E</span><p className="eyebrow">{t('brand')}</p><h1>{t('admin')}</h1>{error && <p className="alert">{error}</p>}<label>{t('email')}<input name="email" type="email" required autoComplete="email" disabled={busy} /></label><label>{t('password')}<input name="password" type="password" required autoComplete="current-password" disabled={busy} /></label><button className="button primary wide action-loading-button" disabled={busy}>{busy && <span className="button-spinner" aria-hidden="true" />}{busy ? t('signingIn') : t('login')}</button>{busy && <span className="sr-status" role="status" aria-live="polite">{t('signingIn')}</span>}</form></main>;
}
