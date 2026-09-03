import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json'; import ro from './locales/ro.json'; import hi from './locales/hi.json'; import zh from './locales/zh.json'; import es from './locales/es.json';
const saved = localStorage.getItem('language') ?? 'en';
void i18n.use(initReactI18next).init({ resources: { en: { translation: en }, ro: { translation: ro }, hi: { translation: hi }, zh: { translation: zh }, es: { translation: es } }, lng: saved, fallbackLng: 'en', interpolation: { escapeValue: false } });
export default i18n;
