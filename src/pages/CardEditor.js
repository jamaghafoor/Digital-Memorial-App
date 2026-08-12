import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api } from "../api";
import { initialCard } from "../utils";

export default function CardEditor() {
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
