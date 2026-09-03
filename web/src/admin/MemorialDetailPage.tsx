import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api/client';
import { LoadingState } from '../components/LoadingState';
import { MemorialDesign } from '../components/MemorialDesign';
import type { Memorial } from '../types';

export function MemorialDetailPage() {
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [item, setItem] = useState<Memorial>();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyAction, setBusyAction] = useState<'save' | 'approve' | 'reject'>();

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    setItem(undefined);
    try {
      const response = await api.get('/admin/memorials');
      setItem(response.data.find((memorial: Memorial) => memorial._id === id));
    } catch (requestError: any) {
      setError(requestError.response?.data?.message ?? t('loadError'));
    } finally {
      setLoading(false);
    }
  }, [id, t]);

  useEffect(() => { void load(); }, [load]);

  const act = async (action: 'approve' | 'reject') => {
    setBusyAction(action);
    setError('');
    try {
      await api.put(`/admin/memorials/${id}/${action}`);
      navigate('/admin/memorials');
    } catch (requestError: any) {
      setError(requestError.response?.data?.message ?? t('actionError'));
      setBusyAction(undefined);
    }
  };

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusyAction('save');
    setError('');
    try {
      const fields = new FormData(event.currentTarget);
      const response = await api.put(`/admin/memorials/${id}`, Object.fromEntries(fields.entries()));
      setItem(response.data);
      setEditing(false);
    } catch (requestError: any) {
      setError(requestError.response?.data?.message ?? t('actionError'));
    } finally {
      setBusyAction(undefined);
    }
  };

  if (loading) return <LoadingState message={t('loadingMemorialDetails')} />;
  if (!item) return <div className="request-error" role="alert"><p>{error || t('notFound')}</p><button className="button" onClick={() => void load()}>{t('retry')}</button></div>;
  const busy = Boolean(busyAction);

  return <><Link className="back-link" to="/admin/memorials">← {t('back')}</Link>{error && <p className="alert" role="alert">{error}</p>}<div className="review-grid" aria-busy={busy}><MemorialDesign memorial={item} compact /><section className="review-panel"><div className="row"><div><p className="eyebrow">{t('review')}</p><h1>{item.fullName}</h1></div><span className={`status ${item.status}`}>{t(item.status)}</span></div>{editing ? <form className="edit-form" onSubmit={save}>{['fullName', 'birthDate', 'deathDate', 'relationship', 'religion', 'message'].map((field) => <label key={field}>{field}<input disabled={busy} name={field} type={field.includes('Date') ? 'date' : 'text'} defaultValue={field.includes('Date') ? item[field as 'birthDate'].slice(0, 10) : String(item[field as keyof Memorial])} /></label>)}<button className="button primary action-loading-button" disabled={busy}>{busyAction === 'save' && <span className="button-spinner" aria-hidden="true" />}{busyAction === 'save' ? t('savingChanges') : t('save')}</button></form> : <><dl className="detail-list"><div><dt>{t('relationship')}</dt><dd>{item.relationship}</dd></div><div><dt>Religion / type</dt><dd>{item.religion}</dd></div><div><dt>{t('reminder')}</dt><dd>{item.reminderEnabled ? t('yes') : t('no')}</dd></div><div><dt>Template</dt><dd>{item.template}</dd></div></dl><p className="message-text">“{item.message}”</p></>}<div className="action-row"><button className="button" disabled={busy} onClick={() => setEditing(!editing)}>{t('edit')}</button><button className="button danger action-loading-button" disabled={busy} onClick={() => void act('reject')}>{busyAction === 'reject' && <span className="button-spinner dark" aria-hidden="true" />}{busyAction === 'reject' ? t('rejectingMemorial') : t('reject')}</button><button className="button primary action-loading-button" disabled={busy} onClick={() => void act('approve')}>{busyAction === 'approve' && <span className="button-spinner" aria-hidden="true" />}{busyAction === 'approve' ? t('approvingMemorial') : t('approve')}</button></div>{busyAction && <span className="sr-status" role="status" aria-live="polite">{busyAction === 'save' ? t('savingChanges') : busyAction === 'approve' ? t('approvingMemorial') : t('rejectingMemorial')}</span>}</section></div></>;
}
