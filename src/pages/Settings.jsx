import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useTheme } from "../theme/ThemeContext";
import Toast from "../components/Toast";

/** Account, appearance, and session controls — all wired to real APIs. */
export default function Settings() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [toast, setToast] = useState("");

  const signOut = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="display text-3xl">Settings</h1>
      <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>Account, appearance, and session.</p>

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

      <section className="solid card mt-4 p-6" aria-label="Session">
        <h2 className="font-extrabold">Session</h2>
        <button onClick={signOut} className="btn-danger-ghost mt-3 px-4 py-2 text-sm font-semibold">Sign out</button>
      </section>
      <Toast message={toast} />
    </div>
  );
}
