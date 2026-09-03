import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../api/client';
import { LoadingState } from '../components/LoadingState';
import type { Memorial, User } from '../types';

export function DashboardPage() {
  const { t } = useTranslation();
  const [memorials, setMemorials] = useState<Memorial[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const [memorialResponse, userResponse] = await Promise.all([api.get('/admin/memorials'), api.get('/admin/users')]);
      setMemorials(memorialResponse.data);
      setUsers(userResponse.data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);
  const stats = [[t('totalUsers'), users.length], [t('totalMemorials'), memorials.length], [t('pending'), memorials.filter((memorial) => memorial.status === 'pending').length], [t('approved'), memorials.filter((memorial) => memorial.status === 'approved').length]];

  return <><div className="page-heading"><p className="eyebrow">{t('admin')}</p><h1>{t('dashboard')}</h1></div>{loading ? <LoadingState message={t('loadingDashboard')} /> : error ? <div className="request-error" role="alert"><p>{t('loadError')}</p><button className="button" onClick={() => void load()}>{t('retry')}</button></div> : <div className="stats-grid">{stats.map(([label, value]) => <article className="stat" key={label}><span>{label}</span><strong>{value}</strong></article>)}</div>}</>;
}
