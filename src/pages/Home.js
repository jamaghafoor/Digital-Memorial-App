import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api } from "../api";
import CardTile from "../components/CardTile";

export default function Home() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [cards, setCards] = useState([]);
  
  useEffect(() => {
    api("/cards/search")
      .then(({ cards: result }) => setCards(result.slice(0, 3)))
      .catch(() => {});
  }, []);
  
  return (
    <main>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">A place for every story</p>
          <h1>{t("honor")}</h1>
          <p>{t("honorText")}</p>
          <form
            className="search-box"
            onSubmit={(e) => {
              e.preventDefault();
              navigate(`/search?q=${encodeURIComponent(query)}`);
            }}
          >
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("searchPlaceholder")}
            />
            <button aria-label={t("explore")}>⌕</button>
          </form>
          <div className="hero-links">
            <Link to="/search">
              {t("explore")} <span>→</span>
            </Link>
            <Link to="/dashboard/new">
              {t("createMemory")} <span>→</span>
            </Link>
          </div>
        </div>
        <div className="hero-visual">
          <div className="sun"></div>
          <div className="arch">
            <span>In loving memory</span>
            <strong>
              Forever
              <br />
              remembered
            </strong>
            <i>✦</i>
          </div>
          <div className="sprig">❋</div>
        </div>
      </section>
      <section className="memories-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Stories that live on</p>
            <h2>{t("recent")}</h2>
          </div>
          <Link to="/search">View all →</Link>
        </div>
        <div className="tile-grid">
          {cards.map((card) => (
            <CardTile key={card._id} card={card} />
          ))}
          {!cards.length && (
            <div className="empty-card">
              No public memories yet. Be the first to create one.
            </div>
          )}
        </div>
      </section>
      <section className="comfort-strip">
        <span>❋</span>
        <div>
          <h2>Every life holds a story worth preserving.</h2>
          <p>
            Memory Card gives families a gentle, lasting place to gather around
            the people they love.
          </p>
        </div>
        <span>❋</span>
      </section>
    </main>
  );
}
