import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../api";
import { formatDate } from "../utils";

export default function Guestbook({ cardId }) {
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
