import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { LoadingState } from '../components/LoadingState';
import type { User } from '../types';

export function UsersPage() {
  const { t } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(false);
    const timer = setTimeout(() => {
      void api.get('/admin/users', { params: { q: query }, signal: controller.signal }).then((response) => setUsers(response.data)).catch((requestError) => {
        if (requestError.code !== 'ERR_CANCELED') setError(true);
      }).finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    }, 250);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [query, reloadKey]);

  return <><div className="page-heading row"><div><p className="eyebrow">{t('admin')}</p><h1>{t('users')}</h1></div><input className="search-input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`${t('search')}…`} /></div>{loading && <LoadingState message={query.trim() ? t('searchingUsers') : t('loadingUsers')} compact />}{error && <div className="request-error" role="alert"><p>{t('loadError')}</p><button className="button" onClick={() => setReloadKey((key) => key + 1)}>{t('retry')}</button></div>}{!error && <div className="table-card" aria-busy={loading}><table><thead><tr><th>Name</th><th>{t('email')}</th><th>{t('memorials')}</th><th>Role</th></tr></thead><tbody>{users.map((user) => <tr key={user._id}><td><strong>{user.name}</strong></td><td>{user.email}</td><td><Link className="table-link" to={`/admin/memorials?userId=${user._id}`}>{user.memorialCount}</Link></td><td>{user.role}</td></tr>)}</tbody></table>{!loading && !users.length && <p className="empty">{t('noResults')}</p>}</div>}</>;
}
