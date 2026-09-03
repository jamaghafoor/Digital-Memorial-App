import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../api/client';
import type { Memorial, User } from '../types';
export function DashboardPage() {
  const { t } = useTranslation(); const [memorials, setMemorials] = useState<Memorial[]>([]); const [users, setUsers] = useState<User[]>([]);
  useEffect(() => { void Promise.all([api.get('/admin/memorials'), api.get('/admin/users')]).then(([m, u]) => { setMemorials(m.data); setUsers(u.data); }); }, []);
  const stats = [[t('totalUsers'), users.length], [t('totalMemorials'), memorials.length], [t('pending'), memorials.filter((m) => m.status === 'pending').length], [t('approved'), memorials.filter((m) => m.status === 'approved').length]];
  return <><div className="page-heading"><p className="eyebrow">{t('admin')}</p><h1>{t('dashboard')}</h1></div><div className="stats-grid">{stats.map(([label, value]) => <article className="stat" key={label}><span>{label}</span><strong>{value}</strong></article>)}</div></>;
}
