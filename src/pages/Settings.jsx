import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, apiError } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { useTheme } from "../theme/ThemeContext";
import Toast from "../components/Toast";

/** Account, appearance, and public-link controls — all wired to real APIs. */
export default function Settings() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState(null);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get("/portfolio").then((res) => setPortfolio(res.data)).catch(() => setPortfolio(null));
  }, []);

  const publicUrl = portfolio?.username ? `${window.location.origin}/portfolio/${portfolio.username}` : "";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setToast("Public link copied ✓");
      setTimeout(() => setToast(""), 2200);
    } catch {
      setError("Could not access the clipboard — copy the link manually.");
    }
  };

  const togglePublish = async () => {
    if (!portfolio) return;
    setBusy(true);
    setError("");
    try {
      const { data } = await api.put("/portfolio", { ...portfolio, published: !portfolio.published });
      setPortfolio(data);
      setToast(data.published ? "Portfolio is live" : "Portfolio unpublished");
      setTimeout(() => setToast(""), 2200);
    } catch (err) {
      setError(apiError(err, "Could not update publishing"));
    } finally {
      setBusy(false);
    }
  };

  const signOut = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="display text-3xl">Settings</h1>
      <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>Account, appearance, and your public presence.</p>

      <section className="solid card mt-5 p-6" aria-label="Account">
        <h2 className="font-extrabold">Account</h2>
        <div className="mt-3 grid gap-2 text-sm">
          <p><span style={{ color: "var(--muted)" }}>Name:</span> <strong>{user?.name}</strong></p>
          <p><span style={{ color: "var(--muted)" }}>Email:</span> <strong>{user?.email}</strong></p>
          <p><span style={{ color: "var(--muted)" }}>User ID:</span> <strong>#{user?.id}</strong></p>
        </div>
        <p className="mt-2 text-xs" style={{ color: "var(--muted)" }}>
          Signed in with JWT · password stored as BCrypt hash, never shown.
        </p>
      </section>

      <section className="solid card mt-4 p-6" aria-label="Appearance">
        <h2 className="font-extrabold">Appearance</h2>
        <div className="mt-3 grid grid-cols-2 gap-2" role="radiogroup" aria-label="Theme">
          {[
            ["paper", "Paper light", "Default · lime actions"],
            ["carbon", "Carbon dark", "Dark option · lime accents"],
          ].map(([value, name, desc]) => (
            <button
              key={value}
              role="radio"
              aria-checked={theme === value}
              onClick={() => setTheme(value)}
              className="rounded-xl border p-3 text-left"
              style={{ borderColor: theme === value ? "var(--brand)" : "var(--line)", background: theme === value ? "var(--chip)" : "transparent" }}
            >
              <span className="text-sm font-bold">{name}</span>
              <span className="block text-xs" style={{ color: "var(--muted)" }}>{desc}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="solid card mt-4 p-6" aria-label="Public presence">
        <h2 className="font-extrabold">Public presence</h2>
        {!portfolio ? (
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <p className="text-sm" style={{ color: "var(--muted)" }}>No public username claimed yet.</p>
            <Link to="/preview" className="btn-brand ml-auto px-4 py-2 text-sm">Set up publishing →</Link>
          </div>
        ) : (
          <div className="mt-3 space-y-3">
            <p className="text-sm">
              <span style={{ color: "var(--muted)" }}>Status:</span>{" "}
              <strong style={{ color: portfolio.published ? "var(--brand)" : "var(--warn)" }}>
                {portfolio.published ? "● Live" : "○ Draft"}
              </strong>
            </p>
            {portfolio.published && (
              <div className="flex flex-wrap items-center gap-2">
                <code className="chip px-3 py-1.5 text-xs">{publicUrl}</code>
                <button onClick={copy} className="btn-ghost px-3 py-1.5 text-xs font-semibold">Copy link</button>
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              <button onClick={togglePublish} disabled={busy} className="btn-ghost px-4 py-2 text-sm font-semibold">
                {portfolio.published ? "Unpublish" : "Publish now"}
              </button>
              <Link to="/preview" className="btn-ghost px-4 py-2 text-sm font-semibold">Open preview →</Link>
            </div>
          </div>
        )}
        {error && <p role="alert" className="mt-2 text-sm font-medium" style={{ color: "var(--danger)" }}>{error}</p>}
      </section>

      <section className="solid card mt-4 p-6" aria-label="Session">
        <h2 className="font-extrabold">Session</h2>
        <button onClick={signOut} className="btn-danger-ghost mt-3 px-4 py-2 text-sm font-semibold">Sign out</button>
      </section>
      <Toast message={toast} />
    </div>
  );
}
