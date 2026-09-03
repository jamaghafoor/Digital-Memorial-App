import { useTranslation } from 'react-i18next';
import type { Memorial } from '../types';
const year = (date: string) => new Date(date).getUTCFullYear();
export function MemorialDesign({ memorial, compact = false }: { memorial: Memorial; compact?: boolean }) {
  const { t } = useTranslation();
  return <article className={`memorial-design template-${memorial.template} ${compact ? 'compact' : ''}`}>
    <div className="design-mark" aria-hidden="true">{memorial.template === 'islamic' ? '☾' : memorial.template === 'buddhist' ? '◉' : memorial.template === 'floral' ? '❀' : memorial.template === 'christian' ? '✦' : '◇'}</div>
    <p className="eyebrow">{t('inMemory')}</p>
    <img className="portrait" src={memorial.photo} alt={memorial.fullName} />
    <h1>{memorial.fullName}</h1>
    <p className="years">{year(memorial.birthDate)} — {year(memorial.deathDate)}</p>
    <div className="divider" />
    <blockquote>“{memorial.message}”</blockquote>
  </article>;
}
