import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../api/client'; import type { Memorial, Status } from '../types';
const year = (v: string) => new Date(v).getUTCFullYear();
export function MemorialsPage() {
  const { t } = useTranslation(); const [params] = useSearchParams(); const [items, setItems] = useState<Memorial[]>([]); const [filter, setFilter] = useState<Status | 'all'>('all'); const userId = params.get('userId');
  useEffect(() => { void api.get('/admin/memorials', { params: { ...(filter === 'all' ? {} : { status: filter }), ...(userId ? { userId } : {}) } }).then((r) => setItems(r.data)); }, [filter, userId]);
  return <><div className="page-heading row"><div><p className="eyebrow">{t('admin')}</p><h1>{t('memorials')}</h1></div><div className="segmented">{(['all','pending','approved','rejected'] as const).map((x) => <button className={filter === x ? 'active' : ''} onClick={() => setFilter(x)} key={x}>{t(x)}</button>)}</div></div><div className="table-card"><table><thead><tr><th>{t('memorials')}</th><th>{t('relationship')}</th><th>Status</th><th /></tr></thead><tbody>{items.map((item) => <tr key={item._id}><td><div className="person-cell"><img src={item.photo} alt="" /><div><strong>{item.fullName}</strong><small>{year(item.birthDate)} — {year(item.deathDate)}</small></div></div></td><td>{item.relationship}</td><td><span className={`status ${item.status}`}>{t(item.status)}</span></td><td><Link className="table-link" to={`/admin/memorials/${item._id}`}>{t('review')} →</Link></td></tr>)}</tbody></table>{!items.length && <p className="empty">{t('noResults')}</p>}</div></>;
}
