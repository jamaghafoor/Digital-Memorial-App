import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import { LoadingState } from '../components/LoadingState';
import type { Memorial, Status } from '../types';

const year = (value: string) => new Date(value).getUTCFullYear();

export function MemorialsPage() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const [items, setItems] = useState<Memorial[]>([]);
  const [filter, setFilter] = useState<Status | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const userId = params.get('userId');

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(false);
    void api.get('/admin/memorials', {
      params: { ...(filter === 'all' ? {} : { status: filter }), ...(userId ? { userId } : {}) },
      signal: controller.signal,
    }).then((response) => setItems(response.data)).catch((requestError) => {
      if (requestError.code !== 'ERR_CANCELED') setError(true);
    }).finally(() => {
      if (!controller.signal.aborted) setLoading(false);
    });
    return () => controller.abort();
  }, [filter, userId, reloadKey]);

  return <><div className="page-heading row"><div><p className="eyebrow">{t('admin')}</p><h1>{t('memorials')}</h1></div><div className="segmented">{(['all', 'pending', 'approved', 'rejected'] as const).map((status) => <button disabled={loading} className={filter === status ? 'active' : ''} onClick={() => setFilter(status)} key={status}>{t(status)}</button>)}</div></div>{loading && <LoadingState message={t('loadingMemorials')} compact />}{error && <div className="request-error" role="alert"><p>{t('loadError')}</p><button className="button" onClick={() => setReloadKey((key) => key + 1)}>{t('retry')}</button></div>}{!error && <div className="table-card" aria-busy={loading}><table><thead><tr><th>{t('memorials')}</th><th>{t('relationship')}</th><th>Status</th><th /></tr></thead><tbody>{items.map((item) => <tr key={item._id}><td><div className="person-cell"><img src={item.photo} alt="" /><div><strong>{item.fullName}</strong><small>{year(item.birthDate)} — {year(item.deathDate)}</small></div></div></td><td>{item.relationship}</td><td><span className={`status ${item.status}`}>{t(item.status)}</span></td><td><Link className="table-link" to={`/admin/memorials/${item._id}`}>{t('review')} →</Link></td></tr>)}</tbody></table>{!loading && !items.length && <p className="empty">{t('noResults')}</p>}</div>}</>;
}
