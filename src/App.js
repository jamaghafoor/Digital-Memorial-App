import { useEffect, useState } from "react";
import {
  Link,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { BrowserRouter } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api, clearSession, readSessionUser, saveSession } from "./api";
import "./App.css";

const formatDate = (value) =>
  value
    ? new Intl.DateTimeFormat(undefined, {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date(value))
    : "";
const lifeDates = (card) =>
  [formatDate(card.birthDate), formatDate(card.deathDate)]
    .filter(Boolean)
    .join(" — ");
const setMeta = (property, content) => {
  let tag = document.querySelector(`meta[property="${property}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("property", property);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
};
const initialCard = {
  name: "",
  bio: "",
  birthDate: "",
  deathDate: "",
  epitaph: "",
  imageUrl: "",
  headstoneDesignId: "",
  isPublic: true,
  reminderDate: "",
  reminderPhone: "",
};

function Layout({ user, onLogout, children }) {
  const { t, i18n } = useTranslation();
  const language = i18n.language.startsWith("es") ? "es" : "en";
  const switchLanguage = (next) => {
    i18n.changeLanguage(next);
    localStorage.setItem("memory-card-language", next);
    if (user)
      api("/auth/me", {
        method: "PATCH",
        body: JSON.stringify({ preferredLanguage: next }),
      }).catch(() => {});
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

function CardTile({ card }) {
  return (
    <Link to={`/memory/${card._id}`} className="memory-tile">
      <div className="tile-image">
        {card.imageUrl ? (
          <img src={card.imageUrl} alt="" />
        ) : (
          <div className="image-placeholder">✦</div>
        )}
      </div>
      <div className="tile-copy">
        <h3>{card.name}</h3>
        <p>{lifeDates(card)}</p>
        {card.epitaph && <span>“{card.epitaph}”</span>}
      </div>
    </Link>
  );
}

function Home() {
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

function Auth({ onLogin }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [register, setRegister] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await api(`/auth/${register ? "register" : "login"}`, {
        method: "POST",
        body: JSON.stringify({ ...form, preferredLanguage: i18n.language }),
      });
      saveSession(data);
      onLogin(data.user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <main className="auth-page">
      <section className="auth-card">
        <p className="eyebrow">
          {register ? "Begin a tribute" : "Welcome back"}
        </p>
        <h1>{register ? "Create your account" : "Sign in to Memory Card"}</h1>
        <p className="muted">
          {register
            ? "Start preserving a life and the memories around it."
            : "Manage your memorials and welcome new tributes."}
        </p>
        <form onSubmit={submit}>
          {register && (
            <label>
              Your name
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </label>
          )}
          <label>
            Email address
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </label>
          <label>
            Password
            <input
              required
              minLength="8"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </label>
          {error && <p className="form-error">{error}</p>}
          <button className="solid-button full" disabled={loading}>
            {loading
              ? "Please wait…"
              : register
                ? "Create account"
                : t("signIn")}
          </button>
        </form>
        <button
          className="text-button auth-switch"
          onClick={() => setRegister(!register)}
        >
          {register
            ? "Already have an account? Sign in"
            : "New here? Create an account"}
        </button>
      </section>
    </main>
  );
}

function Search() {
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

function Dashboard({ user }) {
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

function CardEditor() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialCard);
  const [designs, setDesigns] = useState([]);
  const [designError, setDesignError] = useState("");
  const [error, setError] = useState("");
  const editing = id !== "new";
  useEffect(() => {
    api("/designs")
      .then(({ designs: result }) => {
        if (!Array.isArray(result)) {
          throw new Error("The API returned an invalid headstone-design list.");
        }
        setDesigns(result);
      })
      .catch((err) => {
        setDesigns([]);
        setDesignError(`Unable to load headstone designs: ${err.message}`);
      });
    if (editing)
      api(`/cards/${id}`)
        .then(({ card }) =>
          setForm({
            ...initialCard,
            ...card,
            birthDate: card.birthDate?.slice(0, 10) || "",
            deathDate: card.deathDate?.slice(0, 10) || "",
          }),
        )
        .catch((err) => setError(err.message));
  }, [id, editing]);
  const field = (name) => (e) =>
    setForm({
      ...form,
      [name]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
    });
  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api(editing ? `/cards/${id}` : "/cards", {
        method: editing ? "PATCH" : "POST",
        body: JSON.stringify(form),
      });
      navigate("/dashboard", { state: { notice: "Memory saved successfully." } });
    } catch (err) {
      setError(err.message);
    }
  };
  return (
    <main className="page editor">
      <Link className="back-link" to="/dashboard">
        ← Back to my memories
      </Link>
      <div className="editor-heading">
        <p className="eyebrow">
          {editing ? "Carefully updating" : "A lasting tribute"}
        </p>
        <h1>{editing ? "Edit memory" : "Create a memory card"}</h1>
      </div>
      <form className="editor-form" onSubmit={submit}>
        <section>
          <h2>About their life</h2>
          <label>
            Full name
            <input
              required
              value={form.name}
              onChange={field("name")}
              placeholder="e.g. Eleanor May Carter"
            />
          </label>
          <div className="two-col">
            <label>
              Birth date
              <input
                type="date"
                value={form.birthDate}
                onChange={field("birthDate")}
              />
            </label>
            <label>
              Date of passing
              <input
                type="date"
                value={form.deathDate}
                onChange={field("deathDate")}
              />
            </label>
          </div>
          <label>
            Short biography
            <textarea
              value={form.bio}
              onChange={field("bio")}
              placeholder="Share the moments, values, and loves that made them unforgettable."
            />
          </label>
          <label>
            Epitaph or message
            <input
              value={form.epitaph}
              onChange={field("epitaph")}
              placeholder="Always in our hearts"
            />
          </label>
          <label>
            Photo URL
            <input
              type="url"
              value={form.imageUrl}
              onChange={field("imageUrl")}
              placeholder="https://…"
            />
          </label>
        </section>
        <section>
          <h2>Memorial details</h2>
          <label>
            Headstone design
            <select
              value={form.headstoneDesignId || ""}
              onChange={field("headstoneDesignId")}
            >
              <option value="">No design selected</option>
              {designs.map((design) => (
                <option key={design._id} value={design._id}>
                  {design.name} — {design.category}
                </option>
              ))}
            </select>
          </label>
          {designError && <p className="form-error">{designError}</p>}
          {designs.length > 0 && (
            <div className="design-options">
              {designs.map((design) => (
                <button
                  type="button"
                  onClick={() =>
                    setForm({ ...form, headstoneDesignId: design._id })
                  }
                  className={
                    form.headstoneDesignId === design._id ? "chosen" : ""
                  }
                  key={design._id}
                >
                  <img src={design.imageUrl} alt="" />
                  <span>{design.name}</span>
                </button>
              ))}
            </div>
          )}
          <label className="toggle-row">
            <input
              type="checkbox"
              checked={form.isPublic}
              onChange={field("isPublic")}
            />
            <span>
              <strong>
                {form.isPublic ? t("public") : t("private")} memory
              </strong>
              <small>
                Private memories are visible only from your dashboard.
              </small>
            </span>
          </label>
        </section>
        <section>
          <h2>
            Annual reminder <span className="optional">Optional</span>
          </h2>
          <p className="muted">
            We’ll text you when an important day approaches.
          </p>
          <div className="two-col">
            <label>
              Month & day
              <input
                type="text"
                value={form.reminderDate}
                onChange={field("reminderDate")}
                placeholder="MM-DD (e.g. 08-21)"
                pattern="(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])"
              />
            </label>
            <label>
              Mobile number
              <input
                type="tel"
                value={form.reminderPhone}
                onChange={field("reminderPhone")}
                placeholder="+1 555 000 0000"
              />
            </label>
          </div>
        </section>
        {error && <p className="form-error">{error}</p>}
        <div className="form-actions">
          <Link className="outline-button" to="/dashboard">
            {t("cancel")}
          </Link>
          <button className="solid-button">{t("save")}</button>
        </div>
      </form>
    </main>
  );
}

function ShareButtons({ card }) {
  const { t } = useTranslation();
  const url = card.publicUrl || window.location.href;
  const encoded = encodeURIComponent(url);
  const copy = async () => {
    await navigator.clipboard?.writeText(url);
    window.alert("Link copied to your clipboard.");
  };
  return (
    <div className="share">
      <span>{t("share")}</span>
      <button onClick={copy}>Copy link</button>
      <a
        target="_blank"
        rel="noreferrer"
        href={`https://www.facebook.com/sharer/sharer.php?u=${encoded}`}
      >
        Facebook
      </a>
      <a
        target="_blank"
        rel="noreferrer"
        href={`https://wa.me/?text=${encoded}`}
      >
        WhatsApp
      </a>
      <a
        target="_blank"
        rel="noreferrer"
        href={`https://twitter.com/intent/tweet?url=${encoded}&text=${encodeURIComponent(`Remembering ${card.name}`)}`}
      >
        X
      </a>
      <a
        href={`mailto:?subject=${encodeURIComponent(`Remembering ${card.name}`)}&body=${encoded}`}
      >
        Email
      </a>
    </div>
  );
}

function Guestbook({ cardId }) {
  const { t } = useTranslation();
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState({ authorName: "", message: "" });
  const [notice, setNotice] = useState("");
  const load = () =>
    api(`/guestbook/card/${cardId}`).then(({ entries: result }) =>
      setEntries(result),
    );
  useEffect(() => {
    load();
  }, [cardId]); // eslint-disable-line react-hooks/exhaustive-deps
  const submit = async (e) => {
    e.preventDefault();
    try {
      const response = await api(`/guestbook/card/${cardId}`, {
        method: "POST",
        body: JSON.stringify(form),
      });
      setNotice(response.message);
      setForm({ authorName: "", message: "" });
    } catch (error) {
      setNotice(error.message);
    }
  };
  return (
    <section className="guestbook">
      <p className="eyebrow">Words from the heart</p>
      <h2>{t("guestbook")}</h2>
      <div className="tribute-list">
        {entries.map((entry) => (
          <article key={entry._id}>
            <strong>{entry.authorName}</strong>
            <time>{formatDate(entry.createdAt)}</time>
            <p>{entry.message}</p>
          </article>
        ))}
        {!entries.length && (
          <p className="muted">No tributes have been approved yet.</p>
        )}
      </div>
      <form className="tribute-form" onSubmit={submit}>
        <h3>{t("leaveTribute")}</h3>
        <input
          required
          value={form.authorName}
          onChange={(e) => setForm({ ...form, authorName: e.target.value })}
          placeholder="Your name"
        />
        <textarea
          required
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          placeholder="Share a memory or message of comfort…"
        />
        <button className="solid-button">Send tribute</button>
        {notice && <p className="muted">{notice}</p>}
      </form>
    </section>
  );
}

function MemoryPage() {
  const { id } = useParams();
  const [card, setCard] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    api(`/cards/public/${id}`)
      .then(({ card: result }) => {
        setCard(result);
        document.title = `${result.name} | Memory Card`;
        const copy =
          result.epitaph || result.bio || `Remembering ${result.name}`;
        const description = document.querySelector('meta[name="description"]');
        if (description) description.content = copy;
        setMeta("og:title", `Remembering ${result.name}`);
        setMeta("og:description", copy);
        setMeta(
          "og:image",
          result.imageUrl || `${window.location.origin}/logo512.png`,
        );
      })
      .catch((err) => setError(err.message));
  }, [id]);
  if (error)
    return (
      <main className="page not-found">
        <h1>This memory is unavailable.</h1>
        <p>{error}</p>
        <Link to="/">Return home</Link>
      </main>
    );
  if (!card)
    return (
      <main className="page">
        <p className="muted">Opening this memory…</p>
      </main>
    );
  return (
    <main className="memory-page">
      <section className="memory-hero">
        {card.imageUrl && (
          <div className="memory-photo">
            <img src={card.imageUrl} alt={card.name} />
          </div>
        )}
        <div className="memory-main">
          <p className="eyebrow">In loving memory</p>
          <h1>{card.name}</h1>
          <p className="life-dates">{lifeDates(card)}</p>
          {card.epitaph && <blockquote>“{card.epitaph}”</blockquote>}
          <ShareButtons card={card} />
        </div>
        {card.headstoneDesignId?.imageUrl && (
          <aside className="design-preview">
            <img
              src={card.headstoneDesignId.imageUrl}
              alt={card.headstoneDesignId.name}
            />
            <span>{card.headstoneDesignId.name}</span>
          </aside>
        )}
      </section>
      <section className="memory-content">
        <article>
          <h2>A life remembered</h2>
          <p>
            {card.bio ||
              "Their story will live on in the hearts of everyone who knew and loved them."}
          </p>
        </article>
        <aside className="qr-card">
          <img src={card.qrCode} alt={`QR code for ${card.name}'s memory`} />
          <strong>Carry this memory with you</strong>
          <p>Scan to revisit and share this memorial.</p>
          <a
            className="outline-button"
            download={`${card.name}-memory-qr.png`}
            href={card.qrCode}
          >
            Download QR code
          </a>
        </aside>
      </section>
      <Guestbook cardId={card._id} />
    </main>
  );
}

function AppContent() {
  const [user, setUser] = useState(readSessionUser());
  const logout = () => {
    clearSession();
    setUser(null);
  };
  return (
    <Layout user={user} onLogout={logout}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route
          path="/auth"
          element={
            user ? <Navigate to="/dashboard" /> : <Auth onLogin={setUser} />
          }
        />
        <Route path="/memory/:id" element={<MemoryPage />} />
        <Route
          path="/dashboard"
          element={user ? <Dashboard user={user} /> : <Navigate to="/auth" />}
        />
        <Route
          path="/dashboard/:id"
          element={user ? <CardEditor /> : <Navigate to="/auth" />}
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
