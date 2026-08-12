import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api, saveSession } from "../api";

export default function Auth({ onLogin }) {
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
