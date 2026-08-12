import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api } from "../api";

export default function Layout({ user, onLogout, children }) {
  const { t, i18n } = useTranslation();
  const language = i18n.language.startsWith("es") ? "es" : "en";
  
  const switchLanguage = (next) => {
    i18n.changeLanguage(next);
    localStorage.setItem("memory-card-language", next);
    if (user) {
      api("/auth/me", {
        method: "PATCH",
        body: JSON.stringify({ preferredLanguage: next }),
      }).catch(() => {});
    }
  };
  
  return (
    <>
      <header className="site-header">
        <Link className="brand" to="/">
          <span className="brand-mark">M</span>
          <span>{t("brand")}</span>
        </Link>
        <nav>
          <Link to="/search">{t("findMemory")}</Link>
          {user && <Link to="/dashboard">{t("dashboard")}</Link>}
          {user?.role === "admin" && <Link to="/admin">Admin</Link>}
        </nav>
        <div className="header-actions">
          <select
            aria-label="Language"
            value={language}
            onChange={(e) => switchLanguage(e.target.value)}
          >
            <option value="en">EN</option>
            <option value="es">ES</option>
          </select>
          {user ? (
            <>
              <span className="user-name">{user.name || user.email}</span>
              <button className="text-button" onClick={onLogout}>
                {t("signOut")}
              </button>
            </>
          ) : (
            <Link className="outline-button" to="/auth">
              {t("signIn")}
            </Link>
          )}
          <Link className="solid-button" to={user ? "/dashboard/new" : "/auth"}>
            {t("createMemory")}
          </Link>
        </div>
      </header>
      {children}
      <footer>
        <span className="brand-mark small">M</span> {t("brand")} <span>·</span>{" "}
        Made for remembrance
      </footer>
    </>
  );
}
