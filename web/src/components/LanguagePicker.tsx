import { useTranslation } from 'react-i18next';
export function LanguagePicker() {
  const { i18n } = useTranslation();
  return <select className="language-picker" aria-label="Language" value={i18n.language} onChange={(event) => { localStorage.setItem('language', event.target.value); void i18n.changeLanguage(event.target.value); }}>
    <option value="en">English</option><option value="ro">Română</option><option value="hi">हिन्दी</option><option value="zh">简体中文</option><option value="es">Español</option>
  </select>;
}
