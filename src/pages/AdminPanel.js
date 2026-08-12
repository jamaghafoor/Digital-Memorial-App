import { useState, useEffect, useRef } from "react";
import { api } from "../api";
import AdminUser from "../components/AdminUser";
import "./AdminPanel.css";

const TAB_META = {
  overview:   { label: "Overview",    icon: "⬡" },
  users:      { label: "Users",       icon: "◎" },
  moderation: { label: "Moderation",  icon: "⚑" },
  designs:    { label: "Designs",     icon: "❐" },
  reminders:  { label: "Reminders",   icon: "◷" },
};

const adminTabs = ["overview", "users", "moderation", "designs", "reminders"];

export default function AdminPanel() {
  const [tab, setTab] = useState("overview");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const [moderationType, setModerationType] = useState("tribute");
  const [reminderStatus, setReminderStatus] = useState("");
  const [design, setDesign] = useState({ name: "", imageUrl: "", category: "", tags: "", sortOrder: 0 });
  const requestIdRef = useRef(0);

  const endpoint = () => {
    if (tab === "overview") return "/admin/overview";
    if (tab === "users") return `/admin/users?q=${encodeURIComponent(query)}`;
    if (tab === "moderation") return `/admin/moderation?type=${moderationType}`;
    if (tab === "designs") return "/admin/designs";
    return `/admin/reminders${reminderStatus ? `?status=${reminderStatus}` : ""}`;
  };

  const selectTab = (nextTab) => {
    if (nextTab === tab) return;
    setData(null);
    setLoading(true);
    setTab(nextTab);
  };

  const load = async () => {
    const requestId = ++requestIdRef.current;
    setLoading(true); setError("");
    try {
      const response = await api(endpoint());
      if (requestId === requestIdRef.current) setData(response);
    } catch (err) {
      if (requestId === requestIdRef.current) setError(err.message);
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  };

  useEffect(() => {
    load();
    return () => { requestIdRef.current += 1; };
  }, [tab, moderationType, reminderStatus]); // eslint-disable-line react-hooks/exhaustive-deps

  const action = async (path, body, message) => {
    setError(""); setNotice("");
    try {
      await api(path, { method: "PATCH", body: JSON.stringify(body) });
      setNotice(message); load();
    } catch (err) {
      setError(err.message);
    }
  };

  const uploadDesign = async (event) => {
    event.preventDefault();
    if (!design.name || !design.imageUrl || !design.category) return setError("Design name, image, and category are required.");
    try {
      await api("/designs", {
        method: "POST",
        body: JSON.stringify({
          ...design,
          tags: design.tags.split(",").map((t) => t.trim()).filter(Boolean),
          sortOrder: Number(design.sortOrder) || 0,
        }),
      });
      setDesign({ name: "", imageUrl: "", category: "", tags: "", sortOrder: 0 });
      setNotice("Design added to the library.");
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const readImage = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return setError("Please select an image file.");
    if (file.size > 700000) return setError("Please choose an image smaller than 700 KB.");
    const reader = new FileReader();
    reader.onload = () => setDesign((c) => ({ ...c, imageUrl: reader.result }));
    reader.readAsDataURL(file);
  };

  return (
    <div className="ap-shell">
      {/* ── Sidebar ── */}
      <aside className="ap-sidebar">
        <div className="ap-sidebar-brand">
          <span className="ap-brand-icon">⬡</span>
          <span className="ap-brand-text">Admin</span>
        </div>
        <nav className="ap-nav" role="tablist">
          {adminTabs.map((item) => (
            <button
              key={item}
              role="tab"
              aria-selected={tab === item}
              className={`ap-nav-item ${tab === item ? "ap-nav-item--active" : ""}`}
              onClick={() => selectTab(item)}
            >
              <span className="ap-nav-icon">{TAB_META[item].icon}</span>
              <span className="ap-nav-label">{TAB_META[item].label}</span>
              {tab === item && <span className="ap-nav-indicator" />}
            </button>
          ))}
        </nav>
        <div className="ap-sidebar-footer">
          <span className="ap-sidebar-version">v1.0 · Memorial App</span>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="ap-main">
        <header className="ap-topbar">
          <div className="ap-topbar-left">
            <h1 className="ap-topbar-title">{TAB_META[tab].label}</h1>
            <p className="ap-topbar-sub">Administrator workspace · Memory Card</p>
          </div>
          <div className="ap-topbar-right">
            <span className="ap-live-dot" />
            <span className="ap-live-label">Live</span>
          </div>
        </header>

        {/* Alerts */}
        {error && (
          <div className="ap-alert ap-alert--error">
            <span className="ap-alert-icon">✕</span>
            {error}
          </div>
        )}
        {notice && (
          <div className="ap-alert ap-alert--success">
            <span className="ap-alert-icon">✓</span>
            {notice}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="ap-loading">
            <span className="ap-spinner" />
            <p>Loading data…</p>
          </div>
        ) : (
          <section className="ap-content">

            {/* ── OVERVIEW ── */}
            {tab === "overview" && (
              <div className="ap-overview">
                <div className="ap-stat-grid">
                  {[
                    { label: "Total Users",        value: data.users,                            accent: "#6c8fff", icon: "◎" },
                    { label: "Suspended",           value: data.suspendedUsers,                   accent: "#ff7b7b", icon: "⊘" },
                    { label: "Pending Tributes",    value: data.pendingTributes,                  accent: "#ffb347", icon: "⚑" },
                    { label: "Reported Content",    value: data.reportedTributes + data.reportedMedia, accent: "#ff6b9d", icon: "⚠" },
                    { label: "Reminders Sent",      value: data.reminders.sent  || 0,             accent: "#4ecb71", icon: "◷" },
                    { label: "Reminder Failures",   value: data.reminders.failed || 0,            accent: "#ff7b7b", icon: "✕" },
                  ].map(({ label, value, accent, icon }) => (
                    <article className="ap-stat-card" key={label} style={{ "--accent": accent }}>
                      <div className="ap-stat-icon">{icon}</div>
                      <div className="ap-stat-body">
                        <span className="ap-stat-value">{value}</span>
                        <span className="ap-stat-label">{label}</span>
                      </div>
                      <div className="ap-stat-glow" />
                    </article>
                  ))}
                </div>
              </div>
            )}

            {/* ── USERS ── */}
            {tab === "users" && (
              <div>
                <form className="ap-search-bar" onSubmit={(e) => { e.preventDefault(); load(); }}>
                  <span className="ap-search-icon">⌕</span>
                  <input
                    className="ap-search-input"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by name or email…"
                  />
                  <button className="ap-btn ap-btn--primary" type="submit">Search</button>
                </form>
                <div className="ap-list">
                  {(Array.isArray(data?.users) ? data.users : []).map((item) => (
                    <AdminUser key={item.id} item={item} action={action} />
                  ))}
                  {(!Array.isArray(data?.users) || !data.users.length) && (
                    <div className="ap-empty">No users found.</div>
                  )}
                </div>
              </div>
            )}

            {/* ── MODERATION ── */}
            {tab === "moderation" && (
              <div>
                <div className="ap-pill-tabs">
                  <button
                    className={`ap-pill ${moderationType === "tribute" ? "ap-pill--active" : ""}`}
                    onClick={() => setModerationType("tribute")}
                  >
                    Reported Tributes
                  </button>
                  <button
                    className={`ap-pill ${moderationType === "media" ? "ap-pill--active" : ""}`}
                    onClick={() => setModerationType("media")}
                  >
                    Reported Media
                  </button>
                </div>
                <div className="ap-list">
                  {data.items.map((item) => (
                    <article className="ap-mod-row" key={item._id}>
                      <div className="ap-mod-body">
                        {moderationType === "media" && item.imageUrl && (
                          <img className="ap-mod-thumb" src={item.imageUrl} alt="Reported media" />
                        )}
                        <div className="ap-mod-copy">
                          <strong>{moderationType === "tribute" ? item.authorName : item.name}</strong>
                          <p>{moderationType === "tribute" ? item.message : item.mediaReportReason || "No report reason supplied."}</p>
                          <time>
                            Reported {new Date(moderationType === "tribute" ? item.reportedAt : item.mediaReportedAt).toLocaleDateString()}
                          </time>
                        </div>
                      </div>
                      <div className="ap-mod-actions">
                        {moderationType === "tribute" ? (
                          <>
                            <button className="ap-btn ap-btn--success" onClick={() => action(`/admin/moderation/tributes/${item._id}`, { status: "approved" }, "Tribute approved.")}>Approve</button>
                            <button className="ap-btn ap-btn--ghost"   onClick={() => action(`/admin/moderation/tributes/${item._id}`, { status: "hidden" },   "Tribute hidden.")}>Hide</button>
                            <button className="ap-btn ap-btn--danger"  onClick={() => action(`/admin/moderation/tributes/${item._id}`, { status: "removed" },  "Tribute removed.")}>Remove</button>
                          </>
                        ) : (
                          <>
                            <button className="ap-btn ap-btn--success" onClick={() => action(`/admin/moderation/media/${item._id}`, { status: "clear" },   "Media cleared.")}>Clear</button>
                            <button className="ap-btn ap-btn--ghost"   onClick={() => action(`/admin/moderation/media/${item._id}`, { status: "hidden" },  "Media hidden.")}>Hide</button>
                            <button className="ap-btn ap-btn--danger"  onClick={() => action(`/admin/moderation/media/${item._id}`, { status: "removed" }, "Media removed.")}>Remove</button>
                          </>
                        )}
                      </div>
                    </article>
                  ))}
                  {!data.items.length && <div className="ap-empty">Nothing awaiting moderation.</div>}
                </div>
              </div>
            )}

            {/* ── DESIGNS ── */}
            {tab === "designs" && (
              <div>
                <div className="ap-section-header">
                  <h2 className="ap-section-title">Add New Design</h2>
                </div>
                <form className="ap-design-form" onSubmit={uploadDesign}>
                  <div className="ap-design-form-fields">
                    <input className="ap-input" required value={design.name}      onChange={(e) => setDesign({ ...design, name: e.target.value })}      placeholder="Design name" />
                    <input className="ap-input" required value={design.category}  onChange={(e) => setDesign({ ...design, category: e.target.value })}  placeholder="Category" />
                    <input className="ap-input"         value={design.tags}       onChange={(e) => setDesign({ ...design, tags: e.target.value })}       placeholder="Tags (comma-separated)" />
                    <input className="ap-input" type="number" value={design.sortOrder} onChange={(e) => setDesign({ ...design, sortOrder: e.target.value })} placeholder="Sort order" />
                    <input className="ap-input" type="url"  value={design.imageUrl.startsWith("data:") ? "" : design.imageUrl} onChange={(e) => setDesign({ ...design, imageUrl: e.target.value })} placeholder="Image URL" />
                    <label className="ap-upload-label">
                      <span>⊕ Upload image</span>
                      <input type="file" accept="image/*" onChange={(e) => readImage(e.target.files[0])} />
                    </label>
                  </div>
                  <button className="ap-btn ap-btn--primary ap-btn--wide" type="submit">Add to Library</button>
                </form>

                <div className="ap-section-header" style={{ marginTop: "36px" }}>
                  <h2 className="ap-section-title">Design Library</h2>
                  <span className="ap-badge-count">{data.designs.length} designs</span>
                </div>
                <div className="ap-design-grid">
                  {data.designs.map((item) => (
                    <article className={`ap-design-card ${item.isActive ? "" : "ap-design-card--archived"}`} key={item._id}>
                      <div className="ap-design-img-wrap">
                        <img src={item.imageUrl} alt={item.name} />
                        <span className={`ap-design-badge ${item.isActive ? "ap-design-badge--active" : "ap-design-badge--archived"}`}>
                          {item.isActive ? "Active" : "Archived"}
                        </span>
                      </div>
                      <div className="ap-design-info">
                        <strong>{item.name}</strong>
                        <span>{item.category}</span>
                        <small>{item.tags?.join(", ") || "No tags"}</small>
                        <button
                          className={`ap-btn ${item.isActive ? "ap-btn--ghost" : "ap-btn--success"} ap-btn--sm`}
                          onClick={() => action(`/designs/${item._id}`, { isActive: !item.isActive }, item.isActive ? "Design archived." : "Design restored.")}
                        >
                          {item.isActive ? "Archive" : "Restore"}
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}

            {/* ── REMINDERS ── */}
            {tab === "reminders" && (
              <div>
                <div className="ap-filter-row">
                  <label className="ap-filter-label">Filter by status</label>
                  <div className="ap-pill-tabs">
                    {[["", "All"], ["scheduled", "Scheduled"], ["pending", "Pending"], ["sent", "Sent"], ["failed", "Failed"]].map(([val, lbl]) => (
                      <button
                        key={val}
                        className={`ap-pill ${reminderStatus === val ? "ap-pill--active" : ""}`}
                        onClick={() => setReminderStatus(val)}
                      >
                        {lbl}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="ap-list">
                  {data.reminders.map((item) => (
                    <article className="ap-reminder-row" key={item._id}>
                      <div className="ap-reminder-icon-col">
                        <span className="ap-reminder-icon">◷</span>
                      </div>
                      <div className="ap-reminder-body">
                        <strong>{item.cardId?.name || "Deleted memory"}</strong>
                        <p>{item.recipient} · {item.reminderDate}</p>
                        <time>Scheduled {new Date(item.scheduledFor).toLocaleString()}</time>
                        {item.error && <p className="ap-row-error">{item.error}</p>}
                      </div>
                      <span className={`ap-status-badge ap-status-badge--${item.status}`}>{item.status}</span>
                    </article>
                  ))}
                  {!data.reminders.length && <div className="ap-empty">No reminder records found.</div>}
                </div>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
