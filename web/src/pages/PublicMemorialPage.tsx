import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { api } from '../api/client';
import { LanguagePicker } from '../components/LanguagePicker';
import { MemorialDesign } from '../components/MemorialDesign';
import type { Memorial } from '../types';
const date = (value: string) => new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(value));
export function PublicMemorialPage() {
  const { slug } = useParams(); const { t } = useTranslation(); const [memorial, setMemorial] = useState<Memorial>(); const [error, setError] = useState(false); const [copied, setCopied] = useState(false);
  useEffect(() => { api.get(`/memorials/public/${slug}`).then((r) => setMemorial(r.data)).catch(() => setError(true)); }, [slug]);
  useEffect(() => {
    if (!memorial) return;
    document.title = `${t('inMemory')} ${memorial.fullName} | ${t('brand')}`;
    const tags = { 'og:title': `${t('inMemory')} ${memorial.fullName}`, 'og:description': memorial.message, 'og:image': memorial.photo, 'og:url': location.href };
    Object.entries(tags).forEach(([property, content]) => {
      let element = document.head.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null;
      if (!element) { element = document.createElement('meta'); element.setAttribute('property', property); document.head.appendChild(element); }
      element.content = content;
    });
  }, [memorial, t]);
  if (error) return <main className="center-state">{t('notFound')}</main>;
  if (!memorial) return <main className="center-state">{t('loading')}</main>;
  const url = location.href; const shareText = `${t('inMemory')} ${memorial.fullName}`;
  return <main className="public-page"><div className="public-toolbar"><a className="wordmark" href="/">{t('brand')}</a><LanguagePicker /></div><div className="public-grid"><MemorialDesign memorial={memorial} /><section className="memorial-details"><p className="eyebrow">{t('inMemory')}</p><h2>{memorial.fullName}</h2><dl><div><dt>{t('born')}</dt><dd>{date(memorial.birthDate)}</dd></div><div><dt>{t('passed')}</dt><dd>{date(memorial.deathDate)}</dd></div><div><dt>{t('relationship')}</dt><dd>{memorial.relationship}</dd></div></dl><div className="share-actions">
    <a className="button primary" target="_blank" rel="noreferrer" href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}>{t('shareFacebook')}</a>
    <a className="button" target="_blank" rel="noreferrer" href={`https://wa.me/?text=${encodeURIComponent(`${shareText} ${url}`)}`}>{t('shareWhatsApp')}</a>
    <button className="button" onClick={() => { void navigator.clipboard.writeText(url); setCopied(true); }}>{copied ? t('copied') : t('copyLink')}</button>
  </div></section></div></main>;
}
