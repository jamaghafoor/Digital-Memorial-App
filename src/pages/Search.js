import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../api";
import CardTile from "../components/CardTile";

export default function Search() {
  const { t } = useTranslation();
  const [params, setParams] = useState(
    new URLSearchParams(window.location.search),
  );
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const run = async (event) => {
    event?.preventDefault();
    setLoading(true);
    try {
      const response = await api(`/cards/search?${params.toString()}`);
      setCards(response.cards);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    run();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  
  return (
    <main className="page search-page">
      <p className="eyebrow">Discover & remember</p>
      <h1>Find a memory</h1>
      <form className="filters" onSubmit={run}>
        <input
          name="q"
          value={params.get("q") || ""}
          onChange={(e) => {
            params.set("q", e.target.value);
            setParams(new URLSearchParams(params));
          }}
          placeholder={t("searchPlaceholder")}
        />
        <label>
          Born after
          <input
            type="date"
            onChange={(e) => {
              e.target.value
                ? params.set("bornAfter", e.target.value)
                : params.delete("bornAfter");
              setParams(new URLSearchParams(params));
            }}
          />
        </label>
        <label>
          Passed after
          <input
            type="date"
            onChange={(e) => {
              e.target.value
                ? params.set("diedAfter", e.target.value)
                : params.delete("diedAfter");
              setParams(new URLSearchParams(params));
            }}
          />
        </label>
        <button className="solid-button">Search</button>
      </form>
      {loading ? (
        <p className="muted">Looking for memories…</p>
      ) : (
        <div className="results-grid">
          {cards.map((card) => (
            <CardTile key={card._id} card={card} />
          ))}
          {!cards.length && (
            <p className="empty-card">No memories matched your search.</p>
          )}
        </div>
      )}
    </main>
  );
}
