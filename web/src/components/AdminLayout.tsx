import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LanguagePicker } from './LanguagePicker';
export function AdminLayout() {
  const { t } = useTranslation(); const navigate = useNavigate();
  return <div className="admin-shell"><aside><div className="admin-brand"><span className="brand-symbol">E</span><div><strong>{t('brand')}</strong><small>{t('admin')}</small></div></div><nav>
    <NavLink end to="/admin">{t('dashboard')}</NavLink><NavLink to="/admin/memorials">{t('memorials')}</NavLink><NavLink to="/admin/users">{t('users')}</NavLink>
  </nav><button className="text-button" onClick={() => { localStorage.removeItem('adminToken'); navigate('/admin/login'); }}>{t('logout')}</button></aside>
  <main className="admin-main"><header><LanguagePicker /></header><Outlet /></main></div>;
}
