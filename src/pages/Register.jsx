import { useState } from "react";
import { Link } from "react-router-dom";
import { MailCheck } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { api, apiError } from "../api/client";
import AuthLayout from "../components/AuthLayout";

export default function Register() {
  const { register } = useAuth();
  const [form, setForm] = useState({ username: "", name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [resending, setResending] = useState(false);
  const [resendNote, setResendNote] = useState("");

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const data = await register(form);
      setReceipt({ ...data, email: form.email });
    } catch (err) {
      setError(apiError(err, "Registration failed"));
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    setResending(true);
    setResendNote("");
    try {
      const { data } = await api.post("/auth/resend", { email: receipt.email });
      setReceipt({ ...data, email: receipt.email });
      setResendNote("Verification email sent again. Check your inbox (and spam).");
    } catch (err) {
      setResendNote(apiError(err, "Could not resend right now."));
    } finally {
      setResending(false);
    }
  };

  if (receipt) {
    return (
      <AuthLayout
        title="Check your inbox"
        subtitle={`Account created for ${form.username || "you"}.`}
        footer={<><Link to="/login" className="font-bold underline underline-offset-2" style={{ color: "var(--ink)" }}>Back to login</Link></>}
      >
        <div className="flex items-start gap-3">
          <span className="icon-tile"><MailCheck size={18} /></span>
          <div className="text-sm leading-relaxed">
            <p className="font-bold">Verify your email to activate the account.</p>
            <p className="mt-1" style={{ color: "var(--muted)" }}>{receipt.message}</p>
            {resendNote && <p className="mt-2 font-semibold" style={{ color: "var(--ink)" }}>{resendNote}</p>}
            <button onClick={resend} disabled={resending} className="btn-ghost mt-3 px-3.5 py-2 text-[13px] font-semibold">
              {resending ? "Sending…" : "Resend verification email"}
            </button>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Start your flight"
      subtitle="One account. One profile. One public link."
      footer={<>Have an account? <Link to="/login" className="font-bold underline underline-offset-2" style={{ color: "var(--ink)" }}>Login</Link></>}
    >
      <form onSubmit={submit} noValidate={false}>
        {error && (
          <p role="alert" className="mb-3 rounded-md border-[1.5px] p-2.5 text-[13px] font-semibold" style={{ borderColor: "var(--danger)", background: "var(--chip)", color: "var(--danger)" }}>
            {error}
          </p>
        )}
        <label className="label" htmlFor="username">Username</label>
        <input
          id="username" className="input mt-1" required minLength={3} maxLength={30} autoComplete="username"
          pattern="^[a-z0-9._-]{3,30}$" title="3-30 chars: lowercase letters, digits, dot, underscore, hyphen"
          value={form.username} onChange={set("username")} placeholder="asha-01"
          aria-describedby="username-help"
        />
        <p id="username-help" className="mt-1 text-xs" style={{ color: "var(--muted)" }}>
          Unique, lowercase. You can also sign in with your email.
        </p>
        <label className="label mt-3.5 block" htmlFor="name">Full name</label>
        <input
          id="name" className="input mt-1" required maxLength={100} autoComplete="name"
          value={form.name} onChange={set("name")} placeholder="Asha Sharma"
        />
        <label className="label mt-3.5 block" htmlFor="email">Email</label>
        <input
          id="email" className="input mt-1" type="email" required autoComplete="email"
          value={form.email} onChange={set("email")} placeholder="you@college.edu"
        />
        <label className="label mt-3.5 block" htmlFor="password">Password</label>
        <input
          id="password" className="input mt-1" type="password" required minLength={10} autoComplete="new-password"
          aria-describedby="password-help"
          value={form.password} onChange={set("password")} placeholder="At least 10 characters"
        />
        <p id="password-help" className="mt-1 text-xs" style={{ color: "var(--muted)" }}>
          Minimum 10 characters. Stored as a salted hash — never plaintext.
        </p>
        <button type="submit" disabled={busy} className="btn-brand mt-5 w-full justify-center py-2.5 text-sm">
          {busy ? "Creating account…" : "Create account"}
        </button>
      </form>
    </AuthLayout>
  );
}
