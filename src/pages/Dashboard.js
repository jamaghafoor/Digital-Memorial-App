import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api } from "../api";
import { lifeDates } from "../utils";

export default function Dashboard({ user }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [cards, setCards] = useState([]);
  const [error, setError] = useState("");
  const [notice] = useState(location.state?.notice || "");
  
  const load = () =>
    api("/cards/mine")
      .then(({ cards: result }) => setCards(result))
      .catch((err) => setError(err.message));
      
  useEffect(() => {
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  
  useEffect(() => {
    if (location.state?.notice) {
      // Consume the route state so refreshing the dashboard does not show the
      // same success message again.
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.pathname, location.state, navigate]);
  
  const remove = async (id) => {
    if (window.confirm("Delete this memory? This cannot be undone.")) {
      await api(`/cards/${id}`, { method: "DELETE" });
      load();
    }
  };
  
  return (
    <main className="page dashboard">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Your private space</p>
          <h1>{t("dashboard")}</h1>
          <p className="muted">
            Create, manage, and share the lives you hold dear.
          </p>
        </div>
        <button
          className="solid-button"
          onClick={() => navigate("/dashboard/new")}
        >
          + {t("createMemory")}
        </button>
      </div>
      {error && <p className="form-error">{error}</p>}
      {notice && <p className="form-success" role="status">{notice}</p>}
      <div className="dashboard-list">
        {cards.map((card) => (
          <article className="dashboard-card" key={card._id}>
            <div className="mini-image">
              {card.imageUrl && <img src={card.imageUrl} alt="" />}
            </div>
            <div>
              <span className={`badge ${card.isPublic ? "public" : ""}`}>
                {card.isPublic ? t("public") : t("private")}
              </span>
              <h2>{card.name}</h2>
              <p>{lifeDates(card)}</p>
            </div>
            <div className="card-actions">
              <Link to={`/memory/${card._id}`}>View</Link>
              <button onClick={() => navigate(`/dashboard/${card._id}`)}>
                Edit
              </button>
              <button className="danger" onClick={() => remove(card._id)}>
                Delete
              </button>
            </div>
          </article>
        ))}
        {!cards.length && (
          <div className="empty-card">
            Your memories will appear here. Create the first one when you’re
            ready.
          </div>
        )}
      </div>
    </main>
  );
}
